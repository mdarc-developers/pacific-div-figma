import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ConferenceHeaderErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ConferenceHeader error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-center py-3 px-4 rounded"
          data-testid="conference-header-error"
        >
          Conference header could not be loaded.
        </div>
      );
    }
    return this.props.children;
  }
}
