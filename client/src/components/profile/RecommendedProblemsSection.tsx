import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import api from '../../plugins/axios';
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Button,
  Chip,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
} from '@nextui-org/react';
import {
  Star,
  ExternalLink,
  Code,
  Lightbulb,
  TrendingUp,
  Hash,
  Activity,
} from 'lucide-react';
import { getRatingColor } from '../../utils/student.utils';

interface RecommendedProblem {
  problemId: string;
  problemName: string;
  problemIndex: string;
  problemRating: number;
  tags: string[];
  problemUrl: string;
}

interface RecommendedProblemsData {
  problems: RecommendedProblem[];
  totalProblems: number;
  lastUpdated: string;
}

interface RecommendedProblemsSectionProps {
  studentId: string;
}

const problemColumns = [
  { name: 'INDEX', uid: 'problemIndex', sortable: true },
  { name: 'PROBLEM NAME', uid: 'problemName', sortable: true },
  { name: 'RATING', uid: 'problemRating', sortable: true },
  { name: 'TAGS', uid: 'tags', sortable: false },
  { name: 'ACTION', uid: 'action', sortable: false },
];

const RecommendedProblemsSection: React.FC<RecommendedProblemsSectionProps> = ({ studentId }) => {
  const [data, setData] = useState<RecommendedProblemsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRecommendedProblems = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/profile/recommendations/${studentId}`);
      setData(response.data.data);
    } catch (error: any) {
      // console.error('Error fetching recommended problems:', error);
      toast.error('Failed to fetch recommended problems');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderProblemCell = (problem: RecommendedProblem, columnKey: React.Key) => {
    const cellValue = problem[columnKey as keyof RecommendedProblem];

    switch (columnKey) {
      case 'problemIndex':
        return (
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-primary dark:text-primary-dark" />
            <span className="text-sm font-mono text-text-primary dark:text-text-primary-dark">
              {problem.problemIndex}
            </span>
          </div>
        );
      case 'problemName':
        return (
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
              {problem.problemName}
            </p>
          </div>
        );
      case 'problemRating':
        return (
          <div className="flex flex-col items-start gap-1">
            <Chip size="sm" color={getRatingColor(problem.problemRating)} variant="light">
              {problem.problemRating}
            </Chip>
          </div>
        );
      case 'tags':
        return (
          <div className="flex flex-wrap gap-1">
            {problem.tags.slice(0, 3).map((tag, tagIndex) => (
              <Chip
                key={tagIndex}
                size="sm"
                variant="flat"
                color="default"
                startContent={<Hash className="w-3 h-3" />}
                className="text-xs"
              >
                #{tag}
              </Chip>
            ))}
            {problem.tags.length > 3 && (
              <Chip size="sm" variant="flat" color="default" className="text-xs">
                +{problem.tags.length - 3}
              </Chip>
            )}
          </div>
        );
      case 'action':
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Solve Problem">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="primary"
                onClick={() => window.open(problem.problemUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return cellValue as React.ReactNode;
    }
  };

  useEffect(() => {
    fetchRecommendedProblems();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-secondary dark:text-secondary-dark">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (!data || data.problems.length === 0) {
    return (
      <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
        <CardBody className="py-12">
          <div className="text-center">
            <Lightbulb className="w-16 h-16 text-secondary/40 dark:text-secondary-dark/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
              No Recommendations Available
            </h3>
            <p className="text-secondary dark:text-secondary-dark mb-4">
              We're working on generating personalized problem recommendations for you.
            </p>
            <Button
              color="primary"
              variant="flat"
              onClick={fetchRecommendedProblems}
              startContent={<TrendingUp className="w-4 h-4" />}
            >
              Refresh Recommendations
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
        <CardBody className="py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 dark:bg-primary-dark/10 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-primary dark:text-primary-dark" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                  Recommended Problems
                </h2>
                <p className="text-sm text-secondary dark:text-secondary-dark">
                  Personalized suggestions based on your solving patterns
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Chip color="primary" variant="flat" size="md">
                {data.totalProblems} problems
              </Chip>
              <Chip color="success" variant="flat" size="md" startContent={<TrendingUp className="w-3 h-3" />}>
                Updated {formatDate(data.lastUpdated)}
              </Chip>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-primary-50 dark:bg-background-dark rounded-lg">
              <p className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                {data.problems.filter(p => p.problemRating <= 1400).length}
              </p>
              <p className="text-xs text-secondary dark:text-secondary-dark">Easy</p>
            </div>
            <div className="text-center p-3 bg-primary-50 dark:bg-background-dark rounded-lg">
              <p className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                {data.problems.filter(p => p.problemRating > 1400 && p.problemRating <= 1800).length}
              </p>
              <p className="text-xs text-secondary dark:text-secondary-dark">Medium</p>
            </div>
            <div className="text-center p-3 bg-primary-50 dark:bg-background-dark rounded-lg">
              <p className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                {data.problems.filter(p => p.problemRating > 1800 && p.problemRating <= 2200).length}
              </p>
              <p className="text-xs text-secondary dark:text-secondary-dark">Hard</p>
            </div>
            <div className="text-center p-3 bg-primary-50 dark:bg-background-dark rounded-lg">
              <p className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                {data.problems.filter(p => p.problemRating > 2200).length}
              </p>
              <p className="text-xs text-secondary dark:text-secondary-dark">Expert</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Problems Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-gradient-to-br from-surface to-surface/50 dark:from-surface-dark dark:to-surface-dark/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary-dark/20 dark:to-primary-dark/10 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary dark:text-primary-dark" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                    All Recommended Problems
                  </h3>
                  <p className="text-xs text-secondary dark:text-secondary-dark">
                    Showing {data.problems.length} of {data.totalProblems} problems
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <Divider className="bg-gradient-to-r from-transparent via-secondary/20 dark:via-secondary-dark/20 to-transparent" />
          <CardBody className="p-0">
            {data.problems && data.problems.length > 0 ? (
              <Table
                aria-label="Recommended problems table"
                classNames={{
                  wrapper: "shadow-none",
                  th: "bg-default-100 dark:bg-default-50 text-default-600 dark:text-default-400",
                  td: "border-b border-divider dark:border-divider-dark"
                }}
                removeWrapper
              >
                <TableHeader columns={problemColumns}>
                  {(column) => (
                    <TableColumn
                      key={column.uid}
                      align={column.uid === "action" ? "center" : "start"}
                      allowsSorting={column.sortable}
                      className='bg-default-100 dark:bg-[#070c17] '
                    >
                      <span className="text-xs font-semibold">
                        {column.name}
                      </span>
                    </TableColumn>
                  )}
                </TableHeader>
                <TableBody items={data.problems}>
                  {(item) => (
                    <TableRow key={item.problemId} className="hover:bg-background dark:hover:bg-background-dark transition-colors">
                      {(columnKey) => (
                        <TableCell>
                          {renderProblemCell(item, columnKey)}
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Lightbulb className="w-16 h-16 text-secondary/40 dark:text-secondary-dark/40 mx-auto mb-4" />
                  <p className="text-secondary dark:text-secondary-dark font-medium mb-2">
                    No problems available.
                  </p>
                  <Button
                    color="primary"
                    variant="flat"
                    onClick={fetchRecommendedProblems}
                    startContent={<TrendingUp className="w-4 h-4" />}
                  >
                    Refresh Recommendations
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default RecommendedProblemsSection;