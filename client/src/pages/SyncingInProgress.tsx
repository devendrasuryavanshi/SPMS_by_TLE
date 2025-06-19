import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, Progress } from '@nextui-org/react';
import { Wifi } from 'lucide-react';

interface SyncingInProgressProps {
  avatarUrl?: string;
  name: string;
}

const SyncingInProgress: React.FC<SyncingInProgressProps> = ({ avatarUrl, name }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center p-8 w-full max-w-md mx-auto"
    >
      {/* Pulsing Avatar */}
      <div className="relative mb-6">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -inset-2 rounded-full bg-primary/20 dark:bg-primary-dark/20"
        />
        <Avatar
          src={avatarUrl}
          name={name.charAt(0).toUpperCase()}
          className="w-24 h-24 text-4xl border-4 border-background dark:border-background-dark shadow-lg"
        />
      </div>

      {/* Animated Text */}
      <h2 className="text-2xl font-bold bg-clip-text text-blue-500 dark:text-blue-500">
        Preparing Profile
      </h2>
      <p className="mt-2 text-md text-secondary dark:text-secondary-dark">
        Please wait while we prepare the latest data for <span className="font-semibold text-text-primary dark:text-text-primary-dark">{name}</span>.
      </p>

      {/* Progress Bar and Status Text */}
      <div className="w-full mt-8">
        <Progress
          isIndeterminate
          aria-label="Syncing..."
          size="sm"
          classNames={{
            indicator: "bg-gradient-to-r from-primary to-secondary dark:from-primary-dark dark:to-secondary-dark",
          }}
        />
        <div className="flex items-center justify-center gap-2 mt-3 text-sm text-secondary dark:text-secondary-dark">
          <Wifi className="w-4 h-4 animate-pulse" />
          <span>Syncing...</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SyncingInProgress;