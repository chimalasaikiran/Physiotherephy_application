import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Fallback render for specific sections — defaults to full-screen error */
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  /** Screen-level boundary shows full-screen fallback. Section-level shows inline card. */
  level?: 'screen' | 'section';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global React Error Boundary for the Physiotherapy mobile app.
 *
 * Wrap at two levels:
 * 1. App root level (screen-level) — catches catastrophic crashes
 * 2. Feature/screen level (section-level) — limits blast radius to single screen
 *
 * Usage:
 *   <ErrorBoundary level="screen">
 *     <RootApp />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary level="section">
 *     <RecoveryScreen />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // In production: report to crash analytics (Sentry, Firebase Crashlytics, etc.)
    console.error('[ErrorBoundary] Caught runtime error:', error, errorInfo);
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, level = 'screen' } = this.props;

    if (!hasError) return children;

    // Use custom fallback if provided
    if (fallback && error) {
      return fallback(error, this.resetError);
    }

    const isDev = __DEV__;

    if (level === 'section') {
      return (
        <View style={styles.sectionContainer}>
          <Ionicons name="alert-circle-outline" size={28} color="#EF4444" />
          <Text style={styles.sectionTitle}>Something went wrong</Text>
          {isDev && error && (
            <Text style={styles.sectionDevError} numberOfLines={3}>
              {error.message}
            </Text>
          )}
          <TouchableOpacity
            style={styles.sectionRetryBtn}
            onPress={this.resetError}
            activeOpacity={0.8}
          >
            <Text style={styles.sectionRetryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <SafeAreaView style={styles.screenContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.screenContent}>
          <View style={styles.iconCircle}>
            <Ionicons name="medical-outline" size={44} color="#003D9B" />
          </View>

          <Text style={styles.screenTitle}>Oops! Something went wrong</Text>
          <Text style={styles.screenSubtitle}>
            The app ran into an unexpected error. Your session data is safe.
          </Text>

          {isDev && error && (
            <View style={styles.devErrorBox}>
              <Text style={styles.devErrorLabel}>DEV — Error Details:</Text>
              <Text style={styles.devErrorText} numberOfLines={5}>
                {error.message}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={this.resetError}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Reload Screen</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  /* Full-screen level */
  screenContainer: {
    flex: 1,
    backgroundColor: '#FAFCFF',
    justifyContent: 'center',
  },
  screenContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  devErrorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  devErrorLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  devErrorText: {
    fontSize: 12,
    color: '#7F1D1D',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  primaryBtn: {
    height: 52,
    paddingHorizontal: 28,
    borderRadius: 9999,
    backgroundColor: '#003D9B',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Section level (inline card) */
  sectionContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7F1D1D',
    marginTop: 8,
    marginBottom: 6,
  },
  sectionDevError: {
    fontSize: 12,
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  sectionRetryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#EF4444',
  },
  sectionRetryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ErrorBoundary;
