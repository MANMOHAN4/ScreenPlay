import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
          <div className="max-w-sm w-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={26} className="text-red-400" />
            </div>
            <h2 className="text-white font-bold text-lg mb-2">
              Something went wrong
            </h2>
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">
              An unexpected error occurred. Please refresh the page to try
              again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary justify-center mx-auto"
            >
              <RefreshCw size={14} />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
