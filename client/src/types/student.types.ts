import { SortDescriptor } from "@nextui-org/react";

export interface Student {
  _id: string;
  name: string;
  avatarUrl: string;
  email: string;
  phoneNumber: string;
  codeforcesHandle: string;
  rating: number;
  maxRating: number;
  rank: string;
  country: string;
  lastSubmissionTime: Date;
  lastContestTime: Date;
  lastDataSync: Date;
  syncStatus?: string;
  lastInactivityEmailSent?: Date;
  inactivityEmailCount: number;
  autoEmailEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeforcesUser {
  handle: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  organization?: string;
  avatar?: string;
  titlePhoto?: string;
  rank?: string;
  maxRank?: string;
  rating?: number;
  maxRating?: number;
  contribution?: number;
  friendOfCount?: number;
  registrationTimeSeconds?: number;
  lastOnlineTimeSeconds?: number;
}

export interface FormData {
  name: string;
  email: string;
  phoneNumber: string;
  codeforcesHandle: string;
}

export interface ValidateFormParams {
  formData: FormData;
  setFormError: React.Dispatch<React.SetStateAction<string>>;
}

export interface FetchCodeforcesParams {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
  setCodeforcesData: React.Dispatch<React.SetStateAction<CodeforcesUser | null>>;
}

export interface StudentTableProps {
  students: Student[];
  loading: boolean;
  sortDescriptor: SortDescriptor;
  onSortChange: (descriptor: SortDescriptor) => void;
  onView: (id: string) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onAddStudent: () => void;
}

export interface AddStudentModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onStudentAdded: () => void;
}

export interface EditStudentModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  student: Student | null;
  onStudentUpdated: () => void;
}

export interface StudentDeleteModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  student: Student | null;
  isDeleting: boolean;
  onConfirmDelete: () => void;
}

export interface StudentPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface StudentSearchFiltersProps {
  onSearch: (searchTerm: string) => void;
  totalCount: number;
  rowsPerPage: number;
  setRowsPerPage: (value: number) => void;
  onExportCSV: () => void;
  onAddStudent: () => void;
}

export interface StudentStatsCardsProps {
  students: Student[];
  totalCount: number;
}

export interface ApiResponse {
  success: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  students: Student[];
}