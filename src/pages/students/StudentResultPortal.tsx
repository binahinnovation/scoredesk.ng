
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, GraduationCap, BookOpen, Award } from 'lucide-react';

interface Result {
  subject: string;
  subject_code: string;
  assessment: string;
  score: number;
  max_score: number;
  percentage: number;
}

interface Student {
  name: string;
  student_id: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  student?: Student;
  results?: Result[];
}

const StudentResultPortal = () => {
  const [studentId, setStudentId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [showPin, setShowPin] = useState(false);
  const { toast } = useToast();

  const handleViewResults = async () => {
    if (!studentId.trim() || !pin.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both Student ID and Scratch Card PIN",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get current term with fallback to most recent term
      let { data: terms } = await supabase
        .from('terms')
        .select('id, name, is_current')
        .eq('is_current', true)
        .limit(1);

      // If no current term, get the most recent term
      if (!terms || terms.length === 0) {
        const { data: fallbackTerms } = await supabase
          .from('terms')
          .select('id, name, is_current')
          .order('created_at', { ascending: false })
          .limit(1);
        
        terms = fallbackTerms;
      }

      if (!terms || terms.length === 0) {
        toast({
          title: "Error",
          description: "No terms found. Please contact your school administrator.",
          variant: "destructive",
        });
        return;
      }

      const termId = terms[0].id;

      // For now, just verify the scratch card exists and is valid
      const { data: scratchCard, error: cardError } = await supabase
        .from('scratch_cards')
        .select('*')
        .eq('pin', pin)
        .eq('status', 'Active')
        .single();

      if (cardError || !scratchCard) {
        toast({
          title: "Invalid PIN",
          description: "The PIN you entered is invalid or has already been used.",
          variant: "destructive",
        });
        return;
      }

      // Verify student exists
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, first_name, last_name, student_id')
        .eq('student_id', studentId)
        .single();

      if (studentError || !studentData) {
        toast({
          title: "Student Not Found",
          description: "No student found with that ID. Please check and try again.",
          variant: "destructive",
        });
        return;
      }

      // Fetch results with proper joins
      const { data: resultsData, error: resultsError } = await supabase
        .from('results')
        .select(`
          id,
          score,
          max_score,
          subjects:subject_id (name, code),
          assessments:assessment_id (name, max_score)
        `)
        .eq('student_id', studentData.id)
        .eq('term_id', termId)
        .eq('is_approved', true);

      if (resultsError) {
        console.error('Error fetching results:', resultsError);
        toast({
          title: "Error",
          description: "Failed to fetch results. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Transform data to expected format
      const transformedResults: Result[] = (resultsData || []).map(result => ({
        subject: result.subjects?.name || 'Unknown Subject',
        subject_code: result.subjects?.code || '',
        assessment: result.assessments?.name || 'Unknown Assessment',
        score: result.score,
        max_score: result.max_score,
        percentage: Math.round((result.score / result.max_score) * 100)
      }));

      // Set student and results
      setStudent({
        name: `${studentData.first_name} ${studentData.last_name}`,
        student_id: studentData.student_id
      });
      setResults(transformedResults);
      
      toast({
        title: "Success",
        description: `Found ${transformedResults.length} approved results`,
      });
    } catch (error) {
      console.error('Error fetching results:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallGrade = (percentage: number) => {
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-600' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600' };
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Student Result Portal</h1>
          </div>
          <p className="text-gray-600 text-lg">View your academic results using your Student ID and Scratch Card</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Access Your Results
            </CardTitle>
            <CardDescription>
              Enter your Student ID and Scratch Card PIN to view your approved results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="Enter your Student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">Scratch Card PIN</Label>
                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    placeholder="Enter Scratch Card PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleViewResults} 
              disabled={loading} 
              className="w-full"
              size="lg"
            >
              {loading ? "Loading..." : "View My Results"}
            </Button>
          </CardContent>
        </Card>

        {student && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Student Name</Label>
                  <p className="text-lg font-semibold">{student.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Student ID</Label>
                  <p className="text-lg font-semibold">{student.student_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Academic Results</CardTitle>
              <CardDescription>Your approved results for the current term</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Subject</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Assessment</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Score</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Max Score</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Percentage</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => {
                      const gradeInfo = calculateOverallGrade(result.percentage);
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 font-medium">
                            {result.subject}
                            {result.subject_code && (
                              <span className="text-sm text-gray-500 ml-1">({result.subject_code})</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">{result.assessment}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                            {result.score}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {result.max_score}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                            {result.percentage}%
                          </td>
                          <td className={`border border-gray-300 px-4 py-2 text-center font-bold ${gradeInfo.color}`}>
                            {gradeInfo.grade}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {results.length === 0 && student && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Available</h3>
              <p className="text-gray-600">
                No approved results found for the current term. Please contact your teacher or check back later.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentResultPortal;
