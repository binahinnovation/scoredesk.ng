
import React from 'react';
import { GraduationCap, UserPlus, BookOpen, FileText, BarChart2, Activity, Briefcase } from 'lucide-react'; // Added BarChart2, Activity, Briefcase
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useUserRole } from '@/hooks/use-user-role';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Added Card components

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-${color}-50 rounded-lg shadow-md p-4 flex items-center dark:bg-gray-800 dark:border-gray-700`}>
      <div className={`bg-${color}-100 text-${color}-500 p-3 rounded-full mr-4 dark:bg-${color}-700 dark:text-${color}-200`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
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
    classesCount, // New
    pendingResultsCount, // New
    loading,
    error,
  } = useDashboardData();

  const { hasPermission } = useUserRole();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 dark:text-white">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome to your school management dashboard</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Students"
            value={studentsCount || 0}
            icon={<GraduationCap className="h-6 w-6" />} // Increased icon size
            color="blue"
          />
          <StatsCard
            title="System Users"
            value={usersCount || 0}
            icon={<UserPlus className="h-6 w-6" />} // Increased icon size
            color="green"
          />
          <StatsCard
            title="Total Subjects"
            value={subjectsCount || 0}
            icon={<BookOpen className="h-6 w-6" />} // Increased icon size
            color="purple"
          />
          <StatsCard
            title="Total Classes"
            value={classesCount || 0}
            icon={<Briefcase className="h-6 w-6" />} // Changed icon and increased size
            color="pink"
          />
          <StatsCard
            title="Approved Results"
            value={resultsCount || 0}
            icon={<FileText className="h-6 w-6" />} // Increased icon size
            color="orange"
          />
          <StatsCard
            title="Pending Results"
            value={pendingResultsCount || 0}
            icon={<Activity className="h-6 w-6" />} // Changed icon and increased size
            color="yellow"
          />
        </div>

        {/* Analytics Link Card */}
        <div className="mb-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold dark:text-white">Detailed Analytics</CardTitle>
              <BarChart2 className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-400 mb-4">
                Dive deeper into school performance, trends, and insights. Explore comprehensive charts and data visualizations.
              </CardDescription>
              <Link to="/analytics">
                <Button className="w-full sm:w-auto">View Analytics Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        

        {/* Role-Based Sections */}
        {hasPermission('ManageResults') && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Results Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage student results and performance.</p>
            <Link to="/results/entry"> {/* Assuming /results redirects or this is the main entry */}
              <Button className="mt-2">Go to Results Entry</Button>
            </Link>
             <Link to="/results/approval">
              <Button variant="outline" className="mt-2 ml-2">Go to Results Approval</Button>
            </Link>
          </div>
        )}

        {hasPermission('ManageUsers') && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">User Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage system users and roles.</p>
            <Link to="/users">
              <Button className="mt-2">Go to Users</Button>
            </Link>
          </div>
        )}

        {hasPermission('ManageScratchCards') && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Scratch Cards Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage scratch cards for result access.</p>
            <Link to="/scratchcards">
              <Button className="mt-2">Go to Scratch Cards</Button>
            </Link>
          </div>
        )}
        
        {hasPermission('ManageSettings') && (
           <div className="mb-6 p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">School Settings</h2>
            <p className="text-gray-600 dark:text-gray-400">Configure terms, branding, and other school settings.</p>
            <Link to="/settings">
              <Button className="mt-2">Go to Settings</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
