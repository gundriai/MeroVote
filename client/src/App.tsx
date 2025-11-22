import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import Login from "@/components/login";
import AuthSuccess from "./components/AuthSuccess";
import Privacy from "@/pages/privacy";
import AdminGuard from "@/components/AdminGuard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin">
        <AdminGuard>
          <Admin />
        </AdminGuard>
      </Route>
      <Route path="/login" component={Login}/>
      <Route path="/auth/success" component={AuthSuccess}/>
  <Route path="/privacy" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
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
