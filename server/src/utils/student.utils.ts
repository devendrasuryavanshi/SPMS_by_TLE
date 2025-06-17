import axios from "axios";
import { CodeforcesUser } from "../types/types";

export const validateForm = (formData: any): string[] => {
  const errors = [];
  const { name, email, phoneNumber, codeforcesHandle } = formData;
  if (!name.trim() || !email.trim() || !phoneNumber.trim() || !codeforcesHandle.trim()) {
    errors.push('All fields are required.');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address.');
  }

  // Phone validation with country code
  const phoneRegex = /^\+[1-9]\d{0,3}\s\d{6,14}$/;
  if (!phoneRegex.test(phoneNumber)) {
    errors.push('Please enter a valid phone number with country code and space.');
  }

  return errors;
}

export const fetchCodeforcesUser = async (handle: string): Promise<CodeforcesUser | null> => {
  try {
    const response = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
    const data = await response.data;
    if (data.status === 'OK') {
      return data.result[0];
    } else {
      return null;
    }
  } catch (error: any) {
    return null;
  }
};