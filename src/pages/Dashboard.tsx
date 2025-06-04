
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRound, BookOpen, GraduationCap, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Dashboard() {
  // Fetch real data using our custom hook
  const { data: studentsData, loading: studentsLoading } = useSupabaseQuery(
    async () => {
      const { data, error } = await supabase.from('students').select('id, status');
      return { data, error };
    },
    []
  );

  const { data: userRolesData, loading: userRolesLoading } = useSupabaseQuery(
    async () => {
      const { data, error } = await supabase.from('user_roles').select('id, role');
      return { data, error };
    },
    []
  );

  const { data: resultsData, loading: resultsLoading } = useSupabaseQuery(
    async () => {
      const { data, error } = await supabase.from('results').select('id, is_approved');
      return { data, error };
    },
    []
  );

  const { data: scratchCardsData, loading: scratchCardsLoading } = useSupabaseQuery(
    async () => {
      const { data, error } = await supabase.from('scratch_cards').select('id, status');
      return { data, error };
    },
    []
  );

  const { data: currentTermData, loading: currentTermLoading } = useSupabaseQuery(
    async () => {
      const { data, error } = await supabase
        .from('terms')
        .select('name, academic_year, end_date')
        .eq('is_current', true)
        .single();
      return { data, error };
    },
    []
  );

  // Calculate statistics from real data
  const totalStudents = studentsData?.length || 0;
  const activeStudents = studentsData?.filter(s => s.status === 'Active').length || 0;
  
  const totalTeachers = userRolesData?.filter(u => 
    u.role === 'Subject Teacher' || u.role === 'Form Master' || u.role === 'Exam Officer'
  ).length || 0;
  
  const pendingResults = resultsData?.filter(r => !r.is_approved).length || 0;
  
  const usedScratchCards = scratchCardsData?.filter(s => s.status === 'Used').length || 0;
  const totalScratchCards = scratchCardsData?.length || 0;
  const unusedScratchCards = totalScratchCards - usedScratchCards;

  // Calculate days until term ends
  const daysUntilTermEnd = currentTermData?.end_date 
    ? Math.ceil((new Date(currentTermData.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Prepare scratch card chart data
  const scratchCardChartData = [
    { name: 'Used', value: usedScratchCards },
    { name: 'Unused', value: unusedScratchCards },
  ];

  const loading = studentsLoading || userRolesLoading || resultsLoading || scratchCardsLoading || currentTermLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-900">School Dashboard</h1>
      
      {/* Current Term Display */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex justify-between items-center">
        <div>
          <h3 className="font-medium text-emerald-800">Current Academic Period</h3>
          <h2 className="text-2xl font-bold text-emerald-700">
            {currentTermData ? `${currentTermData.name} ${currentTermData.academic_year}` : 'No current term set'}
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-md border border-emerald-200 shadow-sm">
          <Clock className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-medium">
            {daysUntilTermEnd > 0 ? `Term ends in ${daysUntilTermEnd} days` : 'Term ended'}
          </span>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <UserRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">{activeStudents} active students</p>
            <Progress className="mt-3" value={totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTeachers}</div>
            <p className="text-xs text-muted-foreground">Active staff members</p>
            <Progress className="mt-3" value={Math.min(totalTeachers * 2, 100)} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Results</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingResults}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
            <Progress className="mt-3" value={Math.min(pendingResults * 5, 100)} />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        {/* Recent Activity - This would need more complex queries to get real activity */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">Active Students</p>
                  <p className="text-xs text-muted-foreground">{activeStudents} enrolled</p>
                </div>
                <span className="text-xs text-muted-foreground">Current</span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">Teaching Staff</p>
                  <p className="text-xs text-muted-foreground">{totalTeachers} members</p>
                </div>
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">Pending Approvals</p>
                  <p className="text-xs text-muted-foreground">{pendingResults} results</p>
                </div>
                <span className="text-xs text-muted-foreground">Waiting</span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">Scratch Cards</p>
                  <p className="text-xs text-muted-foreground">{totalScratchCards} total cards</p>
                </div>
                <span className="text-xs text-muted-foreground">Generated</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Scratch Card Usage */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Scratch Card Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart">
              <TabsList className="mb-4">
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart" className="space-y-4">
                <div className="h-[200px]">
                  {totalScratchCards > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={scratchCardChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No scratch cards generated yet
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-emerald-500 mr-2" />
                      <span>Used: {totalScratchCards > 0 ? Math.round((usedScratchCards / totalScratchCards) * 100) : 0}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-gray-300 mr-2" />
                      <span>Unused: {totalScratchCards > 0 ? Math.round((unusedScratchCards / totalScratchCards) * 100) : 0}%</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="table">
                <div className="space-y-2">
                  <div className="grid grid-cols-3 text-sm font-medium">
                    <div>Status</div>
                    <div>Count</div>
                    <div>Percentage</div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 text-sm">
                    <div>Used</div>
                    <div>{usedScratchCards}</div>
                    <div>{totalScratchCards > 0 ? Math.round((usedScratchCards / totalScratchCards) * 100) : 0}%</div>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <div>Unused</div>
                    <div>{unusedScratchCards}</div>
                    <div>{totalScratchCards > 0 ? Math.round((unusedScratchCards / totalScratchCards) * 100) : 0}%</div>
                  </div>
                  <div className="grid grid-cols-3 text-sm font-medium">
                    <div>Total</div>
                    <div>{totalScratchCards}</div>
                    <div>100%</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
