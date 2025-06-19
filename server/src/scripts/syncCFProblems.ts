import mongoose from 'mongoose';
import axios from 'axios';
import Problem from '../models/problem.model';
import logger from '../utils/logger.utils';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI as string;

async function syncProblemSet() {
  logger.info('Starting Codeforces problem set synchronization...');

  try {
    const response = await axios.get('https://codeforces.com/api/problemset.problems');
    const problemData = response.data;

    if (problemData.status !== 'OK') {
      logger.error('Codeforces API did not return OK status.');
      return;
    }

    const problems = problemData.result.problems.filter((p: any) => p.rating && p.tags?.length > 0);
    logger.info(`Fetched ${problems.length} problems from Codeforces API.`);

    const bulkOps = problems.map((p: any) => ({
      updateOne: {
        filter: { problemId: `${p.contestId}-${p.index}` },
        // $set for fields that might change on existing documents (e.g., rating, tags)
        update: {
          $set: {
            name: p.name,
            rating: p.rating,
            tags: p.tags,
          },
          // $setOnInsert for fields that are immutable and only set upon creation
          $setOnInsert: {
            problemId: `${p.contestId}-${p.index}`,
            contestId: p.contestId,
            index: p.index,
          }
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      logger.info(`Performing bulk write of ${bulkOps.length} operations...`);
      const result = await Problem.bulkWrite(bulkOps, { ordered: false });
      logger.info(`Synchronization complete. Inserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}, Matched: ${result.matchedCount}`);
      if (result.hasWriteErrors()) {
        logger.error('Bulk write encountered errors:', result.getWriteErrors());
      }
    } else {
      logger.info('No problems to update.');
    }

  } catch (error) {
    logger.error('An error occurred during problem set synchronization:', error);
  }
}

mongoose.connect(MONGO_URI).then(async () => {
  logger.info('Database connection successful for sync script.');
  await syncProblemSet();
  await mongoose.disconnect();
  logger.info('Database disconnected.');
  process.exit(0);
}).catch(err => {
  logger.error('Database connection failed for sync script.', err);
  process.exit(1);
});