import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, Chip, Spinner } from '@nextui-org/react';
import { User, MapPin, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { getRankColor, getRatingColor } from '../../utils/student.utils';
import { SyncedStudent } from '../../hooks/useStudentSync';

interface ProfileHeaderProps {
  student: SyncedStudent;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ student }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  const renderLastSubmission = () => {
    switch (student.syncStatus) {
      case 'PENDING':
      case 'SYNCING':
        return (
          <div className="flex items-center gap-2 text-blue-500">
            <Spinner size="sm" color="current" className="w-4 h-4" />
            <span className="truncate">Syncing Profile...</span>
          </div>
        );
      case 'FAILED':
        return (
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Sync Failed</span>
          </div>
        );
      case 'SUCCEEDED':
        if (student.lastSubmissionTime) {
          return (
            <div className="flex items-center gap-2 text-secondary dark:text-secondary-dark">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Last Submission {getTimeSince(student.lastSubmissionTime)}</span>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2 text-secondary dark:text-secondary-dark">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">No submissions found</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Avatar */}
      <div className="relative">
        {student.avatarUrl ? (
          <Avatar
            src={student.avatarUrl}
            alt={`${student.name}'s avatar`}
            className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-primary/20 dark:border-primary-dark/20"
          />
        ) : (
          <Avatar
            name={student.name.charAt(0).toUpperCase()}
            className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-primary/20 dark:border-primary-dark/20 text-2xl font-bold bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark"
          />
        )}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-3 border-background dark:border-background-dark" />
      </div>

      {/* Student Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
          <h1 className="text-2xl sm:text-3xl py-2 lg:text-4xl font-bold text-text-primary dark:text-text-primary-dark truncate">
            {student.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Chip
              color={getRatingColor(student.rating)}
              variant="light"
              size="sm"
              className="font-semibold"
            >
              {student.rating}
            </Chip>
            <Chip
              color={getRankColor(student.rank)}
              variant="light"
              size="sm"
              className="font-semibold capitalize"
            >
              {student.rank || 'Unrated'}
            </Chip>
          </div>
        </div>

        {/* Meta Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2 text-secondary dark:text-secondary-dark">
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">@{student.codeforcesHandle}</span>
          </div>
          
          {student.country && (
            <div className="flex items-center gap-2 text-secondary dark:text-secondary-dark">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{student.country}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-secondary dark:text-secondary-dark">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Joined {formatDate(student.createdAt)}</span>
          </div>
          
          {renderLastSubmission()}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;