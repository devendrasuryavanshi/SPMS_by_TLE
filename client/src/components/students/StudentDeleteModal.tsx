import React from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';
import { StudentDeleteModalProps } from '../../types/student.types';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
  Button
} from '@nextui-org/react';

const StudentDeleteModal: React.FC<StudentDeleteModalProps> = ({
  isOpen,
  onOpenChange,
  student,
  isDeleting,
  onConfirmDelete
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                  Confirm Deletion
                </h2>
              </div>
            </ModalHeader>

            <ModalBody>
              <p className="text-default-700 dark:text-default-400">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {student?.name}
                </span>
                ?
              </p>

              <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md px-4 py-3">
                <p className="text-sm font-medium text-red-600 dark:text-red-300">
                  Warning: This action is irreversible.
                </p>
                <ul className="mt-2 ml-4 list-disc text-sm text-red-600 dark:text-red-300 space-y-1">
                  <li>Progress history and analytics</li>
                  <li>Contest participation records</li>
                  <li>Rating progression data</li>
                  <li>All associated submissions</li>
                </ul>
                <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                  will be permanently removed from the system.
                </p>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button variant="flat" className="font-medium" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="danger"
                className="font-medium"
                isLoading={isDeleting}
                onPress={onConfirmDelete}
                startContent={!isDeleting && <Trash2 size={16} />}
              >
                {isDeleting ? 'Deleting...' : 'Delete Student'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default StudentDeleteModal;
