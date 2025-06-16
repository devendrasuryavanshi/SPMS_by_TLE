import React from 'react';
import { Pagination } from '@nextui-org/react';
import { StudentPaginationProps } from '../../types/student.types';

const StudentPagination: React.FC<StudentPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center py-4">
      <Pagination
        isCompact
        showControls
        showShadow
        color="primary"
        page={currentPage}
        total={totalPages}
        onChange={onPageChange}
        size="sm"
      />
    </div>
  );
};

export default StudentPagination;