import React from 'react';
import { motion } from 'framer-motion';
import { Student, StudentTableProps } from '../../types/student.types';
import { getRankColor, getRatingColor } from '../../utils/student.utils';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Spinner,
  Card,
  CardBody,
} from '@nextui-org/react';
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  Mail,
  Phone,
  Code,
  Trophy,
  User as UserIcon,
  TrendingUp,
  Star,
  Calendar
} from 'lucide-react';

const columns = [
  {
    name: "NAME",
    uid: "name",
    sortable: true,
    icon: <UserIcon size={16} className="text-default-400" />
  },
  {
    name: "EMAIL",
    uid: "email",
    sortable: true,
    icon: <Mail size={16} className="text-default-400" />
  },
  {
    name: "PHONE",
    uid: "phone",
    sortable: false,
    icon: <Phone size={16} className="text-default-400" />
  },
  {
    name: "HANDLE",
    uid: "codeforcesHandle",
    sortable: true,
    icon: <Code size={16} className="text-default-400" />
  },
  {
    name: "RATING",
    uid: "rating",
    sortable: true,
    icon: <TrendingUp size={16} className="text-default-400" />
  },
  {
    name: "MAX RATING",
    uid: "maxRating",
    sortable: true,
    icon: <Star size={16} className="text-default-400" />
  },
  {
    name: "RANK",
    uid: "rank",
    sortable: true,
    icon: <Trophy size={16} className="text-default-400" />
  },
  {
    name: "LAST UPDATE",
    uid: "lastUpdate",
    sortable: true,
    icon: <Calendar size={16} className="text-default-400" />
  },
  {
    name: "ACTIONS",
    uid: "actions",
    sortable: false,
    icon: null
  },
];

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  loading,
  sortDescriptor,
  onSortChange,
  onView,
  onEdit,
  onDelete,
  onAddStudent
}) => {

  // cell content
  const renderCell = React.useCallback((student: Student, columnKey: React.Key) => {
    const cellValue = student[columnKey as keyof Student];
    // console.log(student.updatedAt);
    switch (columnKey) {
      case "name":
        return (
          <div className="flex items-center gap-3">
            {student.avatarUrl ? (
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary/20 dark:border-primary-dark/20">
                <img
                  src={student.avatarUrl}
                  alt={`${student.name}'s avatar`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 bg-primary/10 dark:bg-primary-dark/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary dark:text-primary-dark">
                  {student.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <p className="truncate w-36 text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                {student.name}
              </p>
            </div>
          </div>
        );
      case "email":
        return (
          <div className="flex flex-col">
            <p className="text-sm text-text-primary dark:text-text-primary-dark truncate">
              {student.email.toLowerCase()}
            </p>
          </div>
        );
      case "phone":
        return (
          <div className="flex flex-col">
            <p className="text-sm font-mono text-text-primary dark:text-text-primary-dark truncate">
              {student.phoneNumber}
            </p>
          </div>
        );
      case "codeforcesHandle":
        return (
          <div className="flex flex-col">
            <a target="_blank" href={`https://codeforces.com/profile/${student.codeforcesHandle}`} className="text-sm font-mono underline font-semibold text-primary dark:text-primary-dark truncate">
              {student.codeforcesHandle}
            </a>
          </div>
        );
      case "rating":
        return (
          <div className='flex justify-center'>
            <Chip
              className="capitalize font-semibold"
              color={getRatingColor(student.rating)}
              size="md"
              variant="light"
            >
              {student.rating || "N/A"}
            </Chip>
          </div>
        );
      case "maxRating":
        return (
          <div className='flex justify-center'>
            <Chip
              className="capitalize font-semibold"
              color={getRatingColor(student.maxRating)}
              size="md"
              variant="light"
            >
              {student.maxRating || "N/A"}
            </Chip>
          </div>
        );
      case "rank":
        return (
          <div className='flex justify-center'>
            <Chip
              className="capitalize font-semibold"
              color={getRankColor(student.rank)}
              size="md"
              variant="light"
            >
              {student.rank || "Unrated"}
            </Chip>
          </div>
        );
      case "lastUpdate":
        return (
          <div className="flex flex-col items-center">
            <p className="text-sm text-text-primary dark:text-text-primary-dark">
              {new Date(student.updatedAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-secondary dark:text-secondary-dark">
              {new Date(student.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-center items-center">
            <Dropdown className='bg-surface dark:bg-surface-dark border-none shadow-none outline-none ring-0'>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="text-default-400" size={16} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu className="bg-surface dark:bg-surface-dark border-none shadow-none outline-none ring-0">
                <DropdownItem
                  key="view"
                  startContent={<Eye size={16} />}
                  onClick={() => onView(student._id)}
                >
                  View Details
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<Edit size={16} />}
                  onClick={() => onEdit(student)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  startContent={<Trash2 size={16} />}
                  onClick={() => onDelete(student)}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue?.toString() ?? '';
    }
  }, [onView, onEdit, onDelete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <Card className="border border-secondary/10 dark:border-secondary-dark/10 shadow-xl">
        <CardBody className="p-0 overflow-x-auto">
          <Table
            aria-label="Students table with custom cells and sorting"
            isHeaderSticky
            classNames={{
              wrapper: "overflow-x-auto overflow-y-visible min-h-[400px] bg-surface dark:bg-surface-dark",
              table: "table-fixed min-w-[1200px] w-full",
              thead: "[&>tr]:first:shadow-none",
              tbody: "overflow-visible",
            }}
            sortDescriptor={sortDescriptor}
            onSortChange={onSortChange}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={column.uid === "actions" ? "center" : "start"}
                  allowsSorting={column.sortable}
                  className="bg-default-100 dark:bg-[#040810] flex-row"
                  width={
                    column.uid === "name" ? 200 :
                      column.uid === "email" ? 220 :
                        column.uid === "phone" ? 140 :
                          column.uid === "codeforcesHandle" ? 150 :
                            column.uid === "rating" ? 120 :
                              column.uid === "maxRating" ? 150 :
                                column.uid === "rank" ? 100 :
                                  column.uid === "lastUpdate" ? 140 :
                                    column.uid === "actions" ? 100 : null
                  }
                >
                  <div className="inline-flex items-center gap-1">
                    {column.icon}
                    <span className="text-xs sm:text-sm font-semibold ml-2">
                      {column.name}
                    </span>
                  </div>
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              emptyContent={
                loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Spinner size="lg" />
                      <p className="text-default-500">Loading students...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Users className="w-16 h-16 text-default-300 mb-4" />
                    <p className="text-default-500 text-lg font-medium mb-2">No students found</p>
                    <p className="text-default-400 text-sm mb-4">
                      Get started by adding your first student
                    </p>
                    <Button
                      color="primary"
                      variant="flat"
                      startContent={<Plus size={16} />}
                      onClick={onAddStudent}
                    >
                      Add First Student
                    </Button>
                  </div>
                )
              }
              items={students}
              loadingContent={<Spinner />}
              loadingState={loading ? "loading" : "idle"}
            >
              {(item) => (
                <TableRow href={`/student/${item._id}`} key={item._id} className="hover:bg-background dark:hover:bg-background-dark transition-colors cursor-pointer">
                  {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default StudentTable;