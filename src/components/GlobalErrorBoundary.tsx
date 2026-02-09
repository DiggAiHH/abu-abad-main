import { AlertTriangle, Copy, RefreshCw } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';
import i18n from '../i18n';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  userNote: string;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    userNote: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, userNote: '' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleCopyReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userNote: this.state.userNote,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    alert(i18n.t('errors:errorReportCopiedAlert'));
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden border border-red-200">
            <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-800">{i18n.t('errors:unexpectedError')}</h2>
                <p className="text-sm text-red-600">{i18n.t('errors:systemCaughtException')}</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 font-mono text-sm overflow-auto max-h-48">
                <p className="font-bold text-red-600 mb-2">{this.state.error?.toString()}</p>
                <pre className="text-gray-600 text-xs whitespace-pre-wrap">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {i18n.t('errors:whatWereYouDoing')}
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder={i18n.t('errors:whatWereYouDoingPlaceholder')}
                  value={this.state.userNote}
                  onChange={(e) => this.setState({ userNote: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={this.handleReload}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  {i18n.t('errors:reloadPage')}
                </button>
                <button
                  onClick={this.handleCopyReport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {i18n.t('errors:copyReportForSupport')}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
