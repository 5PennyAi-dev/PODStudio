import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-void-bg text-white p-4">
           <div className="max-w-md w-full bg-void-surface border border-red-500/30 p-6 rounded-xl">
             <h1 className="text-xl font-bold text-red-500 mb-2">Something went wrong</h1>
             <p className="text-void-text-muted text-sm mb-4">
               {this.state.error?.message}
             </p>
             <button 
               onClick={() => window.location.reload()}
               className="px-4 py-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"
             >
               Reload Application
             </button>
           </div>
        </div>
      );
    }

    return this.props.children;
  }
}
