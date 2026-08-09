import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { LoginFormValues, LoginFormErrors } from '../types/auth';
import { AUTH_CONFIG } from '../config/authConfig';

export const useLoginForm = (onSuccess?: (values: LoginFormValues) => void) => {
  const [values, setValues] = useState<LoginFormValues>({
    email: AUTH_CONFIG.emailPlaceholder,
    password: '••••••••',
    rememberMe: false,
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
    } else if (values.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Simulate API sign-in delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (onSuccess) {
        onSuccess(values);
      }
    } catch {
      setErrors({ general: 'Authentication failed. Please check your credentials.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Initiated Google OAuth Sign-in');
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
