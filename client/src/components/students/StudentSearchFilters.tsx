import React from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Plus, X } from 'lucide-react';
import { StudentSearchFiltersProps } from '../../types/student.types';
import { Card, CardBody, Input, Button, Select, SelectItem } from '@nextui-org/react';

const StudentSearchFilters: React.FC<StudentSearchFiltersProps> = ({
  onSearch,
  totalCount,
  rowsPerPage,
  setRowsPerPage,
  onExportCSV,
  onAddStudent
}) => {
  const [filterValue, setFilterValue] = React.useState('');

  const handleClearSearch = () => {
    setFilterValue("");
    onSearch("");
  };

  const handleSearch = () => {
    onSearch(filterValue);
  };

  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark shadow-sm">
        <CardBody>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
              <div className="w-full lg:max-w-md">
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
                          color="danger"
                          className="min-w-unit-6 w-6 h-6"
                          onClick={handleClearSearch}
                        >
                          <X size={14} />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        className="h-7 px-4"
                        radius="full"
                        onClick={handleSearch}
                      >
                        Search
                      </Button>
                    </div>
                  }
                  value={filterValue}
                  onValueChange={setFilterValue}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  size="lg"
                  classNames={{
                    inputWrapper: "bg-background dark:bg-background-dark border border-secondary/20 dark:border-secondary-dark/20",
                    input: "pr-24"
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
                <Button
                  color="success"
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
            <div className="ml-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-secondary/10 dark:border-secondary-dark/10">
              <div className="flex items-center gap-4">
                <span className="text-default-500 text-sm">
                  Total <span className="font-semibold text-primary">{totalCount}</span> students
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center text-default-500 text-sm">
                  Rows per page:
                  <Select
                    size="sm"
                    aria-label="Rows per page"
                    className="w-[100px] ml-2"
                    selectedKeys={[String(rowsPerPage)]}
                    onSelectionChange={(keys) => setRowsPerPage(Number(Array.from(keys)[0]))}
                    classNames={{
                      trigger: "bg-background dark:bg-background-dark border border-secondary/20 dark:border-secondary-dark/20",
                      value: "text-default-500"
                    }}
                  >
                    <SelectItem key="10" value="10">10</SelectItem>
                    <SelectItem key="15" value="15">15</SelectItem>
                    <SelectItem key="25" value="25">25</SelectItem>
                    <SelectItem key="50" value="50">50</SelectItem>
                  </Select>
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