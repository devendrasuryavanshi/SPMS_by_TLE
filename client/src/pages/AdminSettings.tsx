import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import api from '../plugins/axios';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Divider,
  Chip,
  Spinner,
  Select,
  SelectItem,
  Switch,
} from '@nextui-org/react';
import {
  Settings,
  Clock,
  Save,
  RefreshCw,
  Calendar,
  AlertCircle,
  CheckCircle,
  Database,
  Users,
  Activity,
  Shield,
  Timer,
  TrendingUp,
} from 'lucide-react';

interface SystemSettings {
  _id: string;
  cronSchedule: string;
  scheduleInput: string;
  lastSyncDate: string;
  lastUpdatedBy: string;
  updatedAt: string;
  createdAt: string;
  isAutoSyncEnabled: boolean;
}

interface SyncResult {
  totalStudents: number;
  successCount: number;
  errorCount: number;
}

const AdminSettings: React.FC = () => {
  // State management
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [scheduleInput, setScheduleInput] = useState('');
  const [autoSyncToggleLoading, setAutoSyncToggleLoading] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  // Predefined schedule options
  const scheduleOptions = [
    { value: 'every day at 2am', label: 'Daily at 2:00 AM' },
    { value: 'every day at 3am', label: 'Daily at 3:00 AM' },
    { value: 'every day at 4am', label: 'Daily at 4:00 AM' },
    { value: 'every weekday at 2am', label: 'Weekdays at 2:00 AM' },
    { value: 'every weekday at 6am', label: 'Weekdays at 6:00 AM' },
    { value: 'every weekend at 10am', label: 'Weekends at 10:00 AM' },
    { value: 'every monday at 1am', label: 'Every Monday at 1:00 AM' },
    { value: 'every sunday at 11pm', label: 'Every Sunday at 11:00 PM' },
  ];

  // if sync button should be disabled (last sync was within 6 hours)
  const isSyncDisabled = () => {
    if (!settings?.lastSyncDate) return false;
    const lastSync = new Date(settings.lastSyncDate);
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    return lastSync > sixHoursAgo;
  };

  // Get time remaining until sync is available
  const getTimeUntilSyncAvailable = () => {
    if (!settings?.lastSyncDate) return null;
    const lastSync = new Date(settings.lastSyncDate);
    const sixHoursLater = new Date(lastSync.getTime() + 6 * 60 * 60 * 1000);
    const now = new Date();

    if (now >= sixHoursLater) return null;

    const diff = sixHoursLater.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  // Fetch current settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/sync/settings');
      if (response.data.success) {
        setSettings(response.data.settings);
        setScheduleInput(response.data.settings.scheduleInput || '');
      }
    } catch (error: any) {
      toast.error('Failed to fetch settings');
      // console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update settings
  const handleUpdateSettings = async () => {
    if (!scheduleInput.trim()) {
      toast.error('Please enter a schedule');
      return;
    }

    setSaving(true);
    try {
      const response = await api.patch('/sync/settings/schedule', {
        scheduleInput: scheduleInput.trim(),
      });

      if (response.data.success) {
        setSettings(response.data.settings);
        toast.success('Settings updated successfully');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update settings';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Toggle auto-sync functionality
  const handleAutoSyncToggle = async (enabled: boolean) => {
    setAutoSyncToggleLoading(true);
    try {
      const response = await api.patch('/sync/settings/auto-sync', { enabled });
      if (response.data.success) {
        setSettings(prev => prev ? { ...prev, isAutoSyncEnabled: enabled } : null);
        toast.success(`Auto sync ${enabled ? 'enabled' : 'disabled'} successfully`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update auto sync status';
      toast.error(message);
      // Revert the toggle state on error to reflect the actual status
      setSettings(prev => prev ? { ...prev, autoSyncEnabled: !enabled } : null);
    } finally {
      setAutoSyncToggleLoading(false);
    }
  };

  // Manual sync all profiles
  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const response = await api.post('/sync/all');
      if (response.data.success) {
        setLastSyncResult(response.data.result);
        // Update lastSyncDate in settings
        setSettings(prev => prev ? { ...prev, lastSyncDate: new Date().toISOString() } : null);
        toast.success('Manual sync completed successfully');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Manual sync failed';
      toast.error(message);
    } finally {
      setSyncing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-secondary dark:text-secondary-dark">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 dark:bg-primary-dark/10 rounded-2xl flex items-center justify-center">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-primary dark:text-primary-dark" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary dark:text-text-primary-dark">
                System Settings
              </h1>
              <p className="text-sm sm:text-base text-secondary dark:text-secondary-dark">
                Configure data synchronization and system preferences
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Layout - Two Columns on Large Screens */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Metadata & System Info */}
            <motion.div className="md:col-span-1 space-y-6" variants={itemVariants}>
              {/* Current Configuration Overview */}
              <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary dark:text-primary-dark" />
                    <h2 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                      Current Status
                    </h2>
                  </div>
                </CardHeader>
                <Divider className="bg-secondary/20 dark:bg-secondary-dark/20" />
                <CardBody className="py-6 space-y-4">
                  <div className="p-3 bg-background dark:bg-background-dark rounded-lg border border-secondary/10 dark:border-secondary-dark/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-primary dark:text-primary-dark" />
                      <span className="text-sm font-medium text-secondary dark:text-secondary-dark">
                        Active Schedule
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                      {settings?.scheduleInput || 'Not configured'}
                    </p>
                    <p className="text-xs text-secondary dark:text-secondary-dark mt-1">
                      {settings?.cronSchedule || 'N/A'}
                    </p>
                  </div>

                  <div className="p-3 bg-background dark:bg-background-dark rounded-lg border border-secondary/10 dark:border-secondary-dark/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-tertiary dark:text-tertiary-dark" />
                      <span className="text-sm font-medium text-secondary dark:text-secondary-dark">
                        Last Updated
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                      {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleDateString() : 'Never'}
                    </p>
                    <p className="text-xs text-secondary dark:text-secondary-dark mt-1">
                      {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleTimeString() : ''}
                    </p>
                  </div>

                  {settings?.lastSyncDate && (
                    <div className="p-3 bg-background dark:bg-background-dark rounded-lg border border-secondary/10 dark:border-secondary-dark/10">
                      <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium text-secondary dark:text-secondary-dark">
                          Last Sync
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                        {new Date(settings.lastSyncDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-secondary dark:text-secondary-dark mt-1">
                        {new Date(settings.lastSyncDate).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* System Information */}
              <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent dark:text-accent-dark" />
                    <h2 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                      System Status
                    </h2>
                  </div>
                </CardHeader>
                <Divider className="bg-secondary/20 dark:bg-secondary-dark/20" />
                <CardBody className="py-6 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background dark:bg-background-dark rounded-lg">
                    <span className="text-sm text-secondary dark:text-secondary-dark">
                      Auto Sync Status
                    </span>
                    {/* Auto Sync Toggle Button */}
                    <Switch
                      isSelected={settings?.isAutoSyncEnabled}
                      onValueChange={handleAutoSyncToggle}
                      isDisabled={autoSyncToggleLoading}
                      size="sm"
                      color="success"
                      startContent={<CheckCircle className="w-3 h-3" />}
                      endContent={<AlertCircle className="w-3 h-3" />}
                    >
                    </Switch>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background dark:bg-background-dark rounded-lg">
                    <span className="text-sm text-secondary dark:text-secondary-dark">
                      API Rate Limiting
                    </span>
                    <Chip
                      size="sm"
                      color="primary"
                      variant="flat"
                      startContent={<Shield className="w-3 h-3" />}
                    >
                      Enabled
                    </Chip>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background dark:bg-background-dark rounded-lg">
                    <span className="text-sm text-secondary dark:text-secondary-dark">
                      Manual Sync
                    </span>
                    <Chip
                      size="sm"
                      color={isSyncDisabled() ? 'warning' : 'success'}
                      variant="flat"
                      startContent={<Timer className="w-3 h-3" />}
                    >
                      {isSyncDisabled() ? 'Cooldown' : 'Available'}
                    </Chip>
                  </div>
                </CardBody>
              </Card>

              {/* Last Sync Result */}
              {lastSyncResult && (
                <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-success" />
                      <h2 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                        Last Sync Result
                      </h2>
                    </div>
                  </CardHeader>
                  <Divider className="bg-secondary/20 dark:bg-secondary-dark/20" />
                  <CardBody className="py-6">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-background dark:bg-background-dark rounded-lg">
                        <div className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                          {lastSyncResult.totalStudents}
                        </div>
                        <div className="text-xs text-secondary dark:text-secondary-dark">Total</div>
                      </div>
                      <div className="text-center p-3 bg-background dark:bg-background-dark rounded-lg">
                        <div className="text-lg font-bold text-success">
                          {lastSyncResult.successCount}
                        </div>
                        <div className="text-xs text-secondary dark:text-secondary-dark">Success</div>
                      </div>
                      <div className="text-center p-3 bg-background dark:bg-background-dark rounded-lg">
                        <div className="text-lg font-bold text-danger">
                          {lastSyncResult.errorCount}
                        </div>
                        <div className="text-xs text-secondary dark:text-secondary-dark">Errors</div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </motion.div>

            {/* Right Column - Settings Configuration */}
            <motion.div className="md:col-span-2 space-y-6" variants={itemVariants}>
              {/* Schedule Configuration */}
              <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary dark:text-primary-dark" />
                    <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                      Sync Schedule Configuration
                    </h2>
                  </div>
                </CardHeader>
                <Divider className="bg-secondary/20 dark:bg-secondary-dark/20" />
                <CardBody className="py-6 space-y-6">
                  {/* Quick Select Options */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-3">
                      Quick Select Presets
                    </label>
                    <Select
                      placeholder="Choose a predefined schedule"
                      className="w-full"
                      size="lg"
                      classNames={{
                        trigger:
                          'bg-background dark:bg-background-dark border border-secondary/20 dark:border-secondary-dark/20',
                        value: 'text-text-primary dark:text-text-primary-dark',
                      }}
                      onSelectionChange={keys => {
                        const selected = Array.from(keys)[0] as string;
                        if (selected) {
                          setScheduleInput(selected);
                        }
                      }}
                    >
                      {scheduleOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Custom Input */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-3">
                      Custom Schedule Input
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., every day at 2am, every monday at 9:30pm"
                      value={scheduleInput}
                      onChange={e => setScheduleInput(e.target.value)}
                      size="lg"
                      classNames={{
                        input: 'text-text-primary dark:text-text-primary-dark',
                        inputWrapper:
                          'bg-background dark:bg-background-dark border border-secondary/20 dark:border-secondary-dark/20 hover:border-primary/40 dark:hover:border-primary-dark/40 focus-within:border-primary dark:focus-within:border-primary-dark',
                      }}
                      startContent={<Clock className="w-4 h-4 text-secondary dark:text-secondary-dark" />}
                    />

                    {/* Help Text */}
                    <div className="mt-3 p-4 bg-primary/5 dark:bg-primary-dark/5 border border-primary/10 dark:border-primary-dark/10 rounded-xl">
                      <p className="text-sm font-medium text-primary dark:text-primary-dark mb-2">
                        Supported Schedule Formats:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-primary/80 dark:text-primary-dark/80">
                        <div>• "every day at 2am" - Daily at 2:00 AM</div>
                        <div>• "every weekday at 6:30pm" - Mon-Fri at 6:30 PM</div>
                        <div>• "every weekend at 10am" - Sat-Sun at 10:00 AM</div>
                        <div>• "every monday at 9pm" - Every Monday at 9:00 PM</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 h-32 md:h-auto">
                    <Button
                      color="primary"
                      size="lg"
                      className="flex-1 font-semibold"
                      startContent={!saving && <Save className="w-4 h-4" />}
                      isLoading={saving}
                      onClick={handleUpdateSettings}
                      isDisabled={!scheduleInput.trim() || scheduleInput === settings?.scheduleInput}
                    >
                      {saving ? 'Saving Schedule...' : 'Save Schedule'}
                    </Button>
                    <Button
                      variant="bordered"
                      size="lg"
                      className="flex-1 border-2 border-secondary dark:border-secondary-dark text-secondary dark:text-secondary-dark font-semibold hover:bg-secondary/5 dark:hover:bg-secondary-dark/5"
                      onClick={() => setScheduleInput(settings?.scheduleInput || '')}
                    >
                      Reset Changes
                    </Button>
                  </div>
                </CardBody>
              </Card>

              {/* Manual Sync Section */}
              <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-tertiary dark:text-tertiary-dark" />
                    <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                      Manual Data Synchronization
                    </h2>
                  </div>
                </CardHeader>
                <Divider className="bg-secondary/20 dark:bg-secondary-dark/20" />
                <CardBody className="py-6">
                  <div className="space-y-4">
                    {/* Sync Status Warning */}
                    {isSyncDisabled() ? (
                      <div className="p-4 bg-warning/10 dark:bg-warning-dark/10 border border-warning/20 dark:border-warning-dark/20 rounded-xl">
                        <div className="flex items-start gap-3">
                          <Timer className="w-5 h-5 text-warning dark:text-warning-dark mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-warning dark:text-warning-dark mb-1">
                              Sync Cooldown Active
                            </p>
                            <p className="text-xs text-warning/80 dark:text-warning-dark/80 leading-relaxed">
                              Manual sync is temporarily disabled to prevent API rate limiting. Next
                              sync available in:{' '}
                              <span className="font-semibold">{getTimeUntilSyncAvailable()}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-warning/10 dark:bg-warning-dark/10 border border-warning/20 dark:border-warning-dark/20 rounded-xl">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-warning dark:text-warning-dark mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-warning dark:text-warning-dark mb-1">
                              Manual Sync Guidelines
                            </p>
                            <p className="text-xs text-warning/80 dark:text-warning-dark/80 leading-relaxed">
                              Manual synchronization will fetch data for all students immediately.
                              This process may take several minutes and should be used sparingly to
                              avoid API rate limits. A 6-hour cooldown applies after each manual
                              sync.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sync Button */}
                    <div className='flex justify-end'>
                      <Button
                        color={isSyncDisabled() ? 'default' : 'secondary'}
                        size="lg"
                        className="font-semibold"
                        startContent={!syncing && <RefreshCw className="w-4 h-4" />}
                        isLoading={syncing}
                        onClick={handleManualSync}
                        isDisabled={isSyncDisabled()}
                      >
                        {syncing
                          ? 'Synchronizing All Profiles...'
                          : isSyncDisabled()
                            ? `Sync Available in ${getTimeUntilSyncAvailable()}`
                            : 'Start Manual Sync'}
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Additional System Info */}
              <Card className="border border-secondary/10 dark:border-secondary-dark/10 bg-surface dark:bg-surface-dark">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary dark:text-primary-dark" />
                    <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                      Synchronization Information
                    </h2>
                  </div>
                </CardHeader>
                <Divider className="bg-secondary/20 dark:bg-secondary-dark/20" />
                <CardBody className="py-6">
                  <div className="p-4 bg-primary/5 dark:bg-primary-dark/5 border border-primary/10 dark:border-primary-dark/10 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Database className="w-5 h-5 text-primary dark:text-primary-dark mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-primary dark:text-primary-dark">
                          How Data Synchronization Works
                        </p>
                        <div className="text-xs text-primary/80 dark:text-primary-dark/80 leading-relaxed space-y-1">
                          <p>
                            • <strong>Automated Sync:</strong> Runs based on your configured
                            schedule to keep data current
                          </p>
                          <p>
                            • <strong>Manual Sync:</strong> Immediate sync available with 6-hour
                            cooldown for rate limiting
                          </p>
                          <p>
                            • <strong>Data Sources:</strong> Fetches latest submissions, contests,
                            and ratings from Codeforces
                          </p>
                          <p>
                            • <strong>Email Notifications:</strong> Automatically sends reminders
                            to inactive students
                          </p>
                          <p>
                            • <strong>Error Handling:</strong> Robust retry logic and detailed
                            logging for troubleshooting
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettings;