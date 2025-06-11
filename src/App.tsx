
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
import CreateAdmin from "./pages/users/CreateAdmin";
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
import { ProtectedRoute } from "./components/ProtectedRoute";

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
          
          <Route path="students" element={
            <ProtectedRoute permission="Student Management">
              <StudentManagement />
            </ProtectedRoute>
          } />
          
          <Route path="student-portal" element={<StudentResultPortal />} />
          
          <Route path="classes" element={
            <ProtectedRoute permission="Class/Subject Setup">
              <ClassSubjectManagement />
            </ProtectedRoute>
          } />
          
          <Route path="results" element={
            <ProtectedRoute permission="Result Upload">
              <ResultEntry />
            </ProtectedRoute>
          } />
          
          <Route path="approval" element={
            <ProtectedRoute permission="Result Approval">
              <ResultApproval />
            </ProtectedRoute>
          } />
          
          <Route path="ranking" element={
            <ProtectedRoute permission="Position & Ranking">
              <ClassRanking />
            </ProtectedRoute>
          } />
          
          <Route path="reportcards" element={
            <ProtectedRoute permission="Report Card Designer">
              <ReportCardDesigner />
            </ProtectedRoute>
          } />
          
          <Route path="scratchcards" element={
            <ProtectedRoute permission="Scratch Card Generator">
              <ScratchCards />
            </ProtectedRoute>
          } />
          
          <Route path="user-management" element={
            <ProtectedRoute permission="User Management">
              <UserManagement />
            </ProtectedRoute>
          } />
          
          <Route path="users" element={
            <ProtectedRoute adminOnly>
              <ManageUsers />
            </ProtectedRoute>
          } />
          
          <Route path="create-login" element={
            <ProtectedRoute adminOnly>
              <CreateLoginDetails />
            </ProtectedRoute>
          } />

          <Route path="create-admin" element={
            <ProtectedRoute adminOnly>
              <CreateAdmin />
            </ProtectedRoute>
          } />
          
          <Route path="permissions" element={
            <ProtectedRoute adminOnly>
              <RolePermissions />
            </ProtectedRoute>
          } />
          
          <Route path="settings" element={
            <ProtectedRoute permission="Settings">
              <SettingsPage />
            </ProtectedRoute>
          } />
          
          <Route path="terms" element={
            <ProtectedRoute adminOnly>
              <TermManagementPage />
            </ProtectedRoute>
          } />
          
          <Route path="branding" element={
            <ProtectedRoute permission="School Branding">
              <SchoolBranding />
            </ProtectedRoute>
          } />
          
          <Route path="analytics" element={
            <ProtectedRoute permission="Analytics Dashboard">
              <AnalyticsDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="wallet" element={
            <ProtectedRoute adminOnly>
              <WalletPage />
            </ProtectedRoute>
          } />
          
          <Route path="transactions" element={
            <ProtectedRoute adminOnly>
              <TransactionsPage />
            </ProtectedRoute>
          } />
          
          <Route path="settlements" element={
            <ProtectedRoute adminOnly>
              <SettlementsPage />
            </ProtectedRoute>
          } />
          
          <Route path="monnify" element={
            <ProtectedRoute adminOnly>
              <MonnifyStatusPage />
            </ProtectedRoute>
          } />
          
          <Route path="icedata" element={
            <ProtectedRoute adminOnly>
              <IceDataPage />
            </ProtectedRoute>
          } />
          
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
