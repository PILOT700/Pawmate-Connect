import { Component, type ErrorInfo, type ReactNode } from "react";
import { PawPrint, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportError } from "@/lib/report-error";

interface Props {
  children: ReactNode;
}

interface State {
  crashed: boolean;
}

/**
 * Without this, a crash while rendering unmounts the whole tree and leaves a
 * blank page — the person cannot tell the app from their connection, and
 * nobody is told it happened.
 *
 * Still a class component: catching a render error is the one thing hooks
 * cannot do.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { crashed: false };

  static getDerivedStateFromError(): State {
    return { crashed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, "render");
    // Keeps the component stack in the browser console for whoever is looking
    // at the actual screen; the server only receives the error itself.
    console.error("Render failed", error, info.componentStack);
  }

  override render() {
    if (!this.state.crashed) return this.props.children;

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-6">
          <PawPrint className="w-7 h-7 text-muted-foreground" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-foreground mb-3">
          Something went wrong on this page
        </h1>
        <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
          It's been reported, so we know about it. Reloading usually gets you moving again.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="rounded-full px-8 h-12 bg-primary text-primary-foreground"
          data-testid="btn-reload-after-crash"
        >
          <RotateCw className="w-4 h-4 mr-2" /> Reload the page
        </Button>
      </div>
    );
  }
}
