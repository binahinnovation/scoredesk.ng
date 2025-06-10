
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Users, BookOpen, GraduationCap, FileText, Calendar } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface DashboardStats {
  totalStudents: number;
  totalUsers: number;
  totalSubjects: number;
  totalResults: number;
}

interface CurrentTermData {
  term_name: string;
  academic_year: string;
}

const Dashboard = () => {
  // Fetch dashboard statistics
  const { data: stats, loading: statsLoading } = useSupabaseQuery<DashboardStats>(
    async () => {
      const [studentsResult, usersResult, subjectsResult, resultsResult] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('subjects').select('id', { count: 'exact' }),
        supabase.from('results').select('id', { count: 'exact' })
      ]);

      return {
        data: {
          totalStudents: studentsResult.count || 0,
          totalUsers: usersResult.count || 0,
          totalSubjects: subjectsResult.count || 0,
          totalResults: resultsResult.count || 0
        },
        error: null
      };
    },
    []
  );

  // Fetch current term information
  const { data: currentTerm, loading: termLoading } = useSupabaseQuery<CurrentTermData>(
    async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('setting_value')
        .eq('setting_key', 'current_term')
        .single();
      
      if (data && data.setting_value) {
        const settingValue = data.setting_value as any;
        if (typeof settingValue === 'object' && settingValue !== null) {
          return { 
            data: {
              term_name: settingValue.term_name || 'First Term',
              academic_year: settingValue.academic_year || '2024/2025'
            },
            error 
          };
        }
      }
      
      return { 
        data: { 
          term_name: 'First Term', 
          academic_year: '2024/2025' 
        },
        error 
      };
    },
    []
  );

  if (statsLoading || termLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  const dashboardStats = stats || {
    totalStudents: 0,
    totalUsers: 0,
    totalSubjects: 0,
    totalResults: 0
  };

  const termData = currentTerm || {
    term_name: 'First Term',
    academic_year: '2024/2025'
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome to your ScoreDesk dashboard</p>
      </div>

      {/* Current Term Display */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Current Academic Term
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {termData.term_name} {termData.academic_year}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Students"
          value={dashboardStats.totalStudents}
          description="Enrolled students"
          icon={<GraduationCap className="h-6 w-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Staff Members"
          value={dashboardStats.totalUsers}
          description="Active users"
          icon={<Users className="h-6 w-6" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Subjects"
          value={dashboardStats.totalSubjects}
          description="Available subjects"
          icon={<BookOpen className="h-6 w-6" />}
          trend={{ value: 3, isPositive: true }}
        />
        <StatsCard
          title="Results Entered"
          value={dashboardStats.totalResults}
          description="This term"
          icon={<FileText className="h-6 w-6" />}
          trend={{ value: 25, isPositive: true }}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates in your school management system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Results uploaded for Mathematics</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New student registered</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Report cards generated</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <p className="text-sm font-medium">Enter Results</p>
              </div>
              <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <p className="text-sm font-medium">Add Student</p>
              </div>
              <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
                <p className="text-sm font-medium">Manage Classes</p>
              </div>
              <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <GraduationCap className="h-8 w-8 text-orange-600 mb-2" />
                <p className="text-sm font-medium">Generate Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
