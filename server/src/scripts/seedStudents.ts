import mongoose from 'mongoose';
import Student from '../models/student.model';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

interface ApiUser {
  _id: string;
  handle: string;
  fulllName: string;
  titlePhoto: string;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  email: string;
  country: string;
  originalCountryName: string;
  totalSubmissions: number;
  lastSubmissionDate: string;
}

interface ApiResponse {
  success: boolean;
  totalUsers: number;
  users: ApiUser[];
}

const generatePhoneNumber = (): string => {
  const countryCodes = ['+91', '+1', '+44', '+61', '+81', '+49', '+33', '+86', '+7', '+55'];
  const countryCode = countryCodes[Math.floor(Math.random() * countryCodes.length)];
  const number = Math.floor(Math.random() * 9000000000) + 1000000000;
  return `${countryCode} ${number}`;
};

const generateEmail = (handle: string, fullName: string): string => {
  if (!fullName || fullName === 'Unknown') {
    return `${handle}@gmail.com`;
  }

  const nameParts = fullName.toLowerCase().split(' ');
  const firstName = nameParts[0] || handle;
  const lastName = nameParts[1] || '';
  const randomNum = Math.floor(Math.random() * 999) + 1;

  return `${firstName}.${lastName}${randomNum}@gmail.com`;
};

const seedStudents = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/spms';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    console.log('Fetching data from Codeforces API...');
    const response = await axios.get<ApiResponse>('https://codeforces-lite-dashboard.vercel.app/api/users/list', {
      headers: {
        Cookie: 'authCode=0Ne885d6m4ejpBD81IT066Y2332XiE805i6r5dx1H4tjXTP005wKo08P734fBwdTZ274Y1DK86fWuHvUJJr180K079vetHJ8s2j3Q2GAadAa3x0BbKR33rnl2qk3A05JqfCQ3ZbSmKOzXB8E4HXaOO5gE638g2t6'
      }
    });

    if (!response.data.success) {
      throw new Error('API request failed');
    }

    console.log(`API returned ${response.data.totalUsers} users`);

    // first 100 users
    const apiUsers = response.data.users.slice(0, 100);
    console.log(`🎯 Processing ${apiUsers.length} users...`);

    // transform API data to match our schema
    const students = apiUsers.map((user) => ({
      name: user.fulllName && user.fulllName !== 'Unknown' ? user.fulllName : user.handle,
      avatarUrl: user.titlePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.handle}`,
      email: user.email && user.email !== 'Unknown' ? user.email : generateEmail(user.handle, user.fulllName),
      phoneNumber: generatePhoneNumber(),
      codeforcesHandle: user.handle,
      rating: user.rating || 0,
      maxRating: user.maxRating || user.rating || 0,
      rank: user.rank || 'unrated',
      country: user.originalCountryName || user.country || 'Unknown',
      lastSubmissionTime: user.lastSubmissionDate ? new Date(user.lastSubmissionDate) : new Date(),
      lastDataSync: new Date(),
      inactivityEmailCount: 0,
      autoEmailEnabled: true,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000), // random date in the past
      updatedAt: new Date()
    }));

    const batchSize = 20;
    let insertedCount = 0;

    console.log('Inserting students into database...');

    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);
      try {
        const result = await Student.insertMany(batch, { ordered: false });
        insertedCount += result.length;
        console.log(`📦 Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(students.length / batchSize)} (${result.length} students)`);
      } catch (error: any) {
        if (error.code === 11000) {
          const successfulInserts = error.result?.result?.insertedIds ? Object.keys(error.result.result.insertedIds).length : 0;
          insertedCount += successfulInserts;
          console.log(`Batch ${Math.floor(i / batchSize) + 1}: ${successfulInserts} inserted, some duplicates skipped`);
        } else {
          throw error;
        }
      }
    }

    console.log(`Successfully seeded ${insertedCount} students from API!`);

    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ isActive: true });
    const avgRatingResult = await Student.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$currentRating' } } }
    ]);

    const rankDistribution = await Student.aggregate([
      { $group: { _id: '$rank', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('Database Statistics:');
    console.log('========================');
    console.log(`Total Students: ${totalStudents}`);
    console.log(`Active Students: ${activeStudents} (${Math.round((activeStudents / totalStudents) * 100)}%)`);
    console.log(`Inactive Students: ${totalStudents - activeStudents} (${Math.round(((totalStudents - activeStudents) / totalStudents) * 100)}%)`);
    console.log(`Average Rating: ${Math.round(avgRatingResult[0]?.avgRating || 0)}`);

    console.log('Rank Distribution:');
    rankDistribution.forEach((rank: any) => {
      console.log(`  ${rank._id}: ${rank.count} students`);
    });

    console.log('Sample Countries:');
    const countries = await Student.distinct('country');
    console.log(`Found students from: ${countries.slice(0, 10).join(', ')}${countries.length > 10 ? '...' : ''}`);

  } catch (error) {
    console.error('Error seeding students:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', error.response?.data || error.message);
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

if (require.main === module) {
  seedStudents();
}

export default seedStudents;