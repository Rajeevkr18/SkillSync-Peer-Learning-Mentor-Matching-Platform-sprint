import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // navigate back to dashboard to give the user a clean slate
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '2rem',
          gap: '1rem',
        }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <h2 style={{ color: 'var(--text-primary, #fff)', margin: 0 }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-secondary, #aaa)', maxWidth: '480px', margin: 0 }}>
            An unexpected error occurred on this page. This is usually caused by unexpected data
            from the server.
          </p>
          {this.state.error && (
            <pre style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '0.75rem',
              color: '#f87171',
              maxWidth: '560px',
              overflowX: 'auto',
              textAlign: 'left',
            }}>
              {this.state.error.message}
            </pre>
          )}
          <button
            className="btn btn-primary"
            onClick={this.handleReset}
          >
            🔄 Go to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
