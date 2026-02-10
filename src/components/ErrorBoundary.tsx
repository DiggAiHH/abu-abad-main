import { AlertTriangle } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';
import i18n from '../i18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  userFeedback: string;
  copied: boolean;
}

/**
 * Error Boundary Component
 * Fängt React-Fehler und zeigt Fallback-UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      userFeedback: '',
      copied: false,
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // HISTORY-AWARE: Use existing logging infrastructure
    // DSGVO-SAFE: No external error tracking, local-only
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      const win = window as Window & {
        logError?: (err: unknown, ctx: string, info?: unknown) => void;
      };
      win.logError?.(error, 'ErrorBoundary', errorInfo);
    } else if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // DSGVO-SAFE: Send error report to local backend (opt-in only)
    this.sendErrorReport(error, errorInfo);
  }

  sendErrorReport = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorReport = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorMessage: error.message,
        errorStack: error.stack,
        componentStack: errorInfo.componentStack,
        userFeedback: this.state.userFeedback,
      };

      // DSGVO-SAFE: Only send to local backend (no third-party)
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport),
      }).catch(() => {
        // Silent fail - don't crash on error reporting
        if (import.meta.env.DEV) {
          console.warn('Failed to send error report to backend');
        }
      });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error reporting failed:', err);
      }
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      userFeedback: '',
      copied: false,
    });

    // Seite neu laden
    window.location.href = '/';
  };

  // PHASE 3: Error Report Copy-to-Clipboard
  handleCopyErrorReport = async () => {
    const report = {
      timestamp: new Date().toISOString(),
      error: {
        message: this.state.error?.message,
        stack: this.state.error?.stack,
        componentStack: this.state.errorInfo?.componentStack,
      },
      userFeedback: this.state.userFeedback,
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      // Fallback für Browser ohne Clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = JSON.stringify(report, null, 2);
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom Fallback UI wenn vorhanden
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Standard Fallback UI
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
          <div className='max-w-md w-full bg-white rounded-lg shadow-xl p-8'>
            <div className='flex items-center justify-center mb-6'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center'>
                <AlertTriangle className='w-8 h-8 text-red-600' />
              </div>
            </div>

            <h1 className='text-2xl font-bold text-gray-900 text-center mb-4'>
              {i18n.t('errors:errorOccurred')}
            </h1>

            <p className='text-gray-600 text-center mb-6'>{i18n.t('errors:sorryTryAgain')}</p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className='mb-6 p-4 bg-gray-100 rounded-lg'>
                <summary className='cursor-pointer font-medium text-sm text-gray-700 mb-2'>
                  {i18n.t('errors:errorDetailsDevOnly')}
                </summary>
                <div className='text-xs text-gray-600 overflow-auto'>
                  <p className='font-bold mb-2'>{this.state.error.toString()}</p>
                  <pre className='whitespace-pre-wrap'>{this.state.errorInfo?.componentStack}</pre>
                </div>
              </details>
            )}

            {/* PHASE 3: User Feedback for Error Report */}
            <div className='mb-6'>
              <label
                htmlFor='user-feedback'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                {i18n.t('errors:whatHappened')}
              </label>
              <textarea
                id='user-feedback'
                rows={3}
                value={this.state.userFeedback}
                onChange={e => this.setState({ userFeedback: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder={i18n.t('errors:whatHappenedPlaceholder')}
              />
            </div>

            <div className='space-y-3'>
              {/* PHASE 3: Copy Error Report Button */}
              <button
                onClick={this.handleCopyErrorReport}
                className={`w-full py-2 px-4 rounded-lg transition font-medium ${
                  this.state.copied
                    ? 'bg-green-600 text-white'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                {this.state.copied
                  ? i18n.t('errors:errorReportCopied')
                  : i18n.t('errors:copyErrorReport')}
              </button>

              <button
                onClick={this.handleReset}
                className='w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium'
              >
                {i18n.t('errors:goToHome')}
              </button>

              <button
                onClick={() => window.location.reload()}
                className='w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition font-medium'
              >
                {i18n.t('errors:reloadPage')}
              </button>
            </div>

            <p className='mt-6 text-xs text-gray-500 text-center'>
              {i18n.t('errors:persistentErrorNotice')}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
