import mongoose from 'mongoose';
import Submission from '../models/submission.model';
import RecommendedProblem from '../models/recommendedProblem.model';
import axios from 'axios';

interface CFProblem {
  contestId: number;
  index: string;
  name: string;
  rating: number;
  tags: string[];
}

class RecommendationService {
  private static problemCache: CFProblem[] | null = null;

  private static async getProblemSet(): Promise<CFProblem[] | null> {
    if (this.problemCache) return this.problemCache;
    const res = await axios.get('https://codeforces.com/api/problemset.problems');
    const data = await res.data;
    this.problemCache = data.result.problems.filter((p: any) => p.rating && p.tags);
    return this.problemCache;
  }

  private static async getWeakTags(studentId: mongoose.Types.ObjectId): Promise<string[]> {
    const subs = await Submission.find({ studentId }).select('tags verdict').lean();
    const stats: Record<string, { ok: number; fail: number }> = {};
    subs.forEach(s => {
      s.tags?.forEach(tag => {
        stats[tag] ||= { ok: 0, fail: 0 };
        s.verdict === 'OK' ? stats[tag].ok++ : stats[tag].fail++;
      });
    });
    return Object.entries(stats)
      .filter(([, v]) => v.fail > v.ok)
      .sort(([, a], [, b]) => b.fail - a.fail)
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  static async generateRecommendationsPostSync(submissions: any[], studentId: mongoose.Types.ObjectId, currentRating: number): Promise<void> {
    const problemSet = await this.getProblemSet();
    if (!problemSet) return;
    const weakTags = await this.getWeakTags(studentId);

    const solved = new Set(
      submissions.filter(s => s.verdict === 'OK')
        .map(s => `${s.problem.contestId}-${s.problem.index}`)
    );

    const attempted = new Set(
      submissions.map(s => `${s.problem.contestId}-${s.problem.index}`)
    );

    const candidates: CFProblem[] = [];
    for (const p of problemSet) {
      const key = `${p.contestId}-${p.index}`;
      if (solved.has(key)) continue;
      if (Math.abs(currentRating - p.rating) <= 200 && p.tags.some(tag => weakTags.includes(tag))) {
        candidates.push(p);
      }
      if (candidates.length >= 100) break;
    }

    candidates.sort((a, b) => {
      const aScore =
        a.tags.filter(t => weakTags.includes(t)).length * 10 -
        Math.abs(currentRating - a.rating);
      const bScore =
        b.tags.filter(t => weakTags.includes(t)).length * 10 -
        Math.abs(currentRating - b.rating);
      return bScore - aScore;
    });

    const top10 = candidates.slice(0, 10).map(p => ({
      problemId: `${p.contestId}-${p.index}`,
      problemName: p.name,
      problemIndex: p.index,
      problemRating: p.rating,
      tags: p.tags,
    }));

    if (top10.length) {
      await RecommendedProblem.findOneAndUpdate(
        { studentId },
        { studentId, problems: top10 },
        { upsert: true }
      );
    }
  }
}

export default RecommendationService;