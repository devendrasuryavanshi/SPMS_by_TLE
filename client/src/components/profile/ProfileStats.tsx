import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody, Progress } from '@nextui-org/react';
import { TrendingUp, Star, Trophy, Target, Activity, Calendar } from 'lucide-react';
import { SyncedStudent } from '../../hooks/useStudentSync';

interface ProfileStatsProps {
  student: SyncedStudent;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ student }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getStatValue = (
    value: string | number | undefined, 
    formatter: (val: string) => string = (val) => val, 
    defaultValue: string = 'N/A'
  ): string => {
    if (student.syncStatus !== 'SUCCEEDED') {
      return 'Syncing...';
    }
    if (!value) {
      return defaultValue;
    }
    return formatter(String(value));
  };

  const getRatingProgress = () => {
    if (student.rating === 0) return { progress: 0, nextMilestone: 800 };
    const nextMilestone = Math.ceil(student.rating / 200) * 200;
    const prevMilestone = Math.floor((student.rating - 1) / 200) * 200;
    if (nextMilestone === prevMilestone) return { progress: 100, nextMilestone };
    const progress = ((student.rating - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
    return { progress, nextMilestone };
  };

  const { progress, nextMilestone } = getRatingProgress();

  const getActivityStatus = () => {
    if (student.syncStatus !== 'SUCCEEDED') return { status: 'Calculating...', color: 'default' };
    if (!student.lastSubmissionTime) return { status: 'Unknown', color: 'default' };
    
    const lastActivity = new Date(student.lastSubmissionTime);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince <= 1) return { status: 'Very Active', color: 'success' };
    if (daysSince <= 3) return { status: 'Active', color: 'primary' };
    if (daysSince <= 7) return { status: 'Moderate', color: 'warning' };
    return { status: 'Inactive', color: 'danger' };
  };

  const activityStatus = getActivityStatus();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    });
  };

  const cards = [
    {
      label: 'Current Rating',
      icon: <TrendingUp className="w-5 h-5 text-primary dark:text-primary-dark" />,
      bg: 'bg-primary/10 dark:bg-primary-dark/10',
      value: student.rating
    },
    {
      label: 'Max Rating',
      icon: <Star className="w-5 h-5 text-warning" />,
      bg: 'bg-warning/10',
      value: student.maxRating
    },
    {
      label: `Next: ${nextMilestone}`,
      icon: <Target className="w-5 h-5 text-tertiary dark:text-tertiary-dark" />,
      bg: 'bg-tertiary/10 dark:bg-tertiary-dark/10',
      custom: (
        <Progress
          value={progress}
          size="sm"
          className="mt-1"
          classNames={{
            track: 'bg-secondary/20 dark:bg-secondary-dark/20',
            indicator: 'bg-primary dark:bg-primary-dark'
          }}
        />
      )
    },
    {
      label: 'Activity',
      icon: <Activity className={`w-5 h-5 text-${activityStatus.color}`} />,
      bg: `bg-${activityStatus.color}/10`,
      value: activityStatus.status,
      valueClass: `text-${activityStatus.color} truncate`
    },
    {
      label: 'Last Contest',
      icon: <Trophy className="w-5 h-5 text-accent dark:text-accent-dark" />,
      bg: 'bg-accent/10 dark:bg-accent-dark/10',
      value: getStatValue(student.lastContestTime, formatDate, 'No Contests')
    },
    {
      label: 'Last Sync',
      icon: <Calendar className="w-5 h-5 text-success" />,
      bg: 'bg-success/10',
      value: getStatValue(student.lastDataSync, formatDate)
    }
  ];

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((item, index) => (
        <motion.div key={index} variants={itemVariants}>
          <Card className="h-full border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark rounded-xl">
            <CardBody className="h-full p-2 flex items-center">
              <div className="flex items-center gap-3 w-full">
                <div className={`min-w-10 min-h-10 w-10 h-10 rounded-xl flex items-center justify-center ${item.bg}`}>
                  {item.icon}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[12px] sm:text-sm text-secondary dark:text-secondary-dark truncate">
                    {item.label}
                  </p>
                  {item.custom ? (
                    item.custom
                  ) : (
                    <p className={`text-sm sm:text-base font-semibold text-text-primary dark:text-text-primary-dark ${item.valueClass || ''} truncate whitespace-nowrap overflow-hidden`}>
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProfileStats;