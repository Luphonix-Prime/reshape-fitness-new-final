import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { apiRequest } from "./lib/queryClient";

import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import MemberDashboard from "@/pages/MemberDashboard";
import TrainerDashboard from "@/pages/TrainerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Subscribe from "@/pages/Subscribe";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={!isAuthenticated ? Login : Home} />
      <Route path="/landing" component={Landing} />
      <Route path="/about" component={About} />
      <Route path="/services" component={Services} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/membership" component={Subscribe} />
      
      {/* Protected routes - redirect to login if not authenticated */}
      <Route path="/member-dashboard">
        {!isAuthenticated ? <Login /> : <MemberDashboard />}
      </Route>
      <Route path="/trainer-dashboard">
        {!isAuthenticated ? <Login /> : <TrainerDashboard />}
      </Route>
      <Route path="/admin-dashboard">
        {!isAuthenticated ? <Login /> : <AdminDashboard />}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;