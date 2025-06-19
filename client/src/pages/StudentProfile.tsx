import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import api from '../plugins/axios';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ContestHistorySection from '../components/profile/ContestHistorySection';
import ProblemSolvingSection from '../components/profile/ProblemSolvingSection';
import RecommendedProblemsSection from '../components/profile/RecommendedProblemsSection';
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Button,
  Chip,
  Switch,
  Spinner
} from '@nextui-org/react';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Code,
  Star,
  Trophy,
  Activity,
  Bell,
  BellOff,
  ExternalLink,
} from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  codeforcesHandle: string;
  avatarUrl?: string;
  rating: number;
  maxRating: number;
  rank: string;
  country: string;
  lastSubmissionTime: string;
  lastContestTime: string;
  lastDataSync: string;
  inactivityEmailCount: number;
  autoEmailEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

const StudentProfile: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  // State management
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [activeSection, setActiveSection] = useState<'contests' | 'problems' | 'recommendations'>('contests');
  const [selectedDays, setSelectedDays] = useState<30 | 90 | 365>(365);

  const fetchStudentData = async () => {
    if (!studentId) return;

    setLoading(true);
    try {
      const response = await api.get(`/students/${studentId}`);
      setStudent(response.data.student);
    } catch (error: any) {
      // console.error('Error fetching student:', error);
      toast.error('Failed to fetch student data');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  // toggle auto email
  const handleToggleAutoEmail = async () => {
    if (!student) return;

    setUpdatingEmail(true);
    try {
      const response = await api.patch(`/profile/toggle-email/${studentId}`, {
        autoEmailEnabled: !student.autoEmailEnabled
      });

      setStudent(prev => prev ? {
        ...prev,
        autoEmailEnabled: response.data.data.autoEmailEnabled
      } : null);

      toast.success(response.data.message);
    } catch (error: any) {
      // console.error('Error toggling auto email:', error);
      toast.error('Failed to update email settings');
    } finally {
      setUpdatingEmail(false);
    }
  };

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

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-secondary dark:text-secondary-dark">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
            Student Not Found
          </h2>
          <Button
            color="primary"
            startContent={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/students')}
          >
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-8">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button
            variant="light"
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="mb-4 text-secondary dark:text-secondary-dark hover:text-primary dark:hover:text-primary-dark"
            onClick={() => navigate('/students')}
          >
            Back to Students
          </Button>

          <ProfileHeader student={student} />
        </motion.div>

        {/* Profile Stats */}
        <motion.div
          className="mb-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <ProfileStats student={student} />
        </motion.div>

        {/* Student Info Card */}
        <motion.div
          className="mb-4"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary dark:text-primary-dark" />
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold text-text-primary dark:text-text-primary-dark">
                    Student Information
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-sm text-secondary dark:text-secondary-dark">
                  Auto Email
                  <Switch
                    size="sm"
                    isSelected={student.autoEmailEnabled}
                    onValueChange={handleToggleAutoEmail}
                    isDisabled={updatingEmail}
                    startContent={<Bell className="w-3 h-3" />}
                    endContent={<BellOff className="w-3 h-3" />}
                  />
                </div>
              </div>
            </CardHeader>

            <Divider className="bg-secondary/20 dark:bg-secondary-dark/20" />

            <CardBody className="py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Email */}
                <div className="flex items-start gap-3 p-4 bg-primary-50 dark:bg-background-dark rounded-xl">
                  <Mail className="w-4 h-4 text-primary dark:text-primary-dark mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs md:text-sm font-medium text-secondary dark:text-secondary-dark">
                      Email
                    </p>
                    <p className="text-sm sm:text-base md:text-[15px] font-semibold text-text-primary dark:text-text-primary-dark truncate max-w-[200px]">
                      {student.email}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3 p-4 bg-primary-50 dark:bg-background-dark rounded-xl">
                  <Phone className="w-4 h-4 text-primary dark:text-primary-dark mt-0.5" />
                  <div>
                    <p className="text-[11px] sm:text-xs md:text-sm font-medium text-secondary dark:text-secondary-dark">
                      Phone
                    </p>
                    <p className="text-sm sm:text-base md:text-[15px] font-semibold text-text-primary dark:text-text-primary-dark">
                      {student.phoneNumber}
                    </p>
                  </div>
                </div>

                {/* Codeforces Handle */}
                <div className="flex items-start gap-3 p-4 bg-primary-50 dark:bg-background-dark rounded-xl">
                  <Code className="w-4 h-4 text-primary dark:text-primary-dark mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs md:text-sm font-medium text-secondary dark:text-secondary-dark">
                      Codeforces Handle
                    </p>
                    <div className="flex items-center gap-1">
                      <p className="text-sm sm:text-base md:text-[15px] font-semibold text-text-primary dark:text-text-primary-dark truncate">
                        {student.codeforcesHandle}
                      </p>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="w-6 h-6"
                        onClick={() =>
                          window.open(`https://codeforces.com/profile/${student.codeforcesHandle}`, '_blank')
                        }
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Inactivity Email Count */}
                <div className="flex items-start gap-3 p-4 bg-primary-50 dark:bg-background-dark rounded-xl">
                  <Activity className="w-4 h-4 text-primary dark:text-primary-dark mt-0.5" />
                  <div>
                    <p className="text-[11px] sm:text-xs md:text-sm font-medium text-secondary dark:text-secondary-dark">
                      Email Reminders
                    </p>
                    <p className="text-sm sm:text-base md:text-[15px] font-semibold text-text-primary dark:text-text-primary-dark">
                      {student.inactivityEmailCount} sent
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Section Navigation */}
        <motion.div
          className="mb-4"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-transparent shadow-none border-none backdrop-blur-none">
            <CardBody className="p-4 bg-transparent">
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Contest History Button */}
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    variant={activeSection === 'contests' ? 'solid' : 'light'}
                    color={activeSection === 'contests' ? 'primary' : 'default'}
                    startContent={<Trophy className="w-4 h-4" />}
                    onClick={() => setActiveSection('contests')}
                    className={`
              w-full justify-start sm:justify-center transition-all duration-300
              ${activeSection === 'contests'
                        ? 'shadow-lg shadow-primary/25'
                        : 'hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }
            `}
                  >
                    Contest History
                  </Button>
                </motion.div>

                {/* Problem Solving Button */}
                <motion.div
                  className="flex-1"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    variant={activeSection === 'problems' ? 'solid' : 'light'}
                    color={activeSection === 'problems' ? 'primary' : 'default'}
                    startContent={<Code className="w-4 h-4" />}
                    onClick={() => setActiveSection('problems')}
                    className={`
              w-full justify-start sm:justify-center transition-all duration-300
              ${activeSection === 'problems'
                        ? 'shadow-lg shadow-primary/25'
                        : 'hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }
            `}
                  >
                    Problem Solving
                  </Button>
                </motion.div>

                <motion.div
                  className="flex-1 relative rounded-lg overflow-hidden"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-orange-500/30 blur-md -z-10"
                    initial={{ opacity: 0 }}
                    animate={activeSection === 'recommendations' ? {
                      opacity: [0.3, 0.6, 0.3],
                      scale: [0.95, 1.05, 0.95],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    } : { opacity: 0, scale: 0.95 }}
                    whileHover={{ opacity: 0.4, scale: 1.02 }}
                  />

                  {/* Main Button */}
                  <Button
                    variant={activeSection === 'recommendations' ? 'solid' : 'light'}
                    color={activeSection === 'recommendations' ? 'primary' : 'default'}
                    startContent={
                      <motion.div
                        animate={activeSection === 'recommendations' ? {
                          rotate: [0, 360],
                          scale: [1, 1.1, 1],
                          transition: {
                            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                          }
                        } : { rotate: 0, scale: 1 }}
                      >
                        <Star className="w-4 h-4" />
                      </motion.div>
                    }
                    onClick={() => setActiveSection('recommendations')}
                    className={`
              relative z-10 w-full justify-start sm:justify-center transition-all duration-300
              ${activeSection === 'recommendations'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl'
                        : 'hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-purple-200 dark:hover:border-purple-800'
                      }
            `}
                  >
                    <span className="flex items-center gap-2">
                      Recommendations
                      <motion.div
                        animate={activeSection === 'recommendations' ? {
                          scale: [1, 1.05, 1],
                          transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                        } : { scale: 1 }}
                      >
                        <Chip
                          size="sm"
                          color="secondary"
                          variant={activeSection === 'recommendations' ? 'solid' : 'flat'}
                          className={`
                    ml-2 transition-all duration-300
                    ${activeSection === 'recommendations'
                              ? 'bg-white/20 text-white border-white/30'
                              : ''
                            }
                  `}
                        >
                          <motion.span
                            className="text-xs font-semibold"
                            animate={activeSection === 'recommendations' ? {
                              opacity: [1, 0.7, 1],
                              transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                            } : { opacity: 1 }}
                          >
                            New
                          </motion.span>
                        </Chip>
                      </motion.div>
                    </span>
                  </Button>
                </motion.div>
              </div>

              {/* Progress Indicator */}
              <div className="hidden sm:block mt-4 h-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: "33.33%",
                    x: activeSection === 'contests' ? "0%" :
                      activeSection === 'problems' ? "100%" : "200%"
                  }}
                  transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                />
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Dynamic Content Sections */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeSection === 'contests' && (
            <>
              {/* Filter Buttons */}
              <div className="mb-6">
                <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
                  <CardBody className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary dark:text-primary-dark" />
                        <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                          Contest History
                        </h2>
                      </div>
                      <div className="flex gap-2">
                        {[30, 90, 365].map((days) => (
                          <Button
                            key={days}
                            size="sm"
                            variant={selectedDays === days ? 'solid' : 'light'}
                            color={selectedDays === days ? 'primary' : 'default'}
                            onClick={() => setSelectedDays(days as 30 | 90 | 365)}
                          >
                            {days} days
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
              <ContestHistorySection studentId={studentId!} selectedDays={selectedDays} />
            </>
          )}
          {activeSection === 'problems' && (
            <ProblemSolvingSection studentId={studentId!} />
          )}
          {activeSection === 'recommendations' && (
            <RecommendedProblemsSection studentId={studentId!} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StudentProfile;
