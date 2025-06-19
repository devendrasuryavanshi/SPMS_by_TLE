import { useState, useEffect, useRef } from 'react';
import api from '../plugins/axios';

export type SyncStatus = 'PENDING' | 'SYNCING' | 'SUCCEEDED' | 'FAILED';

export interface SyncedStudent {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  codeforcesHandle: string;
  avatarUrl?: string;
  rating: number;
  maxRating: number;
  rank: string;
  country: string;
  lastSubmissionTime?: string;
  lastContestTime?: string;
  lastDataSync: string;
  syncStatus: SyncStatus;
  inactivityEmailCount: number;
  autoEmailEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useStudentSync = (studentId?: string) => {
  const [student, setStudent] = useState<SyncedStudent | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchStudent = async (isInitialFetch = false) => {
    if (!studentId) return;
    if (isInitialFetch) {
      setIsSyncing(true);
    }

    try {
      const response = await api.get(`/students/${studentId}`);
      const fetchedStudent: SyncedStudent = response.data.student;

      setStudent(fetchedStudent);
      
      const isSyncing = fetchedStudent.syncStatus === 'PENDING' || fetchedStudent.syncStatus === 'SYNCING';
      if (!isSyncing) {
        setIsSyncing(false);
        
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
          pollingInterval.current = null;
        }
      } else if (isSyncing && !pollingInterval.current) {
        pollingInterval.current = setInterval(() => fetchStudent(false), 5000);
      }
      
      setError(null);
    } catch (err: any) {
      setIsSyncing(false);
      setError('Failed to fetch student data.');
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    }
  };

  useEffect(() => {
    fetchStudent(true);
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [studentId]);

  return { student, isSyncing, error, setStudent };
};