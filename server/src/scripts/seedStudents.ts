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

const generateEmail = (handle: string, fulllName: string): string => {
  if (!fulllName || fulllName === 'Unknown') {
    return `${handle}@gmail.com`;
  }

  const nameParts = fulllName.toLowerCase().split(' ');
  const firstName = nameParts[0] || handle;
  const lastName = nameParts[1] || '';
  const randomNum = Math.floor(Math.random() * 999) + 1;

  return `${firstName}.${lastName}${randomNum}@gmail.com`;
};

const isValidUser = (user: ApiUser): boolean => {
  return (
    typeof user.fulllName === 'string' &&
    user.fulllName !== 'Unknown' &&
    !user.fulllName.toLowerCase().includes('undefined') &&
    user.rating > 0 &&
    user.totalSubmissions > 0
  );
};

const seedStudents = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/spms';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log('📡 Fetching users from Codeforces API...');

    const response = await axios.get<ApiResponse>('https://codeforces-lite-dashboard.vercel.app/api/users/list', {
      headers: {
        Cookie: `authCode=${process.env.AUTH_CODE}` || '',
      }
    });

    if (!response.data.success) throw new Error('API request failed');

    const allUsers = response.data.users;
    console.log(`⚙️ Received ${allUsers.length} users`);

    // 💡 Filter the users based on criteria
    const validUsers = allUsers.filter(isValidUser).slice(0, 100);
    console.log(`✅ Selected ${validUsers.length} users with valid full names and ratings`);

    const students = validUsers.map((user) => ({
      name: user.fulllName,
      avatarUrl: user.titlePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.handle}`,
      email: generateEmail(user.handle, user.fulllName),
      phoneNumber: generatePhoneNumber(),
      codeforcesHandle: user.handle,
      rating: user.rating,
      maxRating: user.maxRating || user.rating,
      rank: user.rank || 'unrated',
      country: user.originalCountryName || user.country || 'Unknown',
      lastSubmissionTime: user.lastSubmissionDate ? new Date(user.lastSubmissionDate) : new Date(),
      lastDataSync: new Date(),
      inactivityEmailCount: 0,
      autoEmailEnabled: true,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }));

    // Inserting in batches
    const batchSize = 20;
    let insertedCount = 0;

    console.log('📥 Inserting students into DB...');

    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);
      try {
        const result = await Student.insertMany(batch, { ordered: false });
        insertedCount += result.length;
        console.log(`🧩 Batch ${i / batchSize + 1}: Inserted ${result.length}`);
      } catch (error: any) {
        if (error.code === 11000) {
          const successfulInserts = error.result?.result?.insertedIds ? Object.keys(error.result.result.insertedIds).length : 0;
          insertedCount += successfulInserts;
          console.log(`⚠️ Duplicates skipped, ${successfulInserts} inserted in batch`);
        } else {
          throw error;
        }
      }
    }

    console.log(`🎉 Done! Seeded ${insertedCount} valid students.`);

  } catch (error) {
    console.error('❌ Seeding error:', error);
    if (axios.isAxiosError(error)) {
      console.error('⚠️ API Error Details:', error.response?.data || error.message);
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Closed MongoDB connection');
    process.exit(0);
  }
};

if (require.main === module) {
  seedStudents();
}

export default seedStudents;