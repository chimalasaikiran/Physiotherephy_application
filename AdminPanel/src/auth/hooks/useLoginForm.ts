import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import type { LoginFormValues, LoginFormErrors } from '../types/auth';

export const useLoginForm = (onSuccess?: (values: LoginFormValues) => void) => {
  const { login, loginWithGoogle } = useAuth();
  const [values, setValues] = useState<LoginFormValues>({
    email: '',
    password: '',
    rememberMe: true,
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof LoginFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!values.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!values.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      if (onSuccess) {
        onSuccess(values);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setErrors({ general: err.message || 'Authentication failed. Please verify credentials.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      if (onSuccess) {
        onSuccess(values);
      }
    } catch (err: any) {
      console.error('Google Sign-in Error:', err);
      setErrors({ general: err.message || 'Google sign-in failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    showPassword,
    isSubmitting,
    handleChange,
    handleSubmit,
    togglePasswordVisibility,
    handleGoogleSignIn,
  };
};
