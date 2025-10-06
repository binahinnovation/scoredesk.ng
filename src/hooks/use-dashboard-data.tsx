
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolId } from './use-school-id';

interface RecentResult {
  id: string;
  score: number;
  created_at: string;
  is_approved: boolean;
  students: { first_name: string; last_name: string; student_id: string };
  subjects: { name: string };
  assessments: { name: string; max_score: number };
}

interface ClassDistribution {
  name: string;
  students: number;
}

interface SubjectPerformance {
  subject: string;
  average: number;
  totalResults: number;
}

interface MonthlyTrend {
  month: string;
  results: number;
  approved: number;
}

interface TermStat {
  name: string;
  academic_year: string;
  is_current: boolean;
  start_date: string;
  end_date: string;
}

interface DashboardData {
  studentsCount: number;
  teachersCount: number;
  subjectsCount: number;
  resultsCount: number;
  classesCount: number;
  pendingResultsCount: number;
  recentResults: RecentResult[];
  classDistribution: ClassDistribution[];
  subjectPerformance: SubjectPerformance[];
  monthlyTrends: MonthlyTrend[];
  termStats: TermStat[];
}

export function useDashboardData() {
  const { schoolId, loading: schoolIdLoading } = useSchoolId();
  const [data, setData] = useState<DashboardData>({
    studentsCount: 0,
    teachersCount: 0,
    subjectsCount: 0,
    resultsCount: 0,
    classesCount: 0,
    pendingResultsCount: 0,
    recentResults: [],
    classDistribution: [],
    subjectPerformance: [],
    monthlyTrends: [],
    termStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Don't fetch if we don't have a schoolId yet
      if (!schoolId || schoolIdLoading) {
        setLoading(schoolIdLoading);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch basic counts in parallel - ALL FILTERED BY SCHOOL
        const [
          studentsResult,
          teachersResult,
          subjectsResult,
          approvedResultsResult,
          classesResult,
          pendingResultsResult,
          termsResult
        ] = await Promise.all([
          supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
          supabase.from('subjects').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
          supabase.from('results').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_approved', true),
          supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
          supabase.from('results').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_approved', false),
          supabase.from('terms').select('*').eq('school_id', schoolId)
        ]);

        // Fetch recent approved results with student and subject details - FILTERED BY SCHOOL
        const { data: recentResults } = await supabase
          .from('results')
          .select(`
            id,
            score,
            created_at,
            is_approved,
            students:student_id (first_name, last_name, student_id),
            subjects:subject_id (name),
            assessments:assessment_id (name, max_score)
          `)
          .eq('school_id', schoolId)
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(10);

        // Fetch class distribution data - FILTERED BY SCHOOL
        const { data: studentsByClass } = await supabase
          .from('students')
          .select(`
            class_id,
            classes:class_id (name)
          `)
          .eq('school_id', schoolId);

        // Process class distribution
        const classStats = new Map();
        studentsByClass?.forEach(student => {
          if (student.classes?.name) {
            const className = student.classes.name;
            classStats.set(className, (classStats.get(className) || 0) + 1);
          }
        });

        const processedClassDistribution = Array.from(classStats.entries()).map(([name, value]) => ({
          name,
          students: value
        }));

        // Fetch subject performance data - FILTERED BY SCHOOL
        const { data: subjectResults } = await supabase
          .from('results')
          .select(`
            score,
            subjects:subject_id (name),
            assessments:assessment_id (max_score)
          `)
          .eq('school_id', schoolId)
          .eq('is_approved', true)
          .not('score', 'is', null);

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
          subject: name,
          average: Math.round(stats.total / stats.scores.length),
          totalResults: stats.scores.length
        })).sort((a, b) => b.average - a.average);

        // Generate monthly trends based on results data - FILTERED BY SCHOOL
        const { data: monthlyResultsData } = await supabase
          .from('results')
          .select('created_at, is_approved')
          .eq('school_id', schoolId)
          .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

        // Process monthly trends
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = new Map();
        
        monthlyResultsData?.forEach(result => {
          const date = new Date(result.created_at);
          const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
          
          if (!monthlyData.has(monthKey)) {
            monthlyData.set(monthKey, { results: 0, approved: 0 });
          }
          
          const stats = monthlyData.get(monthKey);
          stats.results += 1;
          if (result.is_approved) {
            stats.approved += 1;
          }
        });

        const processedMonthlyTrends = Array.from(monthlyData.entries())
          .slice(-6)
          .map(([month, stats]) => ({
            month,
            results: stats.results,
            approved: stats.approved
          }));

        // Process term statistics
        const processedTermStats = termsResult.data?.map(term => ({
          name: term.name,
          academic_year: term.academic_year,
          is_current: term.is_current,
          start_date: term.start_date,
          end_date: term.end_date
        })) || [];

        setData({
          studentsCount: studentsResult.count || 0,
          teachersCount: teachersResult.count || 0,
          subjectsCount: subjectsResult.count || 0,
          resultsCount: approvedResultsResult.count || 0,
          classesCount: classesResult.count || 0,
          pendingResultsCount: pendingResultsResult.count || 0,
          recentResults: recentResults || [],
          classDistribution: processedClassDistribution,
          subjectPerformance: processedSubjectPerformance,
          monthlyTrends: processedMonthlyTrends,
          termStats: processedTermStats,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [schoolId, schoolIdLoading]);

  return {
    ...data,
    loading,
    error,
  };
}
