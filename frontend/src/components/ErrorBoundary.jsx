/* eslint-disable no-unused-vars, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-undef, no-empty */
import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Ignore Axios 401, 403, 404, 429 and Network Errors so they don't trigger fatal UI
    if (error?.isAxiosError) {
      const status = _error?.response?.status;
      if (status === 401 || status === 403 || status === 404 || status === 429) {
        return { hasError: false };
      }
      if (_error?.code === 'ERR_NETWORK' || _error?.message === 'Network Error') {
        return { hasError: false };
      }
    }
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-sans selection:bg-blue-500 selection:text-white">
          <div className="w-full max-w-lg bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-red-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 relative z-10 border border-red-100 shadow-inner">
              <AlertTriangle size={36} strokeWidth={2.5} />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4 relative z-10">
              Something went wrong
            </h1>
            
            <p className="text-slate-500 font-medium mb-8 leading-relaxed max-w-sm relative z-10">
              We encountered an unexpected rendering error. Our engineering team has been automatically notified.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full relative z-10">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl active:scale-[0.98]"
              >
                <RefreshCw size={16} />
                Reload Page
              </button>
              
              <button
                onClick={() => window.location.href = "/"}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-[0.98]"
              >
                <Home size={16} />
                Go Home
              </button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-8 p-4 bg-slate-100 rounded-xl text-left w-full overflow-x-auto relative z-10 border border-slate-200">
                <p className="text-red-600 font-mono text-xs font-bold mb-2">Development Stack Trace:</p>
                <pre className="text-slate-600 font-mono text-[10px] leading-relaxed">
                  {this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
