import { Request, Response } from 'express';
import Student from '../models/student.model';
import ContestHistory from '../models/contestHistory.model';
import Submission from '../models/submission.model';
import RecommendedProblem from '../models/recommendedProblem.model';
import mongoose, { PipelineStage } from 'mongoose';

type LeanProblem = {
  problemId: string;
  problemName: string;
  problemIndex: string;
  problemRating: number;
  tags: string[];
};

type LeanRecommendedProblem = {
  problems: LeanProblem[];
  updatedAt: Date;
};

// generate codeforces problem link
const generateProblemLink = (problemId: string, problemIndex: string): string => {
  const contestId = problemId.replace(/[^\d]/g, '');
  return `https://codeforces.com/problemset/problem/${contestId}/${problemIndex}`;
};

// get contest history
export const getContestHistory = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { days = '365' } = req.query;

    // validate studentId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }

    // date filter
    const daysNum = parseInt(days as string);
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - daysNum);

    // Aggregation pipeline
    const pipeline: PipelineStage[] = [
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
          contestTime: { $gte: dateFilter }
        }
      },
      {
        $sort: { contestTime: -1 }
      },
      {
        $facet: {
          // Contest list with all details
          contests: [
            {
              $project: {
                contestId: 1,
                contestName: 1,
                ratingChange: 1,
                oldRating: 1,
                newRating: 1,
                rank: 1,
                contestTime: 1,
                totalProblems: 1,
                problemsUnsolvedCount: 1,
                problemsSolved: { $subtract: ['$totalProblems', '$problemsUnsolvedCount'] }
              }
            }
          ],
          // Rating progression data for chart
          ratingProgression: [
            {
              $sort: { contestTime: 1 }
            },
            {
              $project: {
                contestTime: 1,
                newRating: 1,
                contestName: 1
              }
            }
          ],
          // Statistics
          stats: [
            {
              $group: {
                _id: null,
                totalContests: { $sum: 1 },
                totalRatingChange: { $sum: '$ratingChange' },
                avgRank: { $avg: '$rank' },
                bestRank: { $min: '$rank' },
                worstRank: { $max: '$rank' },
                totalProblemsSolved: {
                  $sum: { $subtract: ['$totalProblems', '$problemsUnsolvedCount'] }
                },
                totalProblemsAttempted: { $sum: '$totalProblems' },
                positiveRatingChanges: {
                  $sum: { $cond: [{ $gt: ['$ratingChange', 0] }, 1, 0] }
                },
                negativeRatingChanges: {
                  $sum: { $cond: [{ $lt: ['$ratingChange', 0] }, 1, 0] }
                }
              }
            }
          ]
        }
      }
    ];

    const [result] = await ContestHistory.aggregate(pipeline);

    const contests = result.contests || [];
    const ratingProgression = result.ratingProgression || [];
    const stats = result.stats[0] || {
      totalContests: 0,
      totalRatingChange: 0,
      avgRank: 0,
      bestRank: 0,
      worstRank: 0,
      totalProblemsSolved: 0,
      totalProblemsAttempted: 0,
      positiveRatingChanges: 0,
      negativeRatingChanges: 0
    };

    res.status(200).json({
      success: true,
      data: {
        contests,
        ratingProgression,
        stats: {
          ...stats,
          avgRank: Math.round(stats.avgRank || 0),
          solveRate: stats.totalProblemsAttempted > 0
            ? Math.round((stats.totalProblemsSolved / stats.totalProblemsAttempted) * 100)
            : 0
        },
        filterInfo: {
          days: daysNum,
          dateFrom: dateFilter,
          dateTo: new Date()
        }
      }
    });

  } catch (error: any) {
    // console.error('Error fetching contest history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// get problem solving data for a student
export const getProblemSolvingData = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { days = '30' } = req.query;// default 30 days

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }

    const daysNum = parseInt(days as string);
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - daysNum);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(studentId),
          submissionTime: { $gte: dateFilter }
        }
      },
      {
        $facet: {
          // Most difficult problem solved
          mostDifficultProblem: [
            {
              $match: { solved: true }
            },
            {
              $sort: { problemRating: -1 }
            },
            {
              $limit: 1
            },
            {
              $project: {
                problemName: 1,
                problemRating: 1,
                submissionTime: 1,
                problemId: 1,
                _id: 0
              }
            }
          ],

          // Basic statistics
          basicStats: [
            {
              $group: {
                _id: null,
                totalSubmissions: { $sum: 1 },
                solvedProblems: {
                  $sum: { $cond: ['$solved', 1, 0] }
                },
                uniqueProblemsSolved: {
                  $addToSet: { $cond: ['$solved', '$problemId', null] }
                },
                avgRating: {
                  $avg: { $cond: ['$solved', '$problemRating', null] }
                }
              }
            },
            {
              $project: {
                totalSubmissions: 1,
                solvedProblems: 1,
                totalProblemsSolved: { 
                  $size: { 
                    $filter: { 
                      input: '$uniqueProblemsSolved', 
                      cond: { $ne: ['$$this', null] } 
                    } 
                  } 
                },
                averageRating: { $round: ['$avgRating', 0] }
              }
            }
          ],

          // Rating distribution for bar chart
          ratingDistribution: [
            {
              $match: { solved: true }
            },
            {
              $group: {
                _id: '$problemId',
                problemRating: { $first: '$problemRating' }
              }
            },
            {
              $bucket: {
                groupBy: '$problemRating',
                boundaries: [0, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3500],
                default: '3500+',
                output: {
                  count: { $sum: 1 }
                }
              }
            },
            {
              $project: {
                ratingRange: {
                  $switch: {
                    branches: [
                      { case: { $eq: ['$_id', 0] }, then: '0-799' },
                      { case: { $eq: ['$_id', 800] }, then: '800-999' },
                      { case: { $eq: ['$_id', 1000] }, then: '1000-1199' },
                      { case: { $eq: ['$_id', 1200] }, then: '1200-1399' },
                      { case: { $eq: ['$_id', 1400] }, then: '1400-1599' },
                      { case: { $eq: ['$_id', 1600] }, then: '1600-1799' },
                      { case: { $eq: ['$_id', 1800] }, then: '1800-1999' },
                      { case: { $eq: ['$_id', 2000] }, then: '2000-2199' },
                      { case: { $eq: ['$_id', 2200] }, then: '2200-2399' },
                      { case: { $eq: ['$_id', 2400] }, then: '2400-2599' },
                      { case: { $eq: ['$_id', 2600] }, then: '2600-2799' },
                      { case: { $eq: ['$_id', 2800] }, then: '2800-2999' },
                      { case: { $eq: ['$_id', 3000] }, then: '3000-3499' }
                    ],
                    default: '3500+'
                  }
                },
                count: 1,
                _id: 0
              }
            },
            {
              $sort: { ratingRange: 1 }
            }
          ],

          // Submission heatmap data
          submissionHeatmap: [
            {
              $group: {
                _id: {
                  date: {
                    $dateToString: {
                      format: '%Y-%m-%d',
                      date: '$submissionTime'
                    }
                  }
                },
                count: { $sum: 1 }
              }
            },
            {
              $project: {
                date: '$_id.date',
                count: 1,
                level: {
                  $switch: {
                    branches: [
                      { case: { $eq: ['$count', 0] }, then: 0 },
                      { case: { $lte: ['$count', 2] }, then: 1 },
                      { case: { $lte: ['$count', 5] }, then: 2 },
                      { case: { $lte: ['$count', 10] }, then: 3 },
                      { case: { $lte: ['$count', 15] }, then: 4 }
                    ],
                    default: 5
                  }
                },
                _id: 0
              }
            },
            {
              $sort: { date: 1 }
            }
          ],

          // Tag distribution
          tagDistribution: [
            {
              $match: { solved: true }
            },
            {
              $group: {
                _id: '$problemId',
                tags: { $first: '$tags' }
              }
            },
            {
              $unwind: '$tags'
            },
            {
              $group: {
                _id: '$tags',
                count: { $sum: 1 }
              }
            },
            {
              $sort: { count: -1 }
            },
            {
              $limit: 10
            },
            {
              $project: {
                tag: '$_id',
                count: 1,
                percentage: 1,
                _id: 0
              }
            }
          ],

          // Recent problems
          recentProblems: [
            {
              $match: { solved: true }
            },
            {
              $sort: { submissionTime: -1 }
            },
            {
              $group: {
                _id: '$problemId',
                problemName: { $first: '$problemName' },
                problemRating: { $first: '$problemRating' },
                tags: { $first: '$tags' },
                submissionTime: { $first: '$submissionTime' }
              }
            },
            {
              $sort: { submissionTime: -1 }
            },
            {
              $limit: 10
            },
            {
              $project: {
                problemName: 1,
                problemRating: 1,
                tags: 1,
                solvedAt: '$submissionTime',
                problemUrl: {
                  $concat: [
                    'https://codeforces.com/problemset/problem/',
                    { $toString: { $arrayElemAt: [{ $split: ['$_id', '-'] }, 0] } },
                    '/',
                    { $arrayElemAt: [{ $split: ['$_id', '-'] }, 1] }
                  ]
                },
                _id: 0
              }
            }
          ]
        }
      }
    ];

    const [result] = await Submission.aggregate(pipeline);

    const basicStats = result.basicStats[0] || {
      totalSubmissions: 0,
      solvedProblems: 0,
      totalProblemsSolved: 0,
      averageRating: 0
    };

    // Calculate average problems per day
    const averageProblemsPerDay = daysNum > 0 
      ? Math.round((basicStats.totalProblemsSolved / daysNum) * 100) / 100 
      : 0;

    // percentage to tag distribution
    const tagDistribution = result.tagDistribution.map((tag: any) => ({
      ...tag,
      percentage: Math.round((tag.count / basicStats.totalProblemsSolved) * 100)
    }));

    // Process most difficult problem
    const mostDifficultProblem = result.mostDifficultProblem[0] ? {
      ...result.mostDifficultProblem[0],
      solvedAt: result.mostDifficultProblem[0].submissionTime,
      problemUrl: `https://codeforces.com/problemset/problem/${result.mostDifficultProblem[0].problemId.replace('-', '/')}`
    } : null;

    res.status(200).json({
      success: true,
      data: {
        mostDifficultProblem,
        totalProblemsSolved: basicStats.totalProblemsSolved,
        averageRating: basicStats.averageRating || 0,
        averageProblemsPerDay,
        ratingDistribution: result.ratingDistribution || [],
        submissionHeatmap: result.submissionHeatmap || [],
        tagDistribution: tagDistribution || [],
        recentProblems: result.recentProblems || [],
        filterInfo: {
          days: daysNum,
          dateFrom: dateFilter.toISOString(),
          dateTo: new Date().toISOString()
        }
      }
    });

  } catch (error: any) {
    // console.error('Error fetching problem solving data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// get recommended problems (uniqui feature) - Devendra Suryavanshi
export const getRecommendedProblems = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {// id validation
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }

    const recommendedProblemsDoc = await RecommendedProblem.findOne(
      { studentId: new mongoose.Types.ObjectId(studentId) },
      { problems: 1, updatedAt: 1 }
    )
      .lean<LeanRecommendedProblem>();

    if (!recommendedProblemsDoc) {
      return res.status(404).json({
        success: false,
        message: 'No recommended problems found for this student'
      });
    }

    const problemsWithLinks = recommendedProblemsDoc.problems.map((problem) => ({
      ...problem,
      problemUrl: generateProblemLink(problem.problemId, problem.problemIndex)
    }));

    res.status(200).json({
      success: true,
      data: {
        problems: problemsWithLinks,
        totalProblems: problemsWithLinks.length,
        lastUpdated: recommendedProblemsDoc.updatedAt
      }
    });
  } catch (error: any) {
    // console.error('Error fetching recommended problems:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// auto email toggle
export const toggleAutoEmail = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { autoEmailEnabled } = req.body;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }

    // vlidate autoEmailEnabled
    if (typeof autoEmailEnabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'autoEmailEnabled must be a boolean value'
      });
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      {
        autoEmailEnabled,
        updatedAt: new Date()
      },
      { new: true, select: 'name email autoEmailEnabled inactivityEmailCount lastInactivityEmailSent' }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Auto email ${autoEmailEnabled ? 'enabled' : 'disabled'} for ${student.name}`,
      data: {
        studentId: student._id,
        name: student.name,
        email: student.email,
        autoEmailEnabled: student.autoEmailEnabled,
        inactivityEmailCount: student.inactivityEmailCount,
        lastInactivityEmailSent: student.lastInactivityEmailSent
      }
    });

  } catch (error: any) {
    // console.error('Error toggling auto email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
