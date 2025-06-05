import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react"; // Add React import explicitly
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/MainLayout";
import { useAuth } from "./hooks/use-auth";
import { useEffect } from "react";
import { initStorage } from "./integrations/supabase/storage";

// New Pages
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/users/UserManagement";
import CreateLoginDetails from "./pages/users/CreateLoginDetails";
import StudentManagement from "./pages/students/StudentManagement";
import ClassSubjectManagement from "./pages/classes/ClassSubjectManagement";
import ResultEntry from "./pages/results/ResultEntry";
import ResultApproval from "./pages/results/ResultApproval";
import ClassRanking from "./pages/ranking/ClassRanking";
import ReportCardDesigner from "./pages/reportcards/ReportCardDesigner";
import SchoolBranding from "./pages/branding/SchoolBranding";
import ScratchCards from "./pages/scratchcards/ScratchCards";
import AnalyticsDashboard from "./pages/analytics/AnalyticsDashboard";
import SettingsPage from "./pages/settings/SettingsPage";
import StudentResultPortal from "./pages/students/StudentResultPortal";
import ManageUsers from "./pages/users/ManageUsers";
import RolePermissions from "./pages/users/RolePermissions";

// Create a new client
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
      <Route path="/student-results" element={<StudentResultPortal />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="users/create-login" element={<CreateLoginDetails />} />
        <Route path="users/manage" element={<ManageUsers />} />
        <Route path="users/permissions" element={<RolePermissions />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="classes" element={<ClassSubjectManagement />} />
        <Route path="results/entry" element={<ResultEntry />} />
        <Route path="results/approval" element={<ResultApproval />} />
        <Route path="ranking" element={<ClassRanking />} />
        <Route path="reportcards" element={<ReportCardDesigner />} />
        <Route path="branding" element={<SchoolBranding />} />
        <Route path="scratchcards" element={<ScratchCards />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// App component - Make sure we explicitly wrap in React.StrictMode
const App = () => {
  return (
    <React.StrictMode>
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
    </React.StrictMode>
  );
};

export default App;
