import { useState } from 'react';
import {
  LoginPage,
  ForgotPasswordPage,
  VerifyIdentityPage,
  CreatePasswordPage,
  PasswordResetSuccessPage,
} from '@/auth';
import { DashboardPage } from '@/dashboard';

export function App() {
  const [currentView, setCurrentView] = useState<
    'login' | 'forgot-password' | 'verify-identity' | 'create-password' | 'password-reset-success' | 'dashboard'
  >('dashboard');
  const [resetEmail, setResetEmail] = useState<string>('dr.smith@onemedical.com');

  return (
    <div className="relative min-h-screen">
      {currentView === 'dashboard' ? (
        <DashboardPage onLogout={() => setCurrentView('login')} />
      ) : currentView === 'forgot-password' ? (
        <ForgotPasswordPage
          onBackToLogin={() => setCurrentView('login')}
          onSuccess={(email) => {
            if (email) setResetEmail(email);
            setCurrentView('verify-identity');
          }}
        />
      ) : currentView === 'verify-identity' ? (
        <VerifyIdentityPage
          email={resetEmail}
          onBackToForgotPassword={() => setCurrentView('forgot-password')}
          onSuccess={(code) => {
            console.log(`Identity verified with code: ${code}`);
            setCurrentView('create-password');
          }}
        />
      ) : currentView === 'create-password' ? (
        <CreatePasswordPage
          onBackToLogin={() => setCurrentView('login')}
          onSuccess={() => {
            console.log('Password successfully reset, navigating to success screen');
            setCurrentView('password-reset-success');
          }}
        />
      ) : currentView === 'password-reset-success' ? (
        <PasswordResetSuccessPage
          onGoToLogin={() => setCurrentView('login')}
        />
      ) : (
        <LoginPage
          onLoginSuccess={() => {
            console.log('Login successful! Redirecting to Dashboard...');
            setCurrentView('dashboard');
          }}
          onNavigateToForgotPassword={() => setCurrentView('forgot-password')}
        />
      )}
    </div>
  );
}

export default App;


