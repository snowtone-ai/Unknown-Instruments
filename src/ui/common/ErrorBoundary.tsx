import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { errorMessage: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { errorMessage: error.message || '画面の描画に失敗しました。' };
  }

  componentDidCatch(): void {
    // React requires this hook for class error boundaries; UI state above handles recovery.
  }

  render() {
    if (this.state.errorMessage) {
      return (
        <article className="specimen-card empty-state">
          <h3>画面を復旧しました</h3>
          <p className="muted">{this.state.errorMessage}</p>
          <button className="secondary-button" type="button" onClick={() => this.setState({ errorMessage: '' })}>
            Retry
          </button>
        </article>
      );
    }
    return this.props.children;
  }
}
