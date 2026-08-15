import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { ErrorBoundary } from "@/components/error-boundary";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Discover from "@/pages/discover";
import Profile from "@/pages/profile";
import Messages from "@/pages/messages";
import CreateProfile from "@/pages/create-profile";
import CreateEvent from "@/pages/create-event";
import CreateStory from "@/pages/create-story";
import LikedProfiles from "@/pages/liked-profiles";
import Settings from "@/pages/settings";
import Onboarding from "@/pages/onboarding";
import Community from "@/pages/community";
import ResetPassword from "@/pages/reset-password";
import About from "@/pages/about";
import Help from "@/pages/help";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A 401 is a definitive answer for a signed-out visitor, not a blip.
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Auth} />
          {/* Reached from the sign-in form and from the emailed link. */}
          <Route path="/reset-password" component={ResetPassword} />
          {/* Linked from the footer, which signed-out visitors also see. */}
          <Route path="/about" component={About} />
          <Route path="/help" component={Help} />
          <Route path="/discover">
            <ProtectedRoute component={Discover} />
          </Route>
          <Route path="/profile/:id">
            <ProtectedRoute component={Profile} />
          </Route>
          <Route path="/messages">
            <ProtectedRoute component={Messages} />
          </Route>
          <Route path="/create-profile">
            <ProtectedRoute component={CreateProfile} />
          </Route>
          <Route path="/create-event">
            <ProtectedRoute component={CreateEvent} />
          </Route>
          <Route path="/create-story">
            <ProtectedRoute component={CreateStory} />
          </Route>
          <Route path="/liked">
            <ProtectedRoute component={LikedProfiles} />
          </Route>
          <Route path="/settings">
            <ProtectedRoute component={Settings} />
          </Route>
          <Route path="/onboarding">
            <ProtectedRoute component={Onboarding} />
          </Route>
          <Route path="/community">
            <ProtectedRoute component={Community} />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    // Outside every provider, so a crash inside one of them is still caught.
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
