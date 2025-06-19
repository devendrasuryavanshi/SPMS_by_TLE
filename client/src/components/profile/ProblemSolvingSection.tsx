import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Chart from 'react-google-charts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { subDays } from 'date-fns';
import api from '../../plugins/axios';
import { useTheme } from 'next-themes';

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
  Select,
  SelectItem,
} from '@nextui-org/react';
import {
  Code,
  Target,
  BarChart3,
  Calendar,
  TrendingUp,
  Star,
  Activity,
  Hash,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface ProblemSolvingData {
  mostDifficultProblem: {
    problemName: string;
    problemRating: number;
    problemUrl: string;
    solvedAt: string;
  } | null;
  totalProblemsSolved: number;
  averageRating: number;
  averageProblemsPerDay: number;
  ratingDistribution: Array<{
    ratingRange: string;
    count: number;
    percentage: number;
  }>;
  submissionHeatmap: Array<{
    date: string; // YYYY-MM-DD
    count: number;
    level: number; //
  }>;
  tagDistribution: Array<{
    tag: string;
    count: number;
    percentage: number;
  }>;
  recentProblems: Array<{
    problemName: string;
    problemRating: number;
    problemUrl: string;
    solvedAt: string;
    tags: string[];
  }>;
  dailyActivity: Array<{
    date: string;
    problemsSolved: number;
  }>;
  filterInfo: {
    days: number;
    dateFrom: string;
    dateTo: string;
  };
}

interface ProblemSolvingSectionProps {
  studentId: string;
}

const ProblemSolvingSection: React.FC<ProblemSolvingSectionProps> = ({
  studentId,
}) => {
  const { theme } = useTheme();
  const [data, setData] = useState<ProblemSolvingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState<7 | 30 | 90>(90);

  const endDateForHeatmap = new Date();
  const startDateForHeatmap = subDays(endDateForHeatmap, 364); // 364 days ago + today = 365 days

  const daysOptions = [
    { label: "Last 7 days", value: "7" },
    { label: "Last 30 days", value: "30" },
    { label: "Last 90 days", value: "90" },
  ];

  const problemColumns = [
    {
      name: "PROBLEM",
      uid: "problem",
      sortable: false
    },
    {
      name: "RATING",
      uid: "rating",
      sortable: true
    },
    {
      name: "TAGS",
      uid: "tags",
      sortable: false
    },
    {
      name: "SOLVED",
      uid: "solved",
      sortable: true
    },
    {
      name: "ACTION",
      uid: "action",
      sortable: false
    }
  ];

  // Google Charts data preparation for Bar Chart
  const barChartData = [
    ['Rating Range', 'Problems Solved', { role: 'style' }],
    ...(data?.ratingDistribution
      .sort((a, b) => {
        const ratingA = parseInt(a.ratingRange.split('-')[0]);
        const ratingB = parseInt(b.ratingRange.split('-')[0]);
        return ratingA - ratingB;
      })
      .map((item) => [
        item.ratingRange,
        item.count,
        'color: #006FEE',
      ]) || []),
  ];

  const barChartOptions = {
    title: 'Rating Distribution',
    titleTextStyle: { color: `${theme === 'dark' ? '#FFFFFF' : '#18181b'}`, fontSize: 16 },
    chartArea: { width: '80%', height: '70%' },
    hAxis: {
      title: 'Rating Range',
      titleTextStyle: { color: '#71717a' }, // Tailwind gray-600
      textStyle: { color: '#71717a' },
      slantedText: true,
      slantedTextAngle: -35,
    },
    vAxis: {
      title: 'Problems Solved',
      titleTextStyle: { color: '#71717a' },
      textStyle: { color: '#71717a' },
      minValue: 0,
    },
    legend: 'none',
    backgroundColor: 'transparent',
    colors: ['#006FEE'],
    tooltip: { isHtml: true },
  };

  // Google Charts data preparation for Pie Chart
  const pieChartData = [
    ['Tag', 'Count'],
    ...(data?.tagDistribution
      .slice(0, 8)
      .map((item) => [item.tag, item.count]) || []),
  ];

  const pieChartOptions = {
    title: 'Problem Categories',
    titleTextStyle: { color: `${theme === 'dark' ? '#FFFFFF' : '#18181b'}`, fontSize: 16 },
    pieHole: 0.4,
    is3D: false,
    legend: {
      position: 'right',
      alignment: 'center',
      textStyle: { color: '#71717a' },
    },
    colors: [
      '#006FEE', // Blue
      '#17C964', // Green
      '#F5A524', // Orange
      '#F31260', // Pink/Red
      '#9353D3', // Purple
      '#06B7DB', // Cyan
      '#FF6B35', // Orange
      '#6F6F6F', // Gray
    ],
    backgroundColor: 'transparent',
    pieSliceText: 'percentage',
    tooltip: { isHtml: true },
  };

  const fetchProblemSolvingData = async (days: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/profile/problem-solving/${studentId}?days=${days}`);
      setData(response.data.data);
    } catch (error: any) {
      // console.error('Error fetching problem solving data:', error);
      toast.error('Failed to fetch problem solving data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Heatmap colors for light and dark mode
  const getHeatmapColorClass = (count: number) => {
    if (count === 0) return 'color-empty';
    if (count < 5) return 'color-scale-1';
    if (count < 10) return 'color-scale-2';
    if (count < 15) return 'color-scale-3';
    return 'color-scale-4';
  };

  const renderProblemCell = (problem: any, columnKey: React.Key) => {
    switch (columnKey) {
      case "problem":
        return (
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark truncate max-w-[200px]">
              {problem.problemName}
            </p>
          </div>
        );
      case "rating":
        return (
          <Chip
            size="sm"
            color={
              problem.problemRating >= 2400 ? "danger" :
                problem.problemRating >= 2100 ? "warning" :
                  problem.problemRating >= 1900 ? "secondary" :
                    problem.problemRating >= 1600 ? "primary" :
                      problem.problemRating >= 1400 ? "success" : "default"
            }
            variant="light"
            className="font-semibold"
          >
            {problem.problemRating}
          </Chip>
        );
      case "tags":
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {problem.tags.slice(0, 2).map((tag: string, index: number) => (
              <Chip key={index} size="sm" variant="flat" color="default" className="text-xs">
                {tag}
              </Chip>
            ))}
            {problem.tags.length > 2 && (
              <Chip size="sm" variant="flat" color="default" className="text-xs">
                +{problem.tags.length - 2}
              </Chip>
            )}
          </div>
        );
      case "solved":
        return (
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-secondary dark:text-secondary-dark" />
            <span className="text-xs text-secondary dark:text-secondary-dark">
              {formatDate(problem.solvedAt)}
            </span>
          </div>
        );
      case "action":
        return (
          <Button
            size="sm"
            variant="light"
            color="primary"
            isIconOnly
            onClick={() => window.open(problem.problemUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchProblemSolvingData(selectedDays);
  }, [studentId, selectedDays]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-secondary dark:text-secondary-dark">
            Loading problem solving data...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
        <CardBody className="py-12">
          <div className="text-center">
            <Code className="w-16 h-16 text-secondary/40 dark:text-secondary-dark/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
              No Problem Solving Data
            </h3>
            <p className="text-secondary dark:text-secondary-dark">
              No problems solved in the selected time period.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
          <CardBody className="p-4">
            <div className="text-center">
              <Hash className="w-6 h-6 text-primary dark:text-primary-dark mx-auto mb-2" />
              <p className="text-lg sm:text-xl font-bold text-text-primary dark:text-text-primary-dark">
                {data.totalProblemsSolved}
              </p>
              <p className="text-xs text-secondary dark:text-secondary-dark">
                Problems Solved
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
          <CardBody className="p-4">
            <div className="text-center">
              <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-lg sm:text-xl font-bold text-text-primary dark:text-text-primary-dark">
                {Math.round(data.averageRating)}
              </p>
              <p className="text-xs text-secondary dark:text-secondary-dark">
                Avg Rating
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
          <CardBody className="p-4">
            <div className="text-center">
              <Activity className="w-6 h-6 text-warning mx-auto mb-2" />
              <p className="text-lg sm:text-xl font-bold text-text-primary dark:text-text-primary-dark">
                {data.averageProblemsPerDay.toFixed(1)}
              </p>
              <p className="text-xs text-secondary dark:text-secondary-dark">
                Per Day
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
          <CardBody className="p-4">
            <div className="text-center">
              <Star className="w-6 h-6 text-danger mx-auto mb-2" />
              <p className="text-lg sm:text-xl font-bold text-text-primary dark:text-text-primary-dark">
                {data.mostDifficultProblem?.problemRating || 'N/A'}
              </p>
              <p className="text-xs text-secondary dark:text-secondary-dark">
                Hardest
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Most Difficult Problem */}
      {data.mostDifficultProblem && (
        <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary dark:text-primary-dark" />
              <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                Most Difficult Problem Solved
              </h3>
            </div>
          </CardHeader>
          <Divider className="bg-secondary/20 dark:bg-secondary-dark/20" />
          <CardBody className="py-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-2">
                  {data.mostDifficultProblem.problemName}
                </h4>
                <div className="flex items-center gap-3">
                  <Chip color="danger" variant="light" size="sm">
                    Rating: {data.mostDifficultProblem.problemRating}
                  </Chip>
                  <span className="text-sm text-secondary dark:text-secondary-dark">
                    Solved on {formatDate(data.mostDifficultProblem.solvedAt)}
                  </span>
                </div>
              </div>
              <Button
                color="primary"
                variant="flat"
                size="sm"
                endContent={<ExternalLink className="w-4 h-4" />}
                onClick={() =>
                  window.open(data.mostDifficultProblem!.problemUrl, '_blank')
                }
              >
                View Problem
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="flex justify-end">
        <Select
          aria-label="Select time range"
          selectedKeys={[String(selectedDays)]}
          onChange={(e) => setSelectedDays(Number(e.target.value) as 7 | 30 | 90)}
          className="w-36"
          classNames={{
            trigger: "bg-transparent shadow-none text-text-primary dark:text-text-primary-dark border border-default-200 dark:border-default-100",
            popoverContent: "bg-background dark:bg-background-dark",
          }}
          variant="flat"
          radius="sm"
          size="sm"
        >
          {daysOptions.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution Bar Chart */}
        <Card className="border bg-surface dark:bg-surface-darkbg-surface dark:bg-surface-dark border-secondary/10 dark:border-secondary-dark/10 bg-gradient-to-br from-surface to-surface/50 dark:from-surface-dark dark:to-surface-dark/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary-dark/20 dark:to-primary-dark/10 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary dark:text-primary-dark" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                    Rating Distribution
                  </h3>
                  <p className="text-xs text-secondary dark:text-secondary-dark">
                    Problems solved by difficulty level
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 dark:from-primary-dark dark:to-primary-dark/70 bg-clip-text text-transparent">
                  {data.ratingDistribution?.reduce((sum, item) => sum + item.count, 0) ||
                    0}
                </p>
                <p className="text-xs text-secondary dark:text-secondary-dark">
                  Total Solved
                </p>
              </div>
            </div>
          </CardHeader>
          <Divider className="bg-gradient-to-r from-transparent via-secondary/20 dark:via-secondary-dark/20 to-transparent" />
          <CardBody className="py-6">
            <div className="h-[28rem]">
              {data.ratingDistribution && data.ratingDistribution.length > 0 ? (
                <Chart
                  chartType="ColumnChart"
                  width="100%"
                  height="100%"
                  data={barChartData}
                  options={barChartOptions}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent dark:from-secondary-dark/20 dark:via-secondary-dark/10 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <BarChart3 className="w-10 h-10 text-secondary/60 dark:text-secondary-dark/60" />
                    </div>
                    <p className="text-secondary dark:text-secondary-dark font-medium mb-2">
                      No rating distribution available
                    </p>
                    <p className="text-xs text-secondary/70 dark:text-secondary-dark/70">
                      Start solving problems to see your progress
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Tag Distribution Pie Chart */}
        <Card className="border bg-surface dark:bg-surface-dark border-secondary/10 dark:border-secondary-dark/10 bg-gradient-to-br from-surface to-surface/50 dark:from-surface-dark dark:to-surface-dark/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-tertiary/20 to-tertiary/10 dark:from-tertiary-dark/20 dark:to-tertiary-dark/10 rounded-xl flex items-center justify-center">
                  <Hash className="w-5 h-5 text-tertiary dark:text-tertiary-dark" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                    Problem Categories
                  </h3>
                  <p className="text-xs text-secondary dark:text-secondary-dark">
                    Top {Math.min(data.tagDistribution?.length || 0, 8)} most solved
                    topics
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold bg-gradient-to-r from-tertiary to-tertiary/70 dark:from-tertiary-dark dark:to-tertiary-dark/70 bg-clip-text text-transparent">
                  {data.tagDistribution?.length || 0}
                </p>
                <p className="text-xs text-secondary dark:text-secondary-dark">
                  Categories
                </p>
              </div>
            </div>
          </CardHeader>
          <Divider className="bg-gradient-to-r from-transparent via-secondary/20 dark:via-secondary-dark/20 to-transparent" />
          <CardBody className="py-6">
            <div className="h-[28rem]">
              {data.tagDistribution && data.tagDistribution.length > 0 ? (
                <Chart
                  chartType="PieChart"
                  width="100%"
                  height="100%"
                  data={pieChartData}
                  options={pieChartOptions}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent dark:from-secondary-dark/20 dark:via-secondary-dark/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <Hash className="w-10 h-10 text-secondary/60 dark:text-secondary-dark/60" />
                    </div>
                    <p className="text-secondary dark:text-secondary-dark font-medium mb-2">
                      No categories data available
                    </p>
                    <p className="text-xs text-secondary/70 dark:text-secondary-dark/70">
                      Solve problems to see topic breakdown
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Submission Heatmap */}
      <Card className="border bg-surface dark:bg-surface-dark border-secondary/10 dark:border-secondary-dark/10">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary dark:text-primary-dark" />
            <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
              Submission Heatmap
            </h3>
          </div>
        </CardHeader>
        <Divider className="bg-secondary/20 dark:bg-secondary-dark/20" />
        <CardBody className="py-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-secondary dark:text-secondary-dark">
                Daily submission activity for the last {selectedDays} days
              </p>
              <div className="flex items-center gap-2 text-xs text-secondary dark:text-secondary-dark">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
                  <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
                  <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-800" />
                  <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
                  <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600" />
                </div>
                <span>More</span>
              </div>
            </div>

            {data.submissionHeatmap && (
              <div className="w-full overflow-x-auto p-2">
                <CalendarHeatmap
                  startDate={startDateForHeatmap}
                  endDate={endDateForHeatmap}
                  values={data.submissionHeatmap.map((item) => ({
                    date: item.date,
                    count: item.count,
                  }))}
                  classForValue={(value) => {
                    if (!value) {
                      return 'color-empty';
                    }
                    return getHeatmapColorClass(value.count);
                  }}
                  showWeekdayLabels={true}
                  gutterSize={2}
                />
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Recent Problems */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border bg-surface dark:bg-surface-dark border-secondary/10 dark:border-secondary-dark/10 bg-gradient-to-br from-surface to-surface/50 dark:from-surface-dark dark:to-surface-dark/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary-dark/20 dark:to-primary-dark/10 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary dark:text-primary-dark" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                    Recent Problems Solved
                  </h3>
                  <p className="text-xs text-secondary dark:text-secondary-dark">
                    Latest {Math.min(data.recentProblems?.length || 0, 10)} problems solved
                  </p>
                </div>
              </div>
              <Chip color="default" variant="light" size="sm">
                {data.recentProblems?.length || 0} problems
              </Chip>
            </div>
          </CardHeader>
          <Divider className="bg-gradient-to-r from-transparent via-secondary/20 dark:via-secondary-dark/20 to-transparent" />
          <CardBody className="p-0">
            {data.recentProblems && data.recentProblems.length > 0 ? (
              <Table
                aria-label="Recent problems table"
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
                      className='bg-default-100 dark:bg-[#070c17]'
                    >
                      <span className="text-xs font-semibold">
                        {column.name}
                      </span>
                    </TableColumn>
                  )}
                </TableHeader>
                <TableBody items={data.recentProblems.slice(0, 10)}>
                  {(item) => (
                    <TableRow key={`${item.problemName}-${item.solvedAt}`} className="hover:bg-background dark:hover:bg-background-dark transition-colors">
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
                  <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent dark:from-secondary-dark/20 dark:via-secondary-dark/10 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <Activity className="w-10 h-10 text-secondary/60 dark:text-secondary-dark/60" />
                  </div>
                  <p className="text-secondary dark:text-secondary-dark font-medium mb-2">
                    No recent problems available
                  </p>
                  <p className="text-xs text-secondary/70 dark:text-secondary-dark/70">
                    Solve problems to see them here
                  </p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProblemSolvingSection;