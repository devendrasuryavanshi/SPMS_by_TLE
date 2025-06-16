import React from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Plus, X } from 'lucide-react';
import { StudentSearchFiltersProps } from '../../types/student.types';
import { Card, CardBody, Input, Button, } from '@nextui-org/react';

const StudentSearchFilters: React.FC<StudentSearchFiltersProps> = ({
  onSearch,
  totalCount,
  rowsPerPage,
  setRowsPerPage,
  onExportCSV,
  onAddStudent
}) => {

  const [filterValue, setFilterValue] = React.useState('');
  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
        <CardBody className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            {/* Search and Action Buttons Row */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
              <div className="w-full sm:max-w-[400px]">
                <Input
                  className="w-full"
                  placeholder="Search by name, email, or handle..."
                  startContent={<Search size={18} className="text-default-400" />}
                  endContent={
                    <div className="flex items-center gap-1">
                      {filterValue && (
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          className="min-w-unit-6 w-6 h-6"
                          onClick={() => {
                            setFilterValue("");
                            onSearch("");
                          }}
                        >
                          <X size={14} />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        className="min-w-unit-16 h-6"
                        onClick={() => onSearch(filterValue)}
                      >
                        Search
                      </Button>
                    </div>
                  }
                  value={filterValue}
                  onValueChange={setFilterValue}
                  onKeyDown={(e) => e.key === 'Enter' && onSearch(filterValue)}
                  size="sm"
                  classNames={{
                    inputWrapper: "bg-background dark:bg-background-dark border border-secondary/20 dark:border-secondary-dark/20",
                    input: "pr-20"
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button
                  color="secondary"
                  endContent={<Download size={16} />}
                  onClick={onExportCSV}
                  variant="flat"
                  size="sm"
                  className="min-w-[120px]"
                >
                  Export CSV
                </Button>
                <Button
                  color="primary"
                  endContent={<Plus size={16} />}
                  onClick={onAddStudent}
                  size="sm"
                  className="min-w-[120px]"
                >
                  Add Student
                </Button>
              </div>
            </div>

            {/* Stats and Controls Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-secondary/10 dark:border-secondary-dark/10">
              <div className="flex items-center gap-4">
                <span className="text-default-500 text-sm">
                  Total <span className="font-semibold text-primary">{totalCount}</span> students
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center text-default-500 text-sm">
                  Rows per page:
                  <select
                    className="bg-background dark:bg-background-dark outline-none text-default-500 text-sm ml-2 border border-secondary/20 dark:border-secondary-dark/20 rounded px-2 py-1"
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    value={rowsPerPage}
                  >
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default StudentSearchFilters;