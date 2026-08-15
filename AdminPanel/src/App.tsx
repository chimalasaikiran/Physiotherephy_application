import {
  LoginPage,
  AuthProvider,
  useAuth,
  ForcePasswordChangeModal,
} from '@/auth';
import { DashboardPage } from '@/dashboard';

function MainAppContent() {
  const { isAuthenticated, isLoading, authError, logout, clearAuthError } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white font-sans">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-blue-500/20" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Verifying Security Credentials & Role Permissions...
        </p>
      </div>
    );
  }

  // If authenticated as active Admin, render Dashboard with Force Password Change protection modal
  if (isAuthenticated) {
    return (
      <>
        <ForcePasswordChangeModal />
        <DashboardPage onLogout={logout} />
      </>
    );
  }

  return (
    <div className="relative min-h-screen">
      {authError && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-red-600 text-white shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-semibold">{authError}</span>
          <button
            onClick={clearAuthError}
            className="ml-2 hover:bg-red-700 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      <LoginPage />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
