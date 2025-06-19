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

// valid error messages
const getValidErrorMessage = (error: any): string => {
  if (error instanceof AxiosError) {
    if (error.response?.data?.comment) return `Codeforces API Error: ${error.response.data.comment}`;
    if (error.response?.data) return JSON.stringify(error.response.data);
    if (error.code === 'ECONNABORTED') return 'API request timed out.';
  }
  if (error instanceof Error) return error.message;
  return String(error);
};

// axios instance for Codeforces API
const codeforcesApi = axios.create({
  baseURL: 'https://codeforces.com/api',
  timeout: 30000,
  headers: {
    'User-Agent': 'SPMS/1.0 (spms@gmail.com)'
  }
});

class CodeforcesProfileSyncService {
  // CONFIGURATION
  private static readonly RATE_LIMIT_DELAY_MS = 2000; // 2 seconds between calls
  private static readonly SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
  private static readonly SUBMISSION_PAGE_SIZE = 200; // Fetch submissions in chunks of 200
  private static readonly MAX_CONCURRENT_SYNCS = 5; // Sync up to 5 students in parallel
  private static readonly MAX_DATA_AGE_DAYS = 365; // 1 year

  // STATE
  private static lastApiCallTimestamp = 0;
  private static contestProblemCache = new Map<number, any[]>();

  private static async checkCanSyncAllProfiles(): Promise<boolean> {// check if the last sync was more than 6 hours ago
    const settings = await SystemSetting.findOne();
    if (settings && settings.lastSyncDate && settings.lastSyncDate.getTime() > Date.now() - this.SYNC_INTERVAL_MS) {
      return false;
    }
    return true;
  }

  // rate limit guard for Codeforces API calls
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

  // retry mechanism for Codeforces API calls
  private static async apiGetWithRetry(url: string, retries = 3, backoff = 3000): Promise<any> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      await this.rateLimitGuard();
      try {
        logger.info(`[Attempt ${attempt}/${retries}] Calling API -> ${url}`);
        const res = await codeforcesApi.get(url);
        if (res.data.status !== 'OK') {
          throw new Error(`Codeforces API Error: ${res.data.comment}`);
        }
        return res.data.result;
      } catch (error: any) {
        const axiosError = error as AxiosError;
        const errorMessage = getValidErrorMessage(error);
        const status = axiosError.response?.status;
        logger.warn(`API call failed (Status: ${status}): ${errorMessage}`);

        if (attempt === retries || status === 404 || status === 403) {
          logger.error(`Giving up on ${url} after ${attempt} attempts.`);
          throw error;
        }

        // If the error is 429 (Too Many Requests), wait for a much longer time
        let waitTime = backoff;
        if (status === 429) {
          const retryAfterSeconds = axiosError.response?.headers['retry-after'];
          if (retryAfterSeconds) {
            waitTime = parseInt(retryAfterSeconds, 10) * 1000 + 500; // header + buffer
            logger.warn(`Honoring 'Retry-After' header. Waiting for ${waitTime / 1000}s.`);
          } else {
            waitTime = 10000; // long wait for 429 status
            logger.warn(`Received 429 (Too Many Requests). Applying a longer delay of ${waitTime / 1000}s.`);
          }
        }

        logger.warn(`Retrying in ${waitTime / 1000}s...`);
        await new Promise(r => setTimeout(r, waitTime));
        backoff *= 2;
      }
    }
  }

  // Fetches submissions in pages
  private static async fetchNewSubmissions(handle: string, lastSubmissionTime: Date): Promise<any[]> {
    const allNewSubmissions: any[] = [];
    let from = 1;
    let keepFetching = true;

    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - this.MAX_DATA_AGE_DAYS);

    // The 365-day-ago cutoff
    const syncCutoffDate = new Date(Math.max(
      (lastSubmissionTime || new Date(0)).getTime(),
      oneYearAgo.getTime()
    ));
    logger.info(`Fetching submissions for ${handle} created after ${syncCutoffDate.toISOString()}`);

    while (keepFetching) {
      const url = `/user.status?handle=${handle}&from=${from}&count=${this.SUBMISSION_PAGE_SIZE}`;
      const submissionsPage = await this.apiGetWithRetry(url);

      if (submissionsPage.length === 0) {
        break; // No more submissions to fetch
      }

      const newSubmissionsInPage: any[] = [];
      for (const sub of submissionsPage) {
        const submissionDate = new Date(sub.creationTimeSeconds * 1000);
        if (submissionDate > syncCutoffDate) {
          newSubmissionsInPage.push(sub);
        } else {
          // older than our cutoff. Stop fetching
          keepFetching = false;
          break;
        }
      }

      if (newSubmissionsInPage.length > 0) {
        allNewSubmissions.push(...newSubmissionsInPage);
      }

      if (keepFetching && newSubmissionsInPage.length === submissionsPage.length) {
        from += this.SUBMISSION_PAGE_SIZE;
      } else {
        keepFetching = false;
      }
    }
    logger.info(`Fetched ${allNewSubmissions.length} new submissions for ${handle}.`);
    return allNewSubmissions;
  }

  private static async fetchContests(handle: string) {
    return this.apiGetWithRetry(`/user.rating?handle=${handle}`);
  }

  // to fetch contest problems
  private static async fetchContestProblems(contestId: number): Promise<any[]> {
    if (this.contestProblemCache.has(contestId)) {// check cache
      logger.debug(`Cache HIT for contest problems: ${contestId}`);
      return this.contestProblemCache.get(contestId)!;
    }
    logger.debug(`Cache MISS for contest problems: ${contestId}. Fetching from API.`);

    const result = await this.apiGetWithRetry(`/contest.standings?contestId=${contestId}&from=1&count=1`);

    const problems = result.problems || [];
    this.contestProblemCache.set(contestId, problems);
    return problems;
  }

  // save submissions to db
  private static async saveSubmissions(newSubmissions: any[], student: IStudent): Promise<Date | null> {
    if (newSubmissions.length === 0) return null;

    const submissionDocs = newSubmissions.map(data => ({
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

    try {
      await Submission.insertMany(submissionDocs, { ordered: false });
    } catch (error: any) {
      if (error.code !== 11000) throw error;
      logger.warn(`Duplicate key errors encountered for ${student.codeforcesHandle}, which is acceptable.`);
    }
    return new Date(Math.max(...submissionDocs.map(s => s.submissionTime.getTime())));
  }

  // save contests to db
  private static async saveContests(contests: any[], student: IStudent, allSubmissions: any[]): Promise<Date | null> {
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - this.MAX_DATA_AGE_DAYS);

    // cutoff date for contests
    const syncCutoffDate = new Date(Math.max(
      (student.lastContestTime || new Date(0)).getTime(),
      oneYearAgo.getTime()
    ));

    // older than our cutoff
    const newContests = contests.filter(c => new Date(c.ratingUpdateTimeSeconds * 1000) > syncCutoffDate);
    if (newContests.length === 0) return null;

    const solvedProblemIds = new Set(
      allSubmissions.filter(s => s.verdict === 'OK').map(s => `${s.problem.contestId}-${s.problem.index}`)
    );

    const contestHistoryData: any[] = [];
    logger.info(`Fetching details for ${newContests.length} new contests for ${student.codeforcesHandle} sequentially...`);
    for (const contest of newContests) {
      const contestProblems = await this.fetchContestProblems(contest.contestId);
      const unsolvedCount = contestProblems.reduce((count, problem) =>
        solvedProblemIds.has(`${contest.contestId}-${problem.index}`) ? count : count + 1, 0);

      contestHistoryData.push({
        studentId: student._id,
        contestId: contest.contestId,
        contestName: contest.contestName,
        oldRating: contest.oldRating, newRating: contest.newRating,
        ratingChange: contest.newRating - contest.oldRating,
        rank: contest.rank,
        contestTime: new Date(contest.ratingUpdateTimeSeconds * 1000),
        totalProblems: contestProblems.length,
        problemsUnsolvedCount: unsolvedCount,
      });
    }

    if (contestHistoryData.length > 0) {
      try {
        await ContestHistory.insertMany(contestHistoryData, { ordered: false });
      } catch (error: any) {
        if (error.code !== 11000) throw error;
        logger.warn(`Duplicate key errors during contest insert for ${student.codeforcesHandle}, acceptable.`);
      }
      return new Date(Math.max(...contestHistoryData.map(c => c.contestTime.getTime())));
    }
    return null;
  }

  // sync all profiles
  static async syncAllProfiles(studentIds: mongoose.Types.ObjectId[]): Promise<{ totalStudents: number; successCount: number; errorCount: number; failedIds: { id: mongoose.Types.ObjectId, reason: string }[]; emailStats?: { emailsSent: number; emailsFailed: number; inactiveCount: number } }> {
    if (!this.checkCanSyncAllProfiles()) {// check if sync is allowed
      throw new Error('Please wait! A full profile sync was performed recently. To avoid overwhelming the Codeforces API, you can sync again after 6 hours.');
    }
    let successCount = 0;
    const failedSyncs: { id: mongoose.Types.ObjectId; reason: string }[] = [];
    const totalStudents = studentIds.length;

    logger.info(`Starting STRICTLY SEQUENTIAL sync for ${totalStudents} students to ensure 100% reliability.`);

    let studentIndex = 1;
    for (const studentId of studentIds) {// sequential sync
      logger.info(`--- Processing student ${studentIndex}/${totalStudents} (ID: ${studentId}) ---`);
      try {
        const result = await this.syncSingleProfile(studentId);
        if (result.success) {
          successCount++;
          logger.info(`Successfully synced student ${studentIndex}/${totalStudents}`);
        } else {
          failedSyncs.push({ id: studentId, reason: result.reason || 'Unknown reason' });
          logger.warn(`Failed to sync student ${studentIndex}/${totalStudents}. Reason: ${result.reason}`);
        }
      } catch (error) {
        const errorMessage = getValidErrorMessage(error);
        failedSyncs.push({ id: studentId, reason: errorMessage });
        logger.error(`Unhandled exception for student ${studentIndex}/${totalStudents}: ${errorMessage}`);
      }
      studentIndex++;
    }

    const successRate = totalStudents > 0 ? Math.round((successCount / totalStudents) * 100) : 0;// calculate success rate
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

  // sync a single profile
  static async syncSingleProfile(studentId: mongoose.Types.ObjectId): Promise<{ success: boolean; reason?: string }> {
    const student = await Student.findById(studentId);
    if (!student?.codeforcesHandle) {
      return { success: false, reason: "Student record not found or has no Codeforces handle" };
    }

    await Student.findByIdAndUpdate(studentId, { $set: { syncStatus: 'SYNCING' } });

    try {
      // 1. Fetch only NEW submissions and ALL contests
      const newSubmissions = await this.fetchNewSubmissions(student.codeforcesHandle, student.lastSubmissionTime || new Date(0));
      const allContests = await this.fetchContests(student.codeforcesHandle);

      // 2. Save data to DB
      const [updatedSubmissionTime, updatedContestTime] = await Promise.all([
        this.saveSubmissions(newSubmissions, student),
        this.saveContests(allContests, student, newSubmissions),
      ]);

      // 3. Update student's sync timestamps
      const updateData: any = { lastDataSync: new Date() };
      if (updatedSubmissionTime) updateData.lastSubmissionTime = updatedSubmissionTime;
      if (updatedContestTime) updateData.lastContestTime = updatedContestTime;

      await Student.findByIdAndUpdate(studentId, { $set: updateData });

      // 4. Trigger post-sync services asynchronously 
      await Promise.all([
        RecommendationService.generateRecommendationsPostSync(newSubmissions, studentId, student.rating || 1200),
        inactivityService.checkAndNotifyInactiveStudents(studentId)
      ]).catch(err => {
        logger.error(`Post-sync task failed for student ${student.codeforcesHandle}: ${getValidErrorMessage(err)}`);
      });

      await Student.findByIdAndUpdate(studentId, { $set: { syncStatus: 'SUCCEEDED', lastDataSync: new Date() } });

      logger.info(`Successfully synced student ${student.codeforcesHandle}`);

      return { success: true };

    } catch (error: any) {
      const errorMessage = getValidErrorMessage(error);
      logger.error(`Failed to sync handle '${student.codeforcesHandle}': ${errorMessage}`);

      if (errorMessage.includes("not found")) {
        await Student.findByIdAndUpdate(studentId, { $set: { syncStatus: 'FAILED' } });
        return { success: false, reason: `Handle '${student.codeforcesHandle}' not found (404). Marked as invalid.` };
      }
      if ((error as AxiosError).response?.status === 403) {
        await Student.findByIdAndUpdate(studentId, { $set: { syncStatus: 'FAILED' } });
        return { success: false, reason: `Access forbidden (403) for handle '${student.codeforcesHandle}'.` };
      }
      await Student.findByIdAndUpdate(studentId, { $set: { syncStatus: 'FAILED' } });
      return { success: false, reason: errorMessage };
    }
  }
}

export default CodeforcesProfileSyncService;
