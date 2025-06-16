import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from '@nextui-org/react';
import { AlertCircle, Trash2 } from 'lucide-react';
import { StudentDeleteModalProps } from '../../types/student.types';

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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-danger/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-danger" />
                </div>
                <span className="text-lg font-semibold">Confirm Delete</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-3">
                <p className="text-default-700">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-danger">{student?.name}</span>?
                </p>
                <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800/30 rounded-lg p-3">
                  <p className="text-sm text-danger-600 dark:text-danger-400">
                    <strong>Warning:</strong> This action cannot be undone. All student data including:
                  </p>
                  <ul className="text-sm text-danger-600 dark:text-danger-400 mt-2 ml-4 space-y-1">
                    <li>• Progress history and analytics</li>
                    <li>• Contest participation records</li>
                    <li>• Rating progression data</li>
                    <li>• All associated submissions</li>
                  </ul>
                  <p className="text-sm text-danger-600 dark:text-danger-400 mt-2">
                    will be permanently removed from the system.
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={onClose}
                className="font-medium"
              >
                Cancel
              </Button>
              <Button
                color="danger"
                isLoading={isDeleting}
                onPress={onConfirmDelete}
                startContent={!isDeleting && <Trash2 size={16} />}
                className="font-medium"
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