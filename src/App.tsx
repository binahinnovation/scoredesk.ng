
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import StudentManagement from "./pages/students/StudentManagement";
import StudentResultPortal from "./pages/students/StudentResultPortal";
import ClassSubjectManagement from "./pages/classes/ClassSubjectManagement";
import ResultEntry from "./pages/results/ResultEntry";
import ResultApproval from "./pages/results/ResultApproval";
import ClassRanking from "./pages/ranking/ClassRanking";
import ReportCardDesigner from "./pages/reportcards/ReportCardDesigner";
import ScratchCards from "./pages/scratchcards/ScratchCards";
import UserManagement from "./pages/users/UserManagement";
import ManageUsers from "./pages/users/ManageUsers";
import CreateLoginDetails from "./pages/users/CreateLoginDetails";
import RolePermissions from "./pages/users/RolePermissions";
import SettingsPage from "./pages/settings/SettingsPage";
import TermManagementPage from "./pages/settings/TermManagement";
import SchoolBranding from "./pages/branding/SchoolBranding";
import AnalyticsDashboard from "./pages/analytics/AnalyticsDashboard";
import WalletPage from "./pages/wallet/WalletPage";
import TransactionsPage from "./pages/transactions/TransactionsPage";
import SettlementsPage from "./pages/settlements/SettlementsPage";
import MonnifyStatusPage from "./pages/monnify/MonnifyStatusPage";
import IceDataPage from "./pages/icedata/IceDataPage";
import ProfileSettings from "./pages/ProfileSettings";
import { LoadingSpinner } from "./components/LoadingSpinner";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />
      <Route path="/super-admin" element={!user ? <SuperAdminLogin /> : <Navigate to="/" />} />
      
      {/* Protected routes */}
      {user ? (
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="student-portal" element={<StudentResultPortal />} />
          <Route path="classes" element={<ClassSubjectManagement />} />
          <Route path="results" element={<ResultEntry />} />
          <Route path="approval" element={<ResultApproval />} />
          <Route path="ranking" element={<ClassRanking />} />
          <Route path="reportcards" element={<ReportCardDesigner />} />
          <Route path="scratchcards" element={<ScratchCards />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="create-login" element={<CreateLoginDetails />} />
          <Route path="permissions" element={<RolePermissions />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="terms" element={<TermManagementPage />} />
          <Route path="branding" element={<SchoolBranding />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="settlements" element={<SettlementsPage />} />
          <Route path="monnify" element={<MonnifyStatusPage />} />
          <Route path="icedata" element={<IceDataPage />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
