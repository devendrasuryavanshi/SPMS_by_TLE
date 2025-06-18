import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../../plugins/axios';
import { CodeforcesUser, EditStudentModalProps, FormData } from '../../types/student.types';
import { fetchCodeforcesData, validateForm } from '../../utils/addAndEdit.utils';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Divider
} from '@nextui-org/react';
import {
  User,
  Mail,
  Phone,
  Code,
  Save,
  Download,
  AlertCircle,
  Star
} from 'lucide-react';

const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  onOpenChange,
  student,
  onStudentUpdated
}) => {

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [formError, setFormError] = useState('');
  const [codeforcesData, setCodeforcesData] = useState<CodeforcesUser | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phoneNumber: '',
    codeforcesHandle: ''
  });

  const handleInputChange = (field: string, value: string) => {
    // console.log(`Field: ${field}, Value: ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formError) setFormError('');
  };

  const handleSubmit = async () => {
    if (!student) return;

    setFormError('');
    if (!validateForm({ formData, setFormError })) return;

    setIsSubmitting(true);

    try {
      const response = await api.patch(`/students/${student._id}`, formData);
      if (response.status === 200) {
        const { name } = response.data.student;
        toast.success(`Student ${name} added successfully!`);
        onStudentUpdated();
        onOpenChange();
      } else {
        setFormError(response.data.message || 'Failed to add student. Please try again.');
      }
    } catch (error: any) {
      setFormError(error.response?.data?.message || 'Failed to add student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (student && isOpen) {
      setFormData({
        name: student.name,
        email: student.email,
        phoneNumber: student.phoneNumber,
        codeforcesHandle: student.codeforcesHandle
      });
      setFormError('');
      setIsSubmitting(false);
      setCodeforcesData(null);
    }
  }, [student, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "p-0",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between p-6 border-b border-secondary/10 dark:border-secondary-dark/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
                  <Save className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                    Edit Student
                  </h2>
                  <p className="text-sm text-secondary dark:text-secondary-dark">
                    Update student information
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2">
                  <Card className="border border-secondary/10 dark:border-secondary-dark/10">
                    <CardHeader className="pb-4">
                      <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
                        Student Information
                      </h3>
                    </CardHeader>
                    <Divider className="bg-secondary/20 dark:bg-secondary-dark/20" />
                    <CardBody className="pt-6">
                      {formError && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 flex items-start gap-2 text-sm">
                          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                          <span>{formError}</span>
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                          type="text"
                          label="Full Name"
                          placeholder="Enter student's full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          startContent={<User className="w-4 h-4 text-secondary dark:text-secondary-dark" />}
                          isRequired
                          size="md"
                          classNames={{
                            label: "text-secondary dark:text-secondary-dark font-medium",
                            input: "text-text-primary dark:text-text-primary-dark",
                            inputWrapper: "bg-background dark:bg-background-dark border border-secondary/20 dark:border-secondary-dark/20 hover:border-primary/40 dark:hover:border-primary-dark/40 focus-within:border-primary dark:focus-within:border-primary-dark transition-colors"
                          }}
                        />

                        <Input
                          type="email"
                          label="Email Address"
                          placeholder="Enter student's email address"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          startContent={<Mail className="w-4 h-4 text-secondary dark:text-secondary-dark" />}
                          isRequired
                          size="md"
                          classNames={{
                            label: "text-secondary dark:text-secondary-dark font-medium",
                            input: "text-text-primary dark:text-text-primary-dark",
                            inputWrapper: "bg-background dark:bg-background-dark border border-secondary/20 dark:border-secondary-dark/20 hover:border-primary/40 dark:hover:border-primary-dark/40 focus-within:border-primary dark:focus-within:border-primary-dark transition-colors"
                          }}
                        />

                        <Input
                          type="tel"
                          label="Phone Number"
                          placeholder="e.g., +91 9876543210"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          startContent={<Phone className="w-4 h-4 text-secondary dark:text-secondary-dark" />}
                          isRequired
                          size="md"
                          classNames={{
                            label: "text-secondary dark:text-secondary-dark font-medium",
                            input: "text-text-primary dark:text-text-primary-dark",
                            inputWrapper: "bg-background dark:bg-background-dark border border-secondary/20 dark:border-secondary-dark/20 hover:border-primary/40 dark:hover:border-primary-dark/40 focus-within:border-primary dark:focus-within:border-primary-dark transition-colors"
                          }}
                        />

                        <div className="flex gap-2 items-center">
                          <Input
                            type="text"
                            label="Codeforces Handle"
                            placeholder="Enter Codeforces username"
                            value={formData.codeforcesHandle}
                            onChange={(e) => handleInputChange('codeforcesHandle', e.target.value)}
                            startContent={<Code className="w-4 h-4 text-secondary dark:text-secondary-dark" />}
                            isRequired
                            size="md"
                            classNames={{
                              label: "text-secondary dark:text-secondary-dark font-medium",
                              input: "text-text-primary dark:text-text-primary-dark",
                              inputWrapper: "bg-background dark:bg-background-dark border border-secondary/20 dark:border-secondary-dark/20 hover:border-primary/40 dark:hover:border-primary-dark/40 focus-within:border-primary dark:focus-within:border-primary-dark transition-colors"
                            }}
                          />
                          <Button
                            type="button"
                            onPress={() => fetchCodeforcesData({
                              formData,
                              setFormData,
                              setIsFetching,
                              setCodeforcesData
                            })}
                            isLoading={isFetching}
                            color="secondary"
                            variant="flat"
                            size="lg"
                            className="bg-tertiary dark:bg-tertiary-dark text-white font-semibold px-4 rounded-xl hover:bg-tertiary/80 dark:hover:bg-tertiary-dark/80 transition-colors text-md"
                            startContent={!isFetching && <Download className="w-6 h-6" />}
                          >
                            {isFetching ? 'Fetching...' : 'Fetch'}
                          </Button>
                        </div>
                      </form>
                    </CardBody>
                  </Card>
                </div>

                {/* Sidebar - Current/Updated Data */}
                <div className="lg:col-span-1">
                  {codeforcesData ? (
                    <Card className="border border-secondary/10 dark:border-secondary-dark/10">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-success" />
                          <h3 className="font-semibold text-text-primary dark:text-text-primary-dark">
                            Updated Profile
                          </h3>
                        </div>
                      </CardHeader>
                      <Divider />
                      <CardBody className="pt-4">
                        <div className="space-y-3">
                          <div className="text-center pb-3 border-b border-secondary/10 dark:border-secondary-dark/10">
                            {codeforcesData.avatar && (
                              <div className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-primary/20 dark:border-primary-dark/20 overflow-hidden">
                                <img
                                  src={codeforcesData.avatar}
                                  alt={`${codeforcesData.handle}'s avatar`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <h4 className="font-bold text-text-primary dark:text-text-primary-dark">
                              {codeforcesData.handle}
                            </h4>
                            {codeforcesData.rank && (
                              <div className="flex items-center justify-center gap-1 mt-1">
                                <Star className="w-3 h-3 text-warning" />
                                <span className="text-xs text-warning capitalize">
                                  {codeforcesData.rank}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {codeforcesData.rating && (
                              <div className="text-center p-2 bg-background dark:bg-background-dark rounded">
                                <div className="text-sm font-bold text-text-primary dark:text-text-primary-dark">
                                  {codeforcesData.rating}
                                </div>
                                <div className="text-xs text-secondary dark:text-secondary-dark">
                                  Rating
                                </div>
                              </div>
                            )}
                            {codeforcesData.maxRating && (
                              <div className="text-center p-2 bg-background dark:bg-background-dark rounded">
                                <div className="text-sm font-bold text-text-primary dark:text-text-primary-dark">
                                  {codeforcesData.maxRating}
                                </div>
                                <div className="text-xs text-secondary dark:text-secondary-dark">
                                  Max Rating
                                </div>
                              </div>
                            )}
                          </div>

                          {codeforcesData.country && (
                            <div className="flex justify-between items-center p-2 bg-background dark:bg-background-dark rounded">
                              <span className="text-xs text-secondary dark:text-secondary-dark">Country</span>
                              <span className="text-xs font-semibold text-text-primary dark:text-text-primary-dark">
                                {codeforcesData.country}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  ) : student ? (
                    <Card className="border border-secondary/10 dark:border-secondary-dark/10">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold text-text-primary dark:text-text-primary-dark">
                            Current Profile
                          </h3>
                        </div>
                      </CardHeader>
                      <Divider />
                      <CardBody className="pt-4">
                        <div className="space-y-3">
                          <div className="text-center pb-3 border-b border-secondary/10 dark:border-secondary-dark/10">
                            {student.avatarUrl ? (
                              <div className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-primary/20 dark:border-primary-dark/20 overflow-hidden">
                                <img
                                  src={student.avatarUrl}
                                  alt={`${student.name}'s avatar`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-primary/10 dark:bg-primary-dark/10 rounded-full mx-auto mb-2 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary dark:text-primary-dark">
                                  {student.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <h4 className="font-bold text-text-primary dark:text-text-primary-dark">
                              {student.codeforcesHandle}
                            </h4>
                            {student.rank && (
                              <div className="flex items-center justify-center gap-1 mt-1">
                                <Star className="w-3 h-3 text-warning" />
                                <span className="text-xs text-warning capitalize">
                                  {student.rank}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {student.rating && (
                              <div className="text-center p-2 bg-background dark:bg-background-dark rounded">
                                <div className="text-sm font-bold text-text-primary dark:text-text-primary-dark">
                                  {student.rating}
                                </div>
                                <div className="text-xs text-secondary dark:text-secondary-dark">
                                  Rating
                                </div>
                              </div>
                            )}
                            {student.maxRating && (
                              <div className="text-center p-2 bg-background dark:bg-background-dark rounded">
                                <div className="text-sm font-bold text-text-primary dark:text-text-primary-dark">
                                  {student.maxRating}
                                </div>
                                <div className="text-xs text-secondary dark:text-secondary-dark">
                                  Max Rating
                                </div>
                              </div>
                            )}
                          </div>

                          {student.country && (
                            <div className="flex justify-between items-center p-2 bg-background dark:bg-background-dark rounded">
                              <span className="text-xs text-secondary dark:text-secondary-dark">Country</span>
                              <span className="text-xs font-semibold text-text-primary dark:text-text-primary-dark">
                                {student.country}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  ) : null}
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-secondary/10 dark:border-secondary-dark/10 p-6">
              <Button
                variant="light"
                onPress={onClose}
                className="border-2 border-secondary dark:border-secondary-dark text-secondary dark:text-secondary-dark font-semibold rounded-xl px-8 h-12 hover:bg-secondary/5 dark:hover:bg-secondary-dark/5 transition-colors flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={isSubmitting}
                onPress={handleSubmit}
                startContent={!isSubmitting && <Save className="w-4 h-4" />}
                className="bg-black text-white font-semibold rounded-xl px-8 h-12 hover:bg-gray-800 transition-colors"
              >
                {isSubmitting ? 'Updating Student...' : 'Update Student'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EditStudentModal;