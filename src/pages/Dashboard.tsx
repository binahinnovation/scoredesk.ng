
import React from 'react';
import { GraduationCap, UserPlus, BookOpen, FileText, Users, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useUserRole } from '@/hooks/use-user-role';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  change?: string;
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, change, description }) => {
  return (
    <Card className="hover-scale">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
            {change && (
              <p className="text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                {change}
              </p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={`p-2 rounded-full bg-${color}-100`}>
            <div className={`text-${color}-600`}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

const Dashboard: React.FC = () => {
  const {
    studentsCount,
    usersCount,
    subjectsCount,
    resultsCount,
    classesCount,
    pendingResultsCount,
    recentResults,
    classDistribution,
    subjectPerformance,
    monthlyTrends,
    loading,
    error,
  } = useDashboardData();

  const { hasPermission } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">Welcome to your comprehensive school management dashboard</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Students"
            value={studentsCount}
            icon={<GraduationCap className="h-6 w-6" />}
            color="blue"
            change="+12% from last month"
            description="Active enrollment"
          />
          <StatsCard
            title="System Users"
            value={usersCount}
            icon={<UserPlus className="h-6 w-6" />}
            color="green"
            change="+5% from last month"
            description="Staff members"
          />
          <StatsCard
            title="Subjects Offered"
            value={subjectsCount}
            icon={<BookOpen className="h-6 w-6" />}
            color="purple"
            description="Curriculum subjects"
          />
          <StatsCard
            title="Total Classes"
            value={classesCount}
            icon={<Users className="h-6 w-6" />}
            color="orange"
            description="Academic classes"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <StatsCard
            title="Approved Results"
            value={resultsCount}
            icon={<FileText className="h-6 w-6" />}
            color="green"
            change="+23% this term"
            description="Published results"
          />
          <StatsCard
            title="Pending Results"
            value={pendingResultsCount}
            icon={<Clock className="h-6 w-6" />}
            color="yellow"
            description="Awaiting approval"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Class Distribution */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Student Distribution by Class
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Subject Performance */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Top Performing Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectPerformance.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Average Score"]} />
                  <Bar dataKey="average" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Trends and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Trends */}
          <Card className="lg:col-span-2 card-shadow">
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="results"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Results */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Recent Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentResults.slice(0, 5).map((result, index) => (
                  <div key={result.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">
                        {result.students?.first_name} {result.students?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{result.subjects?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">
                        {result.score}/{result.assessments?.max_score}
                      </p>
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs ${
                        result.is_approved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {result.is_approved ? 'Approved' : 'Pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hasPermission('ManageResults') && (
            <Card className="hover-scale bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-blue-900">Results Management</h3>
                </div>
                <p className="text-blue-700 text-sm mb-4">
                  Manage student results and performance analytics.
                </p>
                <Link to="/results">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Manage Results
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {hasPermission('ManageUsers') && (
            <Card className="hover-scale bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-full">
                    <UserPlus className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-green-900">User Management</h3>
                </div>
                <p className="text-green-700 text-sm mb-4">
                  Manage system users, roles, and permissions.
                </p>
                <Link to="/users">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Manage Users
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="hover-scale bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-purple-900">Advanced Analytics</h3>
              </div>
              <p className="text-purple-700 text-sm mb-4">
                View detailed analytics and performance insights.
              </p>
              <Link to="/analytics">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
