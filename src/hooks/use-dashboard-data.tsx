
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardData {
  studentsCount: number;
  usersCount: number;
  subjectsCount: number;
  resultsCount: number;
  classesCount: number;
  pendingResultsCount: number;
  recentResults: any[];
  classDistribution: any[];
  subjectPerformance: any[];
  monthlyTrends: any[];
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    studentsCount: 0,
    usersCount: 0,
    subjectsCount: 0,
    resultsCount: 0,
    classesCount: 0,
    pendingResultsCount: 0,
    recentResults: [],
    classDistribution: [],
    subjectPerformance: [],
    monthlyTrends: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch basic counts
        const [
          studentsResult,
          usersResult,
          subjectsResult,
          approvedResultsResult,
          classesResult,
          pendingResultsResult
        ] = await Promise.all([
          supabase.from('students').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('subjects').select('*', { count: 'exact', head: true }),
          supabase.from('results').select('*', { count: 'exact', head: true }).eq('is_approved', true),
          supabase.from('classes').select('*', { count: 'exact', head: true }),
          supabase.from('results').select('*', { count: 'exact', head: true }).eq('is_approved', false)
        ]);

        // Fetch recent results with related data
        const { data: recentResults } = await supabase
          .from('results')
          .select(`
            id,
            score,
            created_at,
            is_approved,
            students:student_id (first_name, last_name),
            subjects:subject_id (name),
            assessments:assessment_id (name, max_score)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch class distribution
        const { data: classDistribution } = await supabase
          .from('students')
          .select(`
            class_id,
            classes:class_id (name)
          `);

        // Process class distribution
        const classStats = new Map();
        classDistribution?.forEach(student => {
          if (student.classes?.name) {
            const className = student.classes.name;
            classStats.set(className, (classStats.get(className) || 0) + 1);
          }
        });

        const processedClassDistribution = Array.from(classStats.entries()).map(([name, value]) => ({
          name,
          value
        }));

        // Fetch subject performance data
        const { data: subjectResults } = await supabase
          .from('results')
          .select(`
            score,
            subjects:subject_id (name),
            assessments:assessment_id (max_score)
          `)
          .eq('is_approved', true);

        // Process subject performance
        const subjectStats = new Map();
        subjectResults?.forEach(result => {
          if (result.subjects?.name && result.assessments?.max_score && result.score !== null) {
            const subjectName = result.subjects.name;
            const percentage = (result.score / result.assessments.max_score) * 100;
            
            if (!subjectStats.has(subjectName)) {
              subjectStats.set(subjectName, { scores: [], total: 0 });
            }
            
            const stats = subjectStats.get(subjectName);
            stats.scores.push(percentage);
            stats.total += percentage;
          }
        });

        const processedSubjectPerformance = Array.from(subjectStats.entries()).map(([name, stats]) => ({
          name,
          average: stats.total / stats.scores.length,
          count: stats.scores.length
        })).sort((a, b) => b.average - a.average);

        // Generate monthly trends (mock data for now)
        const monthlyTrends = [
          { month: 'Jan', results: 45, students: 120 },
          { month: 'Feb', results: 52, students: 125 },
          { month: 'Mar', results: 48, students: 128 },
          { month: 'Apr', results: 61, students: 130 },
          { month: 'May', results: 55, students: 135 },
          { month: 'Jun', results: 67, students: 140 },
        ];

        setData({
          studentsCount: studentsResult.count || 0,
          usersCount: usersResult.count || 0,
          subjectsCount: subjectsResult.count || 0,
          resultsCount: approvedResultsResult.count || 0,
          classesCount: classesResult.count || 0,
          pendingResultsCount: pendingResultsResult.count || 0,
          recentResults: recentResults || [],
          classDistribution: processedClassDistribution,
          subjectPerformance: processedSubjectPerformance,
          monthlyTrends,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    ...data,
    loading,
    error,
  };
}
