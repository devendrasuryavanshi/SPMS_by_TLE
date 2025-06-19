import mongoose from 'mongoose';
import Submission from '../models/submission.model';
import RecommendedProblem from '../models/recommendedProblem.model';
import Problem from '../models/problem.model';
import logger from '../utils/logger.utils';

class RecommendationService {
  private static readonly RECOMMENDATION_DATA_AGE_DAYS = 365;

  private static async getWeakTags(studentId: mongoose.Types.ObjectId): Promise<string[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.RECOMMENDATION_DATA_AGE_DAYS);

    const tagStats = await Submission.aggregate([
      // 1. Filter to the specific student and the last year of submissions
      { $match: { studentId, submissionTime: { $gte: cutoffDate } } },
      // 2. Deconstruct the tags array into separate documents
      { $unwind: '$tags' },
      // 3. Group by tag and count solved vs. failed attempts
      {
        $group: {
          _id: '$tags',
          okCount: { $sum: { $cond: [{ $eq: ['$verdict', 'OK'] }, 1, 0] } },
          failCount: { $sum: { $cond: [{ $ne: ['$verdict', 'OK'] }, 1, 0] } }
        }
      },
      // 4. Filter for tags where failures are greater than successes
      { $match: { $expr: { $gt: ['$failCount', '$okCount'] } } },
      // 5. Sort by the number of failures to find the weakest tags
      { $sort: { failCount: -1 } },
      // 6. to the top 5 weakest tags
      { $limit: 5 },
      // 7. to get just the tag name
      { $project: { _id: 0, tag: '$_id' } }
    ]);

    return tagStats.map(stat => stat.tag);
  }

  static async generateRecommendationsPostSync(
    _newSubmissions: any[],
    studentId: mongoose.Types.ObjectId,
    currentRating: number
  ): Promise<void> {
    const weakTags = await this.getWeakTags(studentId);

    if (weakTags.length === 0) {
      logger.info(`No weak tags found for student ${studentId}. Skipping recommendation.`);
      return;
    }

    logger.info(`Found weak tags for student ${studentId}: ${weakTags.join(', ')}. Finding candidates via database aggregation...`);

    const minRating = currentRating - 200 < 3500 ? currentRating - 200 : 3400;
    const maxRating = currentRating + 200 < 3500 ? currentRating + 200 : 3400;


    // problems that match criteria AND that the user has NOT submitted
    const candidates = await Problem.aggregate([
      // Stage 1: Fast filtering using indexes. Drastically reduce the number of documents
      {
        $match: {
          tags: { $in: weakTags },
          rating: { $gte: minRating, $lte: maxRating },
        },
      },
      // Stage 2: JOIN with the submissions collection to find problems the user has NOT attempted
      {
        $lookup: {
          from: 'submissions', // name of the submissions collection
          let: { problem_id: '$problemId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$problemId', '$$problem_id'] },
                    { $eq: ['$studentId', studentId] },
                  ],
                },
              },
            },
            { $limit: 1 }
          ],
          as: 'studentSubmissions',
        },
      },
      // Stage 3: Filter out problems that have submissions
      {
        $match: {
          studentSubmissions: { $eq: [] },
        },
      },
      // Stage 4: random sample
      { $sample: { size: 200 } },
      {
        $project: {
          studentSubmissions: 0,
        }
      }
    ]);

    if (candidates.length === 0) {
      logger.info(`No suitable new problems found for student ${studentId}.`);
      return;
    }

    candidates.sort((a, b) => {
      const aScore = a.tags.filter((t: string) => weakTags.includes(t)).length * 10 - Math.abs(currentRating - a.rating);
      const bScore = b.tags.filter((t: string) => weakTags.includes(t)).length * 10 - Math.abs(currentRating - b.rating);
      return bScore - aScore;
    });

    const top10 = candidates.slice(0, 10).map(p => ({
      problemId: p.problemId,
      problemName: p.name,
      problemIndex: p.index,
      problemRating: p.rating,
      tags: p.tags,
    }));

    if (top10.length > 0) {
      logger.info(`Generated ${top10.length} recommendations for student ${studentId}.`);
      await RecommendedProblem.findOneAndUpdate(
        { studentId },
        { studentId, problems: top10, lastUpdated: new Date() },
        { upsert: true, new: true }
      );
    }
  }
}

export default RecommendationService;