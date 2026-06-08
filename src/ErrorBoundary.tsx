import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Amazon Study Helper render failure", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="app-shell">
          <section className="coach-panel">
            <div>
              <div className="section-label">Startup Diagnostic</div>
              <h1>App render failed</h1>
              <p>{this.state.error.message}</p>
            </div>
            <button onClick={() => window.location.reload()}>Reload App</button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
