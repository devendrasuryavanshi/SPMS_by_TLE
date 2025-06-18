import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Chart } from "react-google-charts";
import api from '../../plugins/axios';
import { useTheme } from 'next-themes';
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Chip,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from '@nextui-org/react';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Award,
  BarChart3,
  MoveUpRight,
  MoveDownLeft
} from 'lucide-react';

interface Contest {
  contestId: number;
  contestName: string;
  ratingChange: number;
  oldRating: number;
  newRating: number;
  rank: number;
  contestTime: string;
  totalProblems: number;
  problemsUnsolvedCount: number;
  problemsSolved: number;
}

interface ContestStats {
  totalContests: number;
  totalRatingChange: number;
  avgRank: number;
  bestRank: number;
  worstRank: number;
  totalProblemsSolved: number;
  totalProblemsAttempted: number;
  positiveRatingChanges: number;
  negativeRatingChanges: number;
  solveRate: number;
}

interface ContestHistoryData {
  contests: Contest[];
  ratingProgression: Array<{
    contestTime: string;
    newRating: number;
    contestName: string;
  }>;
  stats: ContestStats;
  filterInfo: {
    days: number;
    dateFrom: string;
    dateTo: string;
  };
}

interface ContestHistorySectionProps {
  studentId: string;
  selectedDays: number;
}

const ContestHistorySection: React.FC<ContestHistorySectionProps> = ({ studentId, selectedDays }) => {
  const { theme } = useTheme();
  const [data, setData] = useState<ContestHistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContestHistory = async (days: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/profile/contest-history/${studentId}?days=${days}`);
      setData(response.data.data);
    } catch (error: any) {
      // console.error('Error fetching contest history:', error);
      toast.error('Failed to fetch contest history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchContestHistory(selectedDays);
  }, [studentId, selectedDays]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-secondary dark:text-secondary-dark">Loading contest history...</p>
        </div>
      </div>
    );
  }

  if (!data || data.contests.length === 0) {
    return (
      <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
        <CardBody className="py-12">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-secondary/40 dark:text-secondary-dark/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
              No Contest History
            </h3>
            <p className="text-secondary dark:text-secondary-dark">
              No contests found for the selected time period.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
          <CardBody className="p-4">
            <div className="text-center">
              <Trophy className="w-6 h-6 text-primary dark:text-primary-dark mx-auto mb-2" />
              <p className="text-lg sm:text-xl font-bold text-text-primary dark:text-text-primary-dark">
                {data.stats.totalContests}
              </p>
              <p className="text-xs text-secondary dark:text-secondary-dark">Contests</p>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
          <CardBody className="p-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {data.stats.totalRatingChange >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-success" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-danger" />
                )}
              </div>
              <p className={`text-lg sm:text-xl font-bold ${data.stats.totalRatingChange >= 0 ? 'text-success' : 'text-danger'
                }`}>
                {data.stats.totalRatingChange >= 0 ? '+' : ''}{data.stats.totalRatingChange}
              </p>
              <p className="text-xs text-secondary dark:text-secondary-dark">Rating Change</p>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
          <CardBody className="p-4">
            <div className="text-center">
              <Award className="w-6 h-6 text-warning mx-auto mb-2" />
              <p className="text-lg sm:text-xl font-bold text-text-primary dark:text-text-primary-dark">
                {data.stats.bestRank}
              </p>
              <p className="text-xs text-secondary dark:text-secondary-dark">Best Rank</p>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
          <CardBody className="p-4">
            <div className="text-center">
              <Target className="w-6 h-6 text-tertiary dark:text-tertiary-dark mx-auto mb-2" />
              <p className="text-lg sm:text-xl font-bold text-text-primary dark:text-text-primary-dark">
                {data.stats.avgRank}
              </p>
              <p className="text-xs text-secondary dark:text-secondary-dark">Avg Rank</p>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
          <CardBody className="p-4">
            <div className="text-center">
              <BarChart3 className="w-6 h-6 text-accent dark:text-accent-dark mx-auto mb-2" />
              <p className="text-lg sm:text-xl font-bold text-text-primary dark:text-text-primary-dark">
                {data.stats.totalProblemsSolved}
              </p>
              <p className="text-xs text-secondary dark:text-secondary-dark">Problems Solved</p>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
          <CardBody className="p-4">
            <div className="text-center">
              <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xs font-bold text-success">{data.stats.solveRate}%</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-text-primary dark:text-text-primary-dark">
                {data.stats.solveRate}%
              </p>
              <p className="text-xs text-secondary dark:text-secondary-dark">Solve Rate</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Rating Graph */}
      <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary dark:text-primary-dark" />
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
              Rating Progression
            </h3>
          </div>
        </CardHeader>

        <Divider className="bg-secondary/20 dark:bg-secondary-dark/20" />

        <CardBody className="py-6">
          <div className="h-64 sm:h-96">
            <Chart
              chartType="LineChart"
              width="100%"
              height="100%"
              data={[
                ["Date", "Rating"],
                ...data.ratingProgression.map(item => [
                  formatDate(item.contestTime),
                  item.newRating,
                ])
              ]}
              options={{
                title: "Rating Progression",
                titleTextStyle: {
                  color: theme === 'dark' ? '#E4E4E7' : '#27272A',
                  fontSize: 16
                },
                curveType: "function",
                legend: {
                  position: "bottom",
                  textStyle: {
                    color: theme === 'dark' ? '#E4E4E7' : '#27272A'
                  }
                },
                backgroundColor: "transparent",
                hAxis: {
                  title: "Date",
                  textStyle: {
                    color: theme === 'dark' ? '#E4E4E7' : '#27272A',
                    fontSize: 12
                  },
                  titleTextStyle: {
                    color: theme === 'dark' ? '#E4E4E7' : '#27272A'
                  },
                  gridlines: {
                    color: theme === 'dark' ? '#27272A' : '#E4E4E7'
                  }
                },
                vAxis: {
                  title: "Rating",
                  textStyle: {
                    color: theme === 'dark' ? '#E4E4E7' : '#27272A',
                    fontSize: 12
                  },
                  titleTextStyle: {
                    color: theme === 'dark' ? '#E4E4E7' : '#27272A'
                  },
                  gridlines: {
                    color: theme === 'dark' ? '#27272A' : '#E4E4E7'
                  }
                },
                colors: ["#4000BF"],
                pointSize: 5,
                lineWidth: 2,
                chartArea: {
                  backgroundColor: "transparent"
                },
                tooltip: {
                  textStyle: {
                    color: theme === 'dark' ? '#333333' : '#27272A'
                  }
                }
              }}
            />
          </div>
        </CardBody>
      </Card>

      {/* Contest List */}
      <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary dark:text-primary-dark" />
            <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
              Recent Contests
            </h3>
          </div>
        </CardHeader>
        <Divider className="bg-secondary/20 dark:bg-secondary-dark/20" />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <Table
              aria-label="Contest history table"
              classNames={{
                wrapper: "shadow-none",
                th: "bg-background dark:bg-background-dark text-xs font-semibold",
                td: "py-3"
              }}
            >
              <TableHeader>
                <TableColumn>CONTEST</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn className='text-center'>RANK</TableColumn>
                <TableColumn className='text-center'>RATING CHANGE</TableColumn>
                <TableColumn>SOLVED</TableColumn>
                <TableColumn>UNSOLVED</TableColumn>
              </TableHeader>
              <TableBody>
                {data.contests.slice(0, 10).map((contest) => (
                  <TableRow key={contest.contestId}>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark truncate">
                          {contest.contestName}
                        </p>
                        <p className="text-xs text-secondary dark:text-secondary-dark">
                          ID: {contest.contestId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className='min-w-[150px]'>
                      <p className="text-sm text-text-primary dark:text-text-primary-dark">
                        {formatDateTime(contest.contestTime)}
                      </p>
                    </TableCell>
                    <TableCell className='flex justify-center'>
                      <Chip
                        size="sm"
                        color={contest.rank <= 100 ? "success" : contest.rank <= 500 ? "primary" : "default"}
                        variant="light"
                      >
                        #{contest.rank}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        {contest.ratingChange > 0 ? (
                          <MoveUpRight className="w-3 h-3 text-success" />
                        ) : contest.ratingChange < 0 ? (
                          <MoveDownLeft className="w-3 h-3 text-danger" />
                        ) : null}
                        <span className={`text-sm font-semibold ${contest.ratingChange > 0 ? 'text-success' :
                          contest.ratingChange < 0 ? 'text-danger' :
                            'text-secondary dark:text-secondary-dark'
                          }`}>
                          {contest.ratingChange > 0 ? '+' : ''}{contest.ratingChange}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" color="success" variant="light">
                        {contest.problemsSolved}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" color="danger" variant="light">
                        {contest.problemsUnsolvedCount}
                      </Chip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ContestHistorySection;
