import React from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";

/**
 * GlobalErrorBoundary
 * Catches all unhandled React component render crashes across the entire application.
 * Prevents white-screen bugs and displays a high-end recovery view instead.
 */
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You could send logs to an error tracker service like Sentry here.
    console.error("🔴 [GlobalErrorBoundary] App Crashed:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white px-6 font-sans relative overflow-hidden">
          {/* Background decorative radial gradient */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none z-0" />
          
          <div className="relative z-10 max-w-md w-full bg-zinc-900/80 border border-zinc-800 backdrop-blur-2xl rounded-[2.5rem] p-8 lg:p-10 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] text-center">
            
            {/* Icon Header */}
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
              <AlertOctagon className="w-8 h-8 text-red-500" />
            </div>

            <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
              Interface <span className="text-zinc-600 italic">Faulted</span>
            </h1>
            
            <p className="text-zinc-500 text-xs uppercase font-black tracking-[0.2em] mb-6">
              Critical Rendering Failure
            </p>

            <p className="text-zinc-400 text-sm font-medium mb-6 leading-relaxed">
              The Indiafy UI core encountered an unhandled state exception. Try reloading the node interface or return to the dashboard.
            </p>

            {/* Error Code Debug Message (Sanitized) */}
            {this.state.error && (
              <div className="bg-black/50 border border-zinc-800/60 rounded-2xl p-4 mb-8 text-left overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Telemetry Log:</p>
                <p className="text-xs font-mono text-red-400/90 break-all max-h-24 overflow-y-auto custom-scrollbar">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* Recovery CTA's */}
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] shadow-xl"
              >
                <RefreshCw size={14} className="animate-spin-slow" />
                Re-sync Interface
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full py-4 bg-zinc-800 text-zinc-400 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-zinc-700 hover:text-white border border-transparent hover:border-zinc-600 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Home size={14} />
                Return to Marketplace
              </button>
            </div>
            
            <p className="mt-8 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              System Node: HYPERLOCAL-MAIN-CLUSTER
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
