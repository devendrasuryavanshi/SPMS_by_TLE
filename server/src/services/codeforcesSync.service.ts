import mongoose from "mongoose";
import Submission, { ISubmission } from "../models/submission.model";
import ContestHistory, { IContestHistory } from "../models/contestHistory.model";
import SystemSetting, { ISystemSetting } from '../models/systemSetting.model';
import Student, { IStudent } from "../models/student.model";
import RecommendationService from "./recommendation.service";
import logger from "../utils/logger.utils";
import axios, { AxiosError } from "axios";
import InactivityDetectionService from "./inactivityDetection.service";

const inactivityService = new InactivityDetectionService();

const getValidErrorMessage = (error: any): string => {
  let errorMessage = 'Unknown error';
  if (error.message) errorMessage = error.message;
  else if (error.response?.data) errorMessage = JSON.stringify(error.response.data);
  else if (typeof error === 'string') errorMessage = error;
  else errorMessage = String(error);

  return errorMessage;
};

const codeforcesApi = axios.create({
  baseURL: 'https://codeforces.com/api',
  timeout: 20000,
  headers: {
    'User-Agent': 'SPMS/1.0 (spms@gmail.com)'
  }
});

class CodeforcesProfileSyncService {
  private static readonly RATE_LIMIT_DELAY_MS = 2000;
  private static lastApiCallTimestamp = 0;
  private static SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000;
  private static contestProblemCache = new Map<number, any[]>();

  private static async checkCanSyncAllProfiles(): Promise<boolean> {
    const settings = await SystemSetting.findOne();
    if (settings && settings.lastSyncDate && settings.lastSyncDate.getTime() > Date.now() - this.SYNC_INTERVAL_MS) {
      return false;
    }
    return true;
  }

  private static async rateLimitGuard(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCallTimestamp;

    if (timeSinceLastCall < this.RATE_LIMIT_DELAY_MS) {
      const waitTime = this.RATE_LIMIT_DELAY_MS - timeSinceLastCall;
      logger.debug(`Rate limit guard: waiting for ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastApiCallTimestamp = Date.now();
  }

  private static async apiGetWithRetry(url: string, retries = 3): Promise<any> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      // Wait BEFORE making the request.
      await this.rateLimitGuard();

      try {
        logger.info(`Attempt ${attempt}: Calling API -> ${url}`);
        const res = await codeforcesApi.get(url);
        if (res.data.status !== 'OK') {
          throw new Error(`Codeforces API Error: ${res.data.comment}`);
        }
        return res.data.result;
      } catch (err: any) {
        const status = (err as AxiosError).response?.status;

        if (attempt === retries || status === 404 || status === 403) {
          throw err;
        }

        logger.warn(`API call failed (Status: ${status}). Retrying after a short delay...`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }

  private static async fetchSubmissions(handle: string) {
    return this.apiGetWithRetry(`/user.status?handle=${handle}`);
  }
  private static async fetchContests(handle: string) {
    return this.apiGetWithRetry(`/user.rating?handle=${handle}`);
  }

  private static async fetchContestProblems(contestId: number): Promise<any[]> {
    if (this.contestProblemCache.has(contestId)) {
      logger.debug(`Cache HIT for contest problems: ${contestId}`);
      return this.contestProblemCache.get(contestId)!;
    }
    logger.debug(`Cache MISS for contest problems: ${contestId}. Fetching from API.`);

    const result = await this.apiGetWithRetry(`/contest.standings?contestId=${contestId}&from=1&count=1`);

    const problems = result.problems || [];
    this.contestProblemCache.set(contestId, problems);
    return problems;
  }

  private static async saveSubmissions(submissions: any[], student: IStudent): Promise<Date | null> {
    const lastTime = student.lastSubmissionTime || new Date(0);

    const newSubmissions = submissions
      .filter(sub => new Date(sub.creationTimeSeconds * 1000) > lastTime)
      .map(data => ({
        studentId: student._id,
        submissionId: data.id,
        problemId: `${data.problem.contestId}-${data.problem.index}`,
        problemIndex: data.problem.index,
        problemName: data.problem.name,
        problemRating: data.problem.rating || 0,
        verdict: data.verdict,
        submissionTime: new Date(data.creationTimeSeconds * 1000),
        solved: data.verdict === 'OK',
        tags: data.problem.tags || [],
      }));

    if (newSubmissions.length > 0) {
      try {
        await Submission.insertMany(newSubmissions, { ordered: false });
        return new Date(Math.max(...newSubmissions.map(s => s.submissionTime.getTime())));
      } catch (error: any) {
        // duplicate key errors if a submission was already inserted
        if (error.code === 11000) {
          logger.warn(`Duplicate key error during submission insert for student ${student.codeforcesHandle}, which is acceptable. Continuing.`);
          // max time from the original array as a fallback
          return new Date(Math.max(...newSubmissions.map(s => s.submissionTime.getTime())));
        }
        throw error;
      }
    }

    return null;
  }

  private static async saveContests(contests: any[], student: IStudent, allSubmissions: any[]): Promise<Date | null> {
    const lastTime = student.lastContestTime || new Date(0);

    const newContests = contests.filter(c => new Date(c.ratingUpdateTimeSeconds * 1000) > lastTime);

    if (newContests.length === 0) {
      return null;
    }

    // lookup for solved problems for efficiency
    const solvedProblemIds = new Set(
      allSubmissions
        .filter(s => s.verdict === 'OK')
        .map(s => `${s.problem.contestId}-${s.problem.index}`)
    );

    const contestHistoryData = await Promise.all(newContests.map(async contest => {
      const contestProblems = await this.fetchContestProblems(contest.contestId);
      const totalProblems = contestProblems.length;
      const unsolvedCount = contestProblems.reduce((count, problem) =>
        solvedProblemIds.has(`${contest.contestId}-${problem.index}`) ? count : count + 1,
        0
      );

      return {
        studentId: student._id,
        contestId: contest.contestId,
        contestName: contest.contestName,
        oldRating: contest.oldRating,
        newRating: contest.newRating,
        ratingChange: contest.newRating - contest.oldRating,
        rank: contest.rank,
        contestTime: new Date(contest.ratingUpdateTimeSeconds * 1000),
        totalProblems: totalProblems,
        problemsUnsolvedCount: unsolvedCount,
      };
    }));

    if (contestHistoryData.length > 0) {
      try {
        await ContestHistory.insertMany(contestHistoryData, { ordered: false });
        return new Date(Math.max(...contestHistoryData.map(c => c.contestTime.getTime())));
      } catch (error: any) {
        if (error.code === 11000) {
          logger.warn(`Duplicate key error during contest history insert for student ${student.codeforcesHandle}, which is acceptable. Continuing.`);
          return new Date(Math.max(...contestHistoryData.map(c => c.contestTime.getTime())));
        }
        throw error;
      }
    }

    return null;
  }

  static async syncAllProfiles(studentIds: mongoose.Types.ObjectId[]): Promise<{ totalStudents: number; successCount: number; errorCount: number; failedIds: { id: mongoose.Types.ObjectId, reason: string }[]; emailStats?: { emailsSent: number; emailsFailed: number; inactiveCount: number } }> {
    if (!this.checkCanSyncAllProfiles()) {
      throw new Error('Please wait! A full profile sync was performed recently. To avoid overwhelming the Codeforces API, you can sync again after 6 hours.');
    }
    let successCount = 0;
    const failedSyncs: { id: mongoose.Types.ObjectId; reason: string }[] = [];
    const totalStudents = studentIds.length;

    logger.info(`🔄 Starting STRICTLY SEQUENTIAL sync for ${totalStudents} students to ensure 100% reliability.`);

    let studentIndex = 1;
    for (const studentId of studentIds) {
      logger.info(`--- Processing student ${studentIndex}/${totalStudents} (ID: ${studentId}) ---`);
      try {
        const result = await this.syncSingleProfile(studentId);
        if (result.success) {
          successCount++;
          logger.info(`✅ Successfully synced student ${studentIndex}/${totalStudents}`);
        } else {
          failedSyncs.push({ id: studentId, reason: result.reason || 'Unknown reason' });
          logger.warn(`⚠️ Failed to sync student ${studentIndex}/${totalStudents}. Reason: ${result.reason}`);
        }
      } catch (error) {
        const errorMessage = getValidErrorMessage(error);
        failedSyncs.push({ id: studentId, reason: errorMessage });
        logger.error(`❌ Unhandled exception for student ${studentIndex}/${totalStudents}: ${errorMessage}`);
      }
      studentIndex++;
    }

    const successRate = totalStudents > 0 ? Math.round((successCount / totalStudents) * 100) : 0;
    logger.info(`🎉 Sync completed! Total: ${totalStudents}, Success: ${successCount} (${successRate}%), Errors: ${failedSyncs.length}`);
    if (failedSyncs.length > 0) {
      logger.warn(`Failed Student IDs and reasons: ${JSON.stringify(failedSyncs)}`);
    }

    await SystemSetting.findOneAndUpdate(
      {},
      { lastSyncDate: new Date() },
      { new: true }
    );

    return { totalStudents, successCount, errorCount: failedSyncs.length, failedIds: failedSyncs };
  }

  static async syncSingleProfile(studentId: mongoose.Types.ObjectId): Promise<{ success: boolean; reason?: string }> {
    const student = await Student.findById(studentId);
    if (!student?.codeforcesHandle) {
      return { success: false, reason: "Student has no Codeforces handle" };
    }

    try {
      const submissions = await this.fetchSubmissions(student.codeforcesHandle);
      const contests = await this.fetchContests(student.codeforcesHandle);

      logger.info(`Fetched ${submissions.length} submissions and ${contests.length} contests for student ${student.codeforcesHandle}`);

      const [updatedSubmissionTime, updatedContestTime] = await Promise.all([
        this.saveSubmissions(submissions, student),
        this.saveContests(contests, student, submissions),
      ]);

      const updateData: any = { lastDataSync: new Date() };
      if (updatedSubmissionTime) {
        updateData.lastSubmissionTime = updatedSubmissionTime;
      }
      if (updatedContestTime) {
        updateData.lastContestTime = updatedContestTime;
      }

      const inactivityServiceHandler = async () => {
        try {
          await inactivityService.checkAndNotifyInactiveStudents(studentId);
          logger.info(`Inactivity check completed for student ${student.codeforcesHandle}`);
        } catch (emailError) {
          logger.warn(`Inactivity email check failed for student ${student.codeforcesHandle}:`, emailError);
        }
      }

      await Promise.all([
        RecommendationService.generateRecommendationsPostSync(
          submissions,
          studentId,
          student.rating || 1200
        ),
        Student.findByIdAndUpdate(studentId, { $set: updateData }),
        inactivityServiceHandler()
      ]);

      return { success: true };

    } catch (error: any) {
      const axiosError = error as AxiosError;
      const comment = (axiosError.response?.data as any)?.comment;

      if (axiosError.response?.status === 404 || (comment && comment.includes("not found"))) {
        // student's profile as invalid to avoid future syncs.
        await Student.findByIdAndUpdate(studentId, { $set: { syncStatus: 'INVALID_HANDLE' } });
        return { success: false, reason: `Handle '${student.codeforcesHandle}' not found (404). Marked as invalid.` };
      }

      if (axiosError.response?.status === 403) {
        return { success: false, reason: `Access forbidden (403) for handle '${student.codeforcesHandle}'. Could be an IP flag or private profile.` };
      }

      const errorMessage = getValidErrorMessage(error);
      return { success: false, reason: `A non-retryable error occurred: ${errorMessage}` };
    }
  }
}

export default CodeforcesProfileSyncService;
