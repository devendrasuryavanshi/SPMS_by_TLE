import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SortDescriptor, useDisclosure } from '@nextui-org/react';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import api from '../plugins/axios';

// modular components
import StudentSearchFilters from '../components/students/StudentSearchFilters';
import StudentTable from '../components/students/StudentTable';
import StudentPagination from '../components/students/StudentPagination';
import StudentDeleteModal from '../components/students/StudentDeleteModal';
import AddStudentModal from '../components/students/AddStudentModal';
import EditStudentModal from '../components/students/EditStudentModal';
import StudentStatsCards from '../components/students/StudentStatsCards';
import { ApiResponse, Student } from '../types/student.types';
import { handleExportCSV } from '../utils/student.utils';

const Students: React.FC = () => {

  // modal controls
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onOpenChange: onAddOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

  // modal states
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // state management
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // filters and search
  const [filterValue, setFilterValue] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });

  // fetch students data
  const fetchStudents = async (page = 1, search = "", sortBy = "name", order = "asc") => {
    setLoading(true);
    try {
      const response = await api.get('/students', {
        params: {
          page,
          limit: rowsPerPage,
          search,
          sortBy,
          order
        }
      });

      const data: ApiResponse = response.data;
      setStudents(data.students);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      // console.error('Error fetching students:', error);
      toast.error('Failed to fetch students data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sortBy = sortDescriptor.column === 'lastUpdate' ? 'updatedAt' : sortDescriptor.column as string;
    const order = sortDescriptor.direction === "ascending" ? "asc" : "desc";
    fetchStudents(currentPage, filterValue, sortBy, order);
  }, [currentPage, rowsPerPage, sortDescriptor, filterValue]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        const sortBy = sortDescriptor.column as string;
        const order = sortDescriptor.direction === "ascending" ? "asc" : "desc";
        fetchStudents(1, filterValue, sortBy, order);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filterValue]);

  const handleSearch = (value: string) => {
    setFilterValue(value);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/students/${studentToDelete._id}`);
      toast.success(`Student ${studentToDelete.name} deleted successfully`);

      // refresh the data
      const sortBy = sortDescriptor.column as string;
      const order = sortDescriptor.direction === "ascending" ? "asc" : "desc";
      fetchStudents(currentPage, filterValue, sortBy, order);

      setStudentToDelete(null);
      onDeleteOpenChange();
    } catch (error: any) {
      // console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewStudent = (id: string) => {
    console.log(id);
  };

  const handleEditStudent = (student: Student) => {
    setStudentToEdit(student);
    onEditOpen();
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    onDeleteOpen();
  };

  // refresh data after operations
  const refreshStudents = () => {
    const sortBy = sortDescriptor.column as string;
    const order = sortDescriptor.direction === "ascending" ? "asc" : "desc";
    fetchStudents(currentPage, filterValue, sortBy, order);
  };

  const filteredStudents = React.useMemo(() => {
    let filteredStudents = [...students];
    return filteredStudents;
  }, [students]);

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark py-4 sm:py-8">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 dark:bg-primary-dark/10 rounded-2xl flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary dark:text-primary-dark" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary dark:text-text-primary-dark">
                Students Management
              </h1>
              <p className="text-sm sm:text-base text-secondary dark:text-secondary-dark">
                Manage and track student progress in competitive programming
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <StudentStatsCards students={students} totalCount={totalCount} />
        </motion.div>

        {/* Search and Filters */}
        <StudentSearchFilters
          totalCount={totalCount}
          onSearch={handleSearch}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          onExportCSV={() => handleExportCSV(totalCount)}
          onAddStudent={onAddOpen}
        />

        {/* Main Table */}
        <StudentTable
          students={filteredStudents}
          loading={loading}
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          onView={handleViewStudent}
          onEdit={handleEditStudent}
          onDelete={handleDeleteClick}
          onAddStudent={onAddOpen}
        />

        {/* Pagination */}
        <StudentPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modals */}
      <StudentDeleteModal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        student={studentToDelete}
        isDeleting={isDeleting}
        onConfirmDelete={handleDeleteStudent}
      />

      <AddStudentModal
        isOpen={isAddOpen}
        onOpenChange={onAddOpenChange}
        onStudentAdded={refreshStudents}
      />

      <EditStudentModal
        isOpen={isEditOpen}
        onOpenChange={onEditOpenChange}
        student={studentToEdit}
        onStudentUpdated={refreshStudents}
      />
    </div>
  );
};

export default Students;