
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { StatsCard } from '@/components/dashboard/StatsCard';
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  TrendingUp,
  Calendar,
  User,
  UserPlus
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  // Get current term data
  const { data: currentTermData, loading: termLoading } = useSupabaseQuery(
    async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('setting_value')
        .eq('setting_key', 'current_term')
        .single();
      return { data, error };
    },
    []
  );

  // Parse current term data safely
  const currentTerm = React.useMemo(() => {
    if (currentTermData && typeof currentTermData.setting_value === 'object' && currentTermData.setting_value !== null) {
      const settingValue = currentTermData.setting_value as any;
      return {
        term_name: settingValue.term_name || 'First Term',
        academic_year: settingValue.academic_year || '2024/2025'
      };
    }
    return {
      term_name: 'First Term',
      academic_year: '2024/2025'
    };
  }, [currentTermData]);

  // Get dashboard statistics
  const { data: studentsCount, loading: studentsLoading } = useSupabaseQuery(
    async () => {
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });
      return { data: count, error };
    },
    []
  );

  const { data: usersCount, loading: usersLoading } = useSupabaseQuery(
    async () => {
      const { count, error } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });
      return { data: count, error };
    },
    []
  );

  const { data: subjectsCount, loading: subjectsLoading } = useSupabaseQuery(
    async () => {
      const { count, error } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true });
      return { data: count, error };
    },
    []
  );

  const { data: resultsCount, loading: resultsLoading } = useSupabaseQuery(
    async () => {
      const { count, error } = await supabase
        .from('results')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true);
      return { data: count, error };
    },
    []
  );

  const loading = termLoading || studentsLoading || usersLoading || subjectsLoading || resultsLoading;

  const quickActions = [
    {
      title: "User Management",
      description: "Manage system users and roles",
      icon: Users,
      href: "/users",
      color: "blue"
    },
    {
      title: "Student Management",
      description: "Add and manage students",
      icon: GraduationCap,
      href: "/students",
      color: "green"
    },
    {
      title: "Classes & Subjects",
      description: "Manage classes and subjects",
      icon: BookOpen,
      href: "/classes",
      color: "purple"
    },
    {
      title: "Result Entry",
      description: "Enter and manage results",
      icon: FileText,
      href: "/results/entry",
      color: "orange"
    },
    {
      title: "Analytics",
      description: "View performance analytics",
      icon: TrendingUp,
      href: "/analytics",
      color: "red"
    },
    {
      title: "Settings",
      description: "Configure system settings",
      icon: Calendar,
      href: "/settings",
      color: "gray"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Current Term: {currentTerm.term_name} {currentTerm.academic_year}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {user?.user_metadata?.full_name || user?.email}
          </span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {userRole}
          </span>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={studentsCount || 0}
          icon={GraduationCap}
          trend={`${studentsCount || 0} registered`}
          color="blue"
        />
        <StatsCard
          title="System Users"
          value={usersCount || 0}
          icon={UserPlus}
          trend={`${usersCount || 0} active users`}
          color="green"
        />
        <StatsCard
          title="Subjects"
          value={subjectsCount || 0}
          icon={BookOpen}
          trend={`${subjectsCount || 0} configured`}
          color="purple"
        />
        <StatsCard
          title="Approved Results"
          value={resultsCount || 0}
          icon={FileText}
          trend={`${resultsCount || 0} entries`}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.href} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Icon className={`h-5 w-5 mr-2 text-${action.color}-600`} />
                    {action.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {action.description}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(action.href)}
                    className="w-full"
                  >
                    Access
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
