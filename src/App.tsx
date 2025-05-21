
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import ProfileSettings from "./pages/ProfileSettings";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/MainLayout";
import WalletPage from "./pages/wallet/WalletPage";
import TransactionsPage from "./pages/transactions/TransactionsPage";
import SettlementsPage from "./pages/settlements/SettlementsPage";
import MonnifyStatusPage from "./pages/monnify/MonnifyStatusPage";
import IceDataPage from "./pages/icedata/IceDataPage";
import SettingsPage from "./pages/settings/SettingsPage";
import { useAuth } from "./hooks/use-auth";
import { useEffect } from "react";
import { initStorage } from "./integrations/supabase/storage";

const queryClient = new QueryClient();

// Initialize storage buckets
const StorageInitializer = () => {
  useEffect(() => {
    initStorage().catch(console.error);
  }, []);
  
  return null;
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<ProfileSettings />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="settlements" element={<SettlementsPage />} />
        <Route path="monnify" element={<MonnifyStatusPage />} />
        <Route path="icedata" element={<IceDataPage />} />
        <Route path="settings" element={<SettingsPage />} />
        {/* Add more dashboard routes here */}
      </Route>
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// App component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StorageInitializer />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
