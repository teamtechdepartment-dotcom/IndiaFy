import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

export class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  async componentDidCatch(error, errorInfo) {
    console.error("Admin Component Error Boundary caught an error:", error, errorInfo);
    try {
      await axiosInstance.post("/admin/management/system-logs", {
        component: this.props.title || "unknown",
        page: window.location.pathname,
        route: window.location.search || "/",
        errorMessage: error?.message || String(error),
        errorStack: errorInfo?.componentStack || error?.stack || "No stack trace available",
      });
    } catch (err) {
      console.error("Failed to submit client error telemetry report:", err.message);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50/80 border border-red-200 rounded-2xl p-6 sm:p-8 text-center shadow-sm my-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-red-900 mb-1">
            {this.props.title || "Unable to load section statistics"}
          </h3>
          <p className="text-xs sm:text-sm text-red-700 max-w-md mx-auto mb-4">
            An unexpected render error occurred in this module component. The rest of the Admin workspace remains fully operational.
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-700 transition"
          >
            <RefreshCw size={14} /> Retry Loading
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;
