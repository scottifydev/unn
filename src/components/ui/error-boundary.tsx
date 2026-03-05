"use client";

import { Component } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-8 h-0.5 bg-garnet mb-6" />
          <h2 className="font-cinzel text-paper text-xl mb-2">
            Something went wrong
          </h2>
          <p className="font-crimson text-stone mb-6">
            An unexpected error occurred.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="font-barlow uppercase text-tag bg-garnet text-paper px-4 py-2 hover:bg-garnet-bright transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
