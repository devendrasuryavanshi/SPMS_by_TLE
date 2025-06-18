import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody } from '@nextui-org/react';
import { Users, TrendingUp, Star, Trophy } from 'lucide-react';
import { StudentStatsCardsProps } from '../../types/student.types';

const StudentStatsCards: React.FC<StudentStatsCardsProps> = ({ students, totalCount }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  // students with ratings above 1600
  const expertPlusCount = students.filter(s => (s.rating || 0) >= 1600).length;

  const stats = [
    {
      title: "Total Students",
      value: totalCount,
      icon: <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary dark:text-primary-dark" />,
      bgColor: "bg-primary/10 dark:bg-primary-dark/10"
    },
    {
      title: "Avg Rating",
      value: students.length > 0
        ? Math.round(students.reduce((acc, s) => acc + (s.rating || 0), 0) / students.length)
        : 0,
      icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />,
      bgColor: "bg-warning/10"
    },
    {
      title: "Top Rating",
      value: students.length > 0
        ? Math.max(...students.map(s => s.maxRating || 0))
        : 0,
      icon: <Star className="w-4 h-4 sm:w-5 sm:h-5 text-danger" />,
      bgColor: "bg-danger/10"
    },
    {
      title: "Expert+",
      value: expertPlusCount,
      icon: <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-success" />,
      bgColor: "bg-success/10"
    }
  ];

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => (
        <motion.div key={index} variants={itemVariants}>
          <Card className="border border-secondary/10 dark:border-secondary-dark/10">
            <CardBody className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-secondary dark:text-secondary-dark">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-text-primary dark:text-text-primary-dark">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StudentStatsCards;