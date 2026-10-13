import { Component, type ReactNode } from "react";
import { Button } from "./Button";

type Props = {
  children: ReactNode;
};

type State = {
  crashed: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { crashed: false };

  // Only class components can catch render crashes;
  // function components and hooks cannot do this.
  static getDerivedStateFromError(): State {
    return { crashed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    if (this.state.crashed) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
          <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 text-center">
            <h1 className="text-lg font-semibold text-gray-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              The page crashed. Your sales are safe — try reloading.
            </p>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Reload page
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
