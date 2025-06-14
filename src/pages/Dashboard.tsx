import React from 'react';
import { GraduationCap, UserPlus, BookOpen, FileText } from 'lucide-react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useUserRole } from '@/hooks/use-user-role';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-${color}-50 rounded-lg shadow-md p-4 flex items-center`}>
      <div className={`bg-${color}-100 text-${color}-500 p-3 rounded-full mr-4`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const {
    studentsCount,
    usersCount,
    subjectsCount,
    resultsCount,
    loading,
    error,
  } = useDashboardData();

  const { hasPermission } = useUserRole();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load data: {error.message}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to your school management dashboard</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Students"
            value={studentsCount || 0}
            icon={<GraduationCap className="h-4 w-4" />}
            color="blue"
          />
          <StatsCard
            title="System Users"
            value={usersCount || 0}
            icon={<UserPlus className="h-4 w-4" />}
            color="green"
          />
          <StatsCard
            title="Subjects"
            value={subjectsCount || 0}
            icon={<BookOpen className="h-4 w-4" />}
            color="purple"
          />
          <StatsCard
            title="Approved Results"
            value={resultsCount || 0}
            icon={<FileText className="h-4 w-4" />}
            color="orange"
          />
        </div>

        {/* Role-Based Sections */}
        {hasPermission('ManageResults') && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Results Management</h2>
            <p className="text-gray-600">Manage student results and performance.</p>
            <Link to="/results">
              <Button>Go to Results</Button>
            </Link>
          </div>
        )}

        {hasPermission('ManageUsers') && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">User Management</h2>
            <p className="text-gray-600">Manage system users and roles.</p>
            <Link to="/users">
              <Button>Go to Users</Button>
            </Link>
          </div>
        )}

        {hasPermission('ManageScratchCards') && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Scratch Cards Management</h2>
            <p className="text-gray-600">Manage scratch cards for result access.</p>
            <Link to="/scratchcards">
              <Button>Go to Scratch Cards</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
