import { toast } from "sonner";
import { Student } from "../types/student.types";
import api from "../plugins/axios";

export const getRatingColor = (rating?: number) => {
  if (!rating) return "default";
  if (rating >= 2400) return "danger";
  if (rating >= 2100) return "warning";
  if (rating >= 1900) return "secondary";
  if (rating >= 1600) return "primary";
  if (rating >= 1400) return "success";
  return "default";
};

export const getRankColor = (rank?: string) => {
  if (!rank) return "default";
  const lowerRank = rank.toLowerCase();
  if (lowerRank.includes("grandmaster")) return "danger";
  if (lowerRank.includes("master")) return "warning";
  if (lowerRank.includes("expert")) return "secondary";
  if (lowerRank.includes("specialist")) return "primary";
  if (lowerRank.includes("pupil")) return "success";
  return "default";
};

export const handleExportCSV = async (totalCount: number) => {
  try {
    const response = await api.get('/students', {
      params: {
        page: 1,
        limit: totalCount,
      }
    });

    const allStudents = response.data.students;
    const headers = ['Name', 'Email', 'Phone', 'Codeforces Handle', 'Current Rating', 'Max Rating', 'Rank', 'Last Update'];
    const csvContent = [
      headers.join(','),
      ...allStudents.map((student: Student) => [
        `"${student.name}"`,
        `"${student.email.toLowerCase()}"`,
        `"${student.phoneNumber}"`,
        `"${student.codeforcesHandle}"`,
        student.rating || 'N/A',
        student.maxRating || 'N/A',
        `"${student.rank || 'Unrated'}"`,
        `"${student.updatedAt}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Students data exported successfully');
  } catch (error: any) {
    // console.error('Error exporting CSV:', error);
    toast.error('Failed to export data');
  }
};