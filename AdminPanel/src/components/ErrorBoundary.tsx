import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary for the Admin Panel.
 *
 * Wraps individual pages/sections to prevent a single crash from
 * taking down the entire admin panel application.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { componentName = 'Unknown' } = this.props;
    console.error(`[ErrorBoundary: ${componentName}] Runtime Error:`, error, errorInfo);
    // In production: report to Sentry / Firebase Crashlytics
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) return children;

    if (fallback && error) {
      return fallback(error, this.resetError);
    }

    const isDev = import.meta.env.DEV;

    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          padding: '32px',
          margin: '16px',
          background: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)',
          borderRadius: '20px',
          border: '1px solid #fecaca',
          textAlign: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            marginBottom: '8px',
          }}
        >
          ⚠️
        </div>

        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#1e293b',
            margin: 0,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          Something went wrong
        </h2>

        <p
          style={{
            fontSize: '14px',
            color: '#64748b',
            margin: 0,
            maxWidth: '400px',
            lineHeight: '1.6',
          }}
        >
          This section encountered an error. Your data is safe. Reload the page or click below to retry.
        </p>

        {isDev && error && (
          <pre
            style={{
              background: '#1e293b',
              color: '#f8fafc',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              textAlign: 'left',
              maxWidth: '100%',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              margin: '8px 0',
              maxHeight: '140px',
            }}
          >
            {error.stack || error.message}
          </pre>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button
            onClick={this.resetError}
            style={{
              padding: '10px 24px',
              background: '#003D9B',
              color: '#fff',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui, sans-serif',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            🔄 Retry
          </button>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              background: 'transparent',
              color: '#64748b',
              border: '1.5px solid #e2e8f0',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
