import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@nextui-org/react';
import {
  GraduationCap,
  Calendar,
  TrendingUp,
  Users,
  BarChart3,
  ArrowRight,
  Clock,
  Target,
  Award,
  Activity,
  Database,
  Bell,
  Shield,
  Zap,
  Eye,
  CheckCircle,
  Star,
  Sparkles
} from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const coreFeatures = [
    {
      icon: <Users className="w-5 h-5" />,
      title: "Student Profiles",
      description: "Comprehensive tracking of student progress with detailed contest history and performance metrics."
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Advanced Analytics",
      description: "Rating graphs, submission heatmaps, and problem difficulty analysis with visual insights."
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: "Auto Data Sync",
      description: "Daily Codeforces synchronization at 2 AM with real-time updates when handles change."
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: "Smart Notifications",
      description: "Automated email reminders for inactive students with configurable settings."
    }
  ];

  const analyticsFeatures = [
    { icon: <TrendingUp className="w-4 h-4" />, title: "Rating Progression", desc: "30/90/365 day tracking" },
    { icon: <Target className="w-4 h-4" />, title: "Problem Analysis", desc: "Difficulty & solving stats" },
    { icon: <Activity className="w-4 h-4" />, title: "Submission Heatmaps", desc: "Activity visualization" },
    { icon: <Award className="w-4 h-4" />, title: "Contest Performance", desc: "Ranks & rating changes" }
  ];

  const systemStats = [
    { label: "Data Sync", value: "24/7", icon: <Clock className="w-4 h-4" /> },
    { label: "Accuracy", value: "99.9%", icon: <Shield className="w-4 h-4" /> },
    { label: "Response", value: "<100ms", icon: <Zap className="w-4 h-4" /> },
    { label: "Uptime", value: "99.9%", icon: <CheckCircle className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen w-full bg-background dark:bg-background-dark transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-tertiary/5 dark:from-primary-dark/5 dark:to-tertiary-dark/5"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:pt-20 lg:pt-28 relative z-10">
          <div className="text-center">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark rounded-full text-sm font-medium mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <GraduationCap size={16} />
              Student Progress Management System
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-text-primary dark:text-text-primary-dark mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Track Student
              <span className="block text-primary dark:text-primary-dark">Programming Progress</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl lg:text-2xl text-secondary dark:text-secondary-dark mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Comprehensive platform for monitoring competitive programming progress with automated
              Codeforces synchronization and intelligent analytics.
            </motion.p>

            <motion.div
              className="flex flex-col xs:flex-row gap-4 justify-center items-center mb-12 2xl:flex-row 2xl:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <Button
                size="lg"
                className="bg-black text-white font-semibold rounded-full px-8 h-14 text-base xs:w-auto w-64 hover:bg-gray-800 transition-colors"
                endContent={<ArrowRight className="ml-1" size={18} />}
                onClick={() => navigate('/students')}
              >
                View Student Profiles
              </Button>
              <Button
                size="lg"
                variant="bordered"
                className="border-2 border-primary dark:border-primary-dark text-primary dark:text-primary-dark font-semibold rounded-full px-8 h-14 text-base w-64 xs:w-auto hover:bg-primary/5 dark:hover:bg-primary-dark/5 transition-colors"
                onClick={() => navigate('/contest-tracker')}
              >
                Explore Analytics
              </Button>
            </motion.div>

            {/* System Stats */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {systemStats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-surface dark:bg-surface-dark p-4 rounded-xl border border-secondary/10 dark:border-secondary-dark/10"
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-primary dark:text-primary-dark">{stat.icon}</span>
                    <span className="text-lg font-bold text-text-primary dark:text-text-primary-dark">{stat.value}</span>
                  </div>
                  <p className="text-xs text-secondary dark:text-secondary-dark">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-16 sm:py-20 bg-surface dark:bg-surface-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
              Powerful Features
            </h2>
            <p className="text-lg sm:text-xl text-secondary dark:text-secondary-dark max-w-2xl mx-auto">
              Everything you need to track and optimize student programming progress
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-background dark:bg-background-dark rounded-xl p-6 border border-secondary/10 dark:border-secondary-dark/10 hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary-dark/5 transition-all duration-300"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary-dark/10 rounded-xl flex items-center justify-center text-primary dark:text-primary-dark mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark mb-3">{feature.title}</h3>
                <p className="text-sm text-secondary dark:text-secondary-dark leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Analytics Dashboard Preview */}
      <section className="py-16 sm:py-20 bg-background dark:bg-background-dark relative overflow-hidden">
        <div className="absolute top-1/4 -right-32 w-64 h-64 bg-accent/10 dark:bg-accent-dark/10 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-tertiary/10 dark:bg-tertiary-dark/10 rounded-full blur-3xl opacity-30"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-tertiary dark:text-tertiary-dark" />
                <span className="text-sm font-medium text-tertiary dark:text-tertiary-dark">Advanced Analytics</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
                Deep Insights Into Student Performance
              </h2>
              <p className="text-lg text-secondary dark:text-secondary-dark mb-8 leading-relaxed">
                Comprehensive analytics dashboard with rating progression, submission heatmaps,
                and detailed contest performance tracking.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {analyticsFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-surface dark:bg-surface-dark rounded-lg border border-secondary/10 dark:border-secondary-dark/10"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-8 h-8 bg-primary/10 dark:bg-primary-dark/10 rounded-lg flex items-center justify-center text-primary dark:text-primary-dark flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary dark:text-text-primary-dark mb-1">{feature.title}</h4>
                      <p className="text-sm text-secondary dark:text-secondary-dark">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button
                size="lg"
                className="bg-primary dark:bg-primary-dark text-white font-semibold rounded-full px-8 h-12"
                endContent={<Eye className="ml-1" size={16} />}
                onClick={() => navigate('/analytics')}
              >
                View Analytics Demo
              </Button>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 border border-secondary/10 dark:border-secondary-dark/10 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">System Overview</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-tertiary dark:bg-tertiary-dark rounded-full"></div>
                    <span className="text-sm text-secondary dark:text-secondary-dark">Live</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background dark:bg-background-dark rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-primary dark:text-primary-dark" />
                      <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">Active Students</span>
                    </div>
                    <span className="text-lg font-bold text-text-primary dark:text-text-primary-dark">1,247</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background dark:bg-background-dark rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-accent dark:text-accent-dark" />
                      <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">Contests Tracked</span>
                    </div>
                    <span className="text-lg font-bold text-text-primary dark:text-text-primary-dark">3,456</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background dark:bg-background-dark rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-4 h-4 text-tertiary dark:text-tertiary-dark" />
                      <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">Problems Solved</span>
                    </div>
                    <span className="text-lg font-bold text-text-primary dark:text-text-primary-dark">89,234</span>
                  </div>

                  <div className="mt-6 p-4 bg-primary/5 dark:bg-primary-dark/5 rounded-lg border border-primary/20 dark:border-primary-dark/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-primary dark:text-primary-dark" />
                      <span className="text-sm font-medium text-primary dark:text-primary-dark">Next Sync</span>
                    </div>
                    <p className="text-sm text-secondary dark:text-secondary-dark">Daily at 2:00 AM</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-primary/5 via-background to-tertiary/5 dark:from-primary-dark/5 dark:via-background-dark dark:to-tertiary-dark/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="w-5 h-5 text-tertiary dark:text-tertiary-dark" />
              <span className="text-sm font-medium text-tertiary dark:text-tertiary-dark">Ready to Get Started?</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
              Transform Student Progress Tracking
            </h2>
            <p className="text-lg sm:text-xl text-secondary dark:text-secondary-dark mb-8 max-w-2xl mx-auto leading-relaxed">
              Join educators using SPMS to monitor, analyze, and optimize competitive programming learning outcomes.
            </p>

            <div className="flex flex-col xs:flex-row gap-4 justify-center items-center mb-12 2xl:flex-row 2xl:gap-6">
              <Button
                size="lg"
                className="bg-black text-white font-semibold rounded-full px-8 h-14 text-base w-64 xs:w-auto hover:bg-gray-800 transition-colors"
                endContent={<ArrowRight className="ml-1" size={18} />}
                onClick={() => navigate('/register')}
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="bordered"
                className="border-2 border-secondary dark:border-secondary-dark text-secondary dark:text-secondary-dark font-semibold rounded-full px-8 h-14 text-base hover:bg-secondary/5 dark:hover:bg-secondary-dark/5 w-64 xs:w-auto transition-colors"
                onClick={() => navigate('/demo')}
              >
                Watch Demo
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Students", value: "1K+" },
                { label: "Contests", value: "3K+" },
                { label: "Problems", value: "89K+" },
                { label: "Accuracy", value: "99.9%" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-2xl sm:text-3xl font-bold text-primary dark:text-primary-dark mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-secondary dark:text-secondary-dark">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
