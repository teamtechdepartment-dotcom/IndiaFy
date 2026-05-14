import React from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

/**
 * SellerErrorBoundary
 *
 * Wraps seller dashboard pages to prevent white-screen crashes.
 * Shows a friendly recovery UI with retry and "Back to Hub" options.
 *
 * Usage:
 *   <SellerErrorBoundary>
 *     <SomeSellerPage />
 *   </SellerErrorBoundary>
 */
class SellerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("[SellerErrorBoundary] Caught error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Something went wrong
          </h2>

          <p className="text-slate-500 text-sm mb-1 leading-relaxed">
            {this.props.pageName
              ? `The ${this.props.pageName} page encountered an error.`
              : "This page encountered an unexpected error."}
          </p>

          {this.state.error && (
            <p className="text-xs font-mono text-red-400 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-6 text-left break-all">
              {this.state.error.message}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={this.handleRetry}
              className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = "/seller-hub")}
              className="w-full py-3.5 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Return to Seller Hub
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default SellerErrorBoundary;
