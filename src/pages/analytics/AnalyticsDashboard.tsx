
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Users, BookOpen, GraduationCap, TrendingUp, TrendingDown } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface AnalyticsData {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalClasses: number;
  resultsAnalytics: any[];
  classPerformance: any[];
  subjectPerformance: any[];
  termComparison: any[];
}

export default function AnalyticsDashboard() {
  const { userRole, loading, hasPermission } = useUserRole();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalClasses: 0,
    resultsAnalytics: [],
    classPerformance: [],
    subjectPerformance: [],
    termComparison: []
  });
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [terms, setTerms] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  useEffect(() => {
    if (hasPermission("Analytics")) {
      fetchAnalytics();
    }
  }, [hasPermission, selectedTerm]);

  const fetchAnalytics = async () => {
    setLoadingData(true);
    try {
      // Fetch basic counts
      const [studentsResult, teachersResult, subjectsResult, classesResult, termsResult] = await Promise.all([
        supabase.from("students").select("id", { count: "exact" }),
        supabase.from("user_roles").select("id", { count: "exact" }).neq("role", "Principal"),
        supabase.from("subjects").select("id", { count: "exact" }),
        supabase.from("classes").select("id", { count: "exact" }),
        supabase.from("terms").select("*").order("created_at", { ascending: false })
      ]);

      // Fetch results for analytics
      let resultsQuery = supabase
        .from("results")
        .select(`
          score,
          is_approved,
          students:student_id (class_id, classes:class_id (name)),
          subjects:subject_id (name),
          assessments:assessment_id (max_score),
          terms:term_id (name)
        `);

      if (selectedTerm !== "all") {
        resultsQuery = resultsQuery.eq("term_id", selectedTerm);
      }

      const resultsResult = await resultsQuery;

      // Process data for charts
      const classPerformance = processClassPerformance(resultsResult.data || []);
      const subjectPerformance = processSubjectPerformance(resultsResult.data || []);
      const resultsAnalytics = processResultsAnalytics(resultsResult.data || []);

      setAnalytics({
        totalStudents: studentsResult.count || 0,
        totalTeachers: teachersResult.count || 0,
        totalSubjects: subjectsResult.count || 0,
        totalClasses: classesResult.count || 0,
        resultsAnalytics,
        classPerformance,
        subjectPerformance,
        termComparison: []
      });

      setTerms(termsResult.data || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const processClassPerformance = (results: any[]) => {
    const classStats = new Map();
    
    results.forEach(result => {
      if (!result.students?.classes?.name || !result.assessments?.max_score) return;
      
      const className = result.students.classes.name;
      const percentage = (result.score / result.assessments.max_score) * 100;
      
      if (!classStats.has(className)) {
        classStats.set(className, { scores: [], count: 0 });
      }
      
      const stats = classStats.get(className);
      stats.scores.push(percentage);
      stats.count++;
    });

    return Array.from(classStats.entries()).map(([className, stats]) => ({
      name: className,
      average: stats.scores.reduce((sum: number, score: number) => sum + score, 0) / stats.scores.length,
      count: stats.count
    })).sort((a, b) => b.average - a.average);
  };

  const processSubjectPerformance = (results: any[]) => {
    const subjectStats = new Map();
    
    results.forEach(result => {
      if (!result.subjects?.name || !result.assessments?.max_score) return;
      
      const subjectName = result.subjects.name;
      const percentage = (result.score / result.assessments.max_score) * 100;
      
      if (!subjectStats.has(subjectName)) {
        subjectStats.set(subjectName, { scores: [], count: 0 });
      }
      
      const stats = subjectStats.get(subjectName);
      stats.scores.push(percentage);
      stats.count++;
    });

    return Array.from(subjectStats.entries()).map(([subjectName, stats]) => ({
      name: subjectName,
      average: stats.scores.reduce((sum: number, score: number) => sum + score, 0) / stats.scores.length,
      count: stats.count
    })).sort((a, b) => b.average - a.average);
  };

  const processResultsAnalytics = (results: any[]) => {
    const gradeRanges = [
      { name: "A (90-100%)", min: 90, max: 100, count: 0 },
      { name: "B (80-89%)", min: 80, max: 89, count: 0 },
      { name: "C (70-79%)", min: 70, max: 79, count: 0 },
      { name: "D (60-69%)", min: 60, max: 69, count: 0 },
      { name: "E (50-59%)", min: 50, max: 59, count: 0 },
      { name: "F (0-49%)", min: 0, max: 49, count: 0 }
    ];

    results.forEach(result => {
      if (!result.assessments?.max_score) return;
      
      const percentage = (result.score / result.assessments.max_score) * 100;
      
      for (const range of gradeRanges) {
        if (percentage >= range.min && percentage <= range.max) {
          range.count++;
          break;
        }
      }
    });

    return gradeRanges.filter(range => range.count > 0);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!hasPermission("Analytics")) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
            <AlertCircle className="h-16 w-16 text-orange-500" />
            <h2 className="text-xl font-semibold">Access Restricted</h2>
            <p className="text-center text-muted-foreground">
              Only Principals and Exam Officers can view analytics. 
              Please contact your administrator if you need access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <Select value={selectedTerm} onValueChange={setSelectedTerm}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Terms</SelectItem>
            {terms.map((term) => (
              <SelectItem key={term.id} value={term.id}>
                {term.name} ({term.academic_year})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{analytics.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Teachers</p>
                <p className="text-2xl font-bold">{analytics.totalTeachers}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Subjects</p>
                <p className="text-2xl font-bold">{analytics.totalSubjects}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold">{analytics.totalClasses}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Class Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="h-64 flex items-center justify-center">
                <span>Loading...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.classPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Average Score"]} />
                  <Bar dataKey="average" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="h-64 flex items-center justify-center">
                <span>Loading...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Average Score"]} />
                  <Bar dataKey="average" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="h-64 flex items-center justify-center">
                <span>Loading...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.resultsAnalytics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.resultsAnalytics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Highest Performing Class</p>
                  <p className="text-sm text-muted-foreground">
                    {analytics.classPerformance[0]?.name || "No data"}
                  </p>
                </div>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="font-medium">
                    {analytics.classPerformance[0]?.average?.toFixed(1) || "0"}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Best Subject Performance</p>
                  <p className="text-sm text-muted-foreground">
                    {analytics.subjectPerformance[0]?.name || "No data"}
                  </p>
                </div>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="font-medium">
                    {analytics.subjectPerformance[0]?.average?.toFixed(1) || "0"}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Total Results Analyzed</p>
                  <p className="text-sm text-muted-foreground">
                    Across all selected terms
                  </p>
                </div>
                <div className="flex items-center text-blue-600">
                  <span className="font-medium">
                    {analytics.resultsAnalytics.reduce((sum, grade) => sum + grade.count, 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
