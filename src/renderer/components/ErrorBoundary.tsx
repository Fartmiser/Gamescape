import React, { Component, ReactNode } from 'react';


interface Props {
  children: ReactNode;
}


interface State {
  hasError: boolean;
  error: Error | null;
}


export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }


  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }


  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }


  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-900">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Oops!</h1>
            <p className="text-gray-300 mb-4">Something went wrong.</p>
            <pre className="text-left bg-gray-800 text-red-400 p-4 rounded text-xs overflow-auto mb-4">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }


    return this.props.children;
  }
}
