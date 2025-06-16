export interface CodeforcesUser {
  handle: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  organization?: string;
  avatar?: string;
  titlePhoto?: string;
  rank?: string;
  maxRank?: string;
  rating?: number;
  maxRating?: number;
  contribution?: number;
  friendOfCount?: number;
  registrationTimeSeconds?: number;
  lastOnlineTimeSeconds?: number;
}