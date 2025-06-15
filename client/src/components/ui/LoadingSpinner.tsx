import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-black/10 dark:border-white/10"></div>
        <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-purple-600 dark:border-purple-400 border-t-transparent"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
