// This file catches render errors and shows a recovery screen.
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main id="main-content" tabIndex={-1} className="screen error-screen" aria-labelledby="screen-title">
          <p className="eyebrow">Something broke</p>
          <h1 id="screen-title">The hall went quiet.</h1>
          <p className="hero__lead">
            Reload to start again. Belt progress is session-only, so a refresh
            resets it to White.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
