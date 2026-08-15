import { Suspense, lazy } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { ErrorBoundary } from "@/components/error-boundary";
import { Loader } from "lucide-react";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

// The landing page and the 404 are bundled with the app itself; everything else
// is fetched when someone actually goes there. A visitor who never signs in was
// previously downloading the whole messenger to read the home page.
const Auth = lazy(() => import("@/pages/auth"));
const Discover = lazy(() => import("@/pages/discover"));
const Profile = lazy(() => import("@/pages/profile"));
const Messages = lazy(() => import("@/pages/messages"));
const CreateProfile = lazy(() => import("@/pages/create-profile"));
const CreateEvent = lazy(() => import("@/pages/create-event"));
const CreateStory = lazy(() => import("@/pages/create-story"));
const LikedProfiles = lazy(() => import("@/pages/liked-profiles"));
const Settings = lazy(() => import("@/pages/settings"));
const Onboarding = lazy(() => import("@/pages/onboarding"));
const Community = lazy(() => import("@/pages/community"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));
const About = lazy(() => import("@/pages/about"));
const Help = lazy(() => import("@/pages/help"));
const Terms = lazy(() => import("@/pages/document-pending").then((m) => ({ default: m.Terms })));
const Privacy = lazy(() => import("@/pages/document-pending").then((m) => ({ default: m.Privacy })));
const Guidelines = lazy(() => import("@/pages/document-pending").then((m) => ({ default: m.Guidelines })));
const Blog = lazy(() => import("@/pages/document-pending").then((m) => ({ default: m.Blog })));

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
        {/* Matches the loading state pages show while their own data arrives,
            so a page arriving over the network looks like a page thinking. */}
        <Suspense
          fallback={
            <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
              <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Auth} />
          {/* Reached from the sign-in form and from the emailed link. */}
          <Route path="/reset-password" component={ResetPassword} />
          {/* Linked from the footer, which signed-out visitors also see. */}
          <Route path="/about" component={About} />
          <Route path="/help" component={Help} />
          {/* Linked from the footer; real text still to come. */}
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/guidelines" component={Guidelines} />
          <Route path="/blog" component={Blog} />
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
        </Suspense>
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
