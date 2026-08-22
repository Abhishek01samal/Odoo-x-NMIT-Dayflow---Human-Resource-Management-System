import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: "40px",
            fontFamily: "monospace",
            color: "#b91c1c",
            background: "#fef2f2",
            whiteSpace: "pre-wrap",
          }}
        >
          <h1 style={{ fontSize: "20px" }}>Dayflow crashed</h1>
          <p style={{ fontWeight: 700 }}>{this.state.error.message}</p>
          <pre style={{ fontSize: "12px", marginTop: "16px" }}>
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;


