import axios from "axios";
import { FetchCodeforcesParams, ValidateFormParams } from "../types/student.types";
import { toast } from "sonner";

export const validateForm = ({ formData, setFormError }: ValidateFormParams): boolean => {
  const { name, email, phoneNumber, codeforcesHandle } = formData;
  if (!name.trim() || !email.trim() || !phoneNumber.trim() || !codeforcesHandle.trim()) {
    setFormError('All fields are required');
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setFormError('Please enter a valid email address');
    return false;
  }

  const phoneRegex = /^\+[1-9]\d{0,3}\s\d{6,14}$/;
  if (!phoneRegex.test(phoneNumber)) {
    setFormError('Please enter a valid phone number with country code and space (e.g., +91 9876543210)');
    return false;
  }

  return true;
};


export const fetchCodeforcesData = async ({ formData, setFormData, setIsFetching, setCodeforcesData, }: FetchCodeforcesParams): Promise<void> => {
  if (!formData.codeforcesHandle.trim()) {
    toast.error('Please enter a Codeforces handle first');
    return;
  }

  setIsFetching(true);
  setCodeforcesData(null);

  try {
    const response = await axios.get(`https://codeforces.com/api/user.info?handles=${formData.codeforcesHandle.trim()}`);

    if (response.data.status === 'OK' && response.data.result.length > 0) {
      const userData = response.data.result[0];
      setCodeforcesData(userData);

      // Auto-fill name if not already filled
      if (!formData.name && (userData.firstName || userData.lastName)) {
        const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
        setFormData(prev => ({ ...prev, name: fullName }));
      }

      if (!formData.email && userData.email) {
        setFormData(prev => ({ ...prev, email: userData.email }));
      }

      toast.success('Codeforces data fetched successfully!');
    } else {
      toast.error('User not found on Codeforces');
    }
  } catch (error) {
    toast.error('Failed to fetch Codeforces data');
  } finally {
    setIsFetching(false);
  }
};