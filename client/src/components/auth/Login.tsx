import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input, Button, Card, CardBody, CardHeader, Divider } from '@nextui-org/react';
import { Mail, Lock, AlertCircle, Shield, GraduationCap } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { login, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      setFormError(error);
    }
  }, [error]);

  const validateForm = () => {// Form vlidation for Email and Password
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return false;
    } else if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {// Email validation regex pattern
      setFormError('Please enter a valid email address');
      return false;
    } else if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    clearError();
    setFormError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);// Login call from AuthContext
    } catch (err) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background dark:bg-background-dark">
      <div className="w-full max-w-md">

        <Card className="border border-secondary/10 dark:border-secondary-dark/10 shadow-xl bg-surface dark:bg-surface-dark">
          <CardHeader className="flex flex-col gap-2 items-center pb-6 pt-8">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-8 h-8 text-primary dark:text-primary-dark" />
              <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">SPMS Admin</h1>
            </div>
            <p className="text-secondary dark:text-secondary-dark text-center text-sm max-w-xs">
              Sign in to access the Student Progress Management System
            </p>
          </CardHeader>

          <Divider className="bg-secondary/20 dark:bg-secondary-dark/20" />

          <CardBody className="py-8 px-6">
            {formError && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 flex items-start gap-3 text-sm">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="email"
                  label="Admin Email"
                  placeholder="Enter your admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  startContent={<Mail className="w-4 h-4 text-secondary dark:text-secondary-dark" />}
                  isRequired
                  fullWidth
                  classNames={{
                    label: "text-secondary dark:text-secondary-dark font-medium",
                    input: "text-text-primary dark:text-text-primary-dark",
                    inputWrapper: "bg-background dark:bg-background-dark border border-secondary/20 dark:border-secondary-dark/20 hover:border-primary/40 dark:hover:border-primary-dark/40 focus-within:border-primary dark:focus-within:border-primary-dark transition-colors"
                  }}
                />
              </div>

              <div>
                <Input
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  startContent={<Lock className="w-4 h-4 text-secondary dark:text-secondary-dark" />}
                  isRequired
                  fullWidth
                  classNames={{
                    label: "text-secondary dark:text-secondary-dark font-medium",
                    input: "text-text-primary dark:text-text-primary-dark",
                    inputWrapper: "bg-background dark:bg-background-dark border border-secondary/20 dark:border-secondary-dark/20 hover:border-primary/40 dark:hover:border-primary-dark/40 focus-within:border-primary dark:focus-within:border-primary-dark transition-colors"
                  }}
                />
              </div>

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary dark:text-primary-dark hover:text-primary/80 dark:hover:text-primary-dark/80 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                fullWidth
                className="bg-black text-white font-semibold h-12 rounded-xl hover:bg-zinc-900 transition-colors"
                size="lg"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In to SPMS'}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-background dark:bg-background-dark rounded-xl border border-secondary/10 dark:border-secondary-dark/10">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-tertiary dark:text-tertiary-dark" />
                <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">Secure Access</span>
              </div>
              <p className="text-xs text-secondary dark:text-secondary-dark leading-relaxed">
                This system uses encrypted connections and secure authentication.
                Your login credentials are protected with industry-standard security measures.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Login;
