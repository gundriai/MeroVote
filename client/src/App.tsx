import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import AdminGuard from "@/components/AdminGuard";

// Lazy load pages
const Home = lazy(() => import("@/pages/home"));
const Admin = lazy(() => import("@/pages/admin"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Login = lazy(() => import("@/components/login"));
const AuthSuccess = lazy(() => import("./components/AuthSuccess"));
const Privacy = lazy(() => import("@/pages/privacy"));
const DataDeletion = lazy(() => import("@/pages/data-deletion"));
const MartyrsWall = lazy(() => import("@/pages/martyrs-wall"));
const RevolutionJourney = lazy(() => import("@/pages/revolution-journey"));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/revolution-journey" component={RevolutionJourney} />
        <Route path="/">
          {() => <Home />}
        </Route>
        <Route path="/poll/:id">
          {(params) => <Home pollId={params.id} />}
        </Route>
        <Route path="/admin">
          <AdminGuard>
            <Admin />
          </AdminGuard>
        </Route>
        <Route path="/login" component={Login} />
        <Route path="/auth/success" component={AuthSuccess} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/data-deletion" component={DataDeletion} />
        <Route path="/martyrs-wall" component={MartyrsWall} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50 font-nepali">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
