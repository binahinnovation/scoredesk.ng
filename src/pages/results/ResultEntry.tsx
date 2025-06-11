
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FilePen, Save, Upload, Download } from 'lucide-react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  class_id: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Assessment {
  id: string;
  name: string;
  max_score: number;
  weight: number;
}

interface Term {
  id: string;
  name: string;
  is_current: boolean;
}

interface ResultEntry {
  student_id: string;
  score: number;
}

const ResultEntry = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedAssessment, setSelectedAssessment] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [results, setResults] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  // Fetch classes
  const { data: classes, loading: classesLoading } = useSupabaseQuery<any[]>(
    async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');
      return { data, error };
    },
    []
  );

  // Fetch subjects
  const { data: subjects, loading: subjectsLoading } = useSupabaseQuery<Subject[]>(
    async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      return { data, error };
    },
    []
  );

  // Fetch assessments
  const { data: assessments, loading: assessmentsLoading } = useSupabaseQuery<Assessment[]>(
    async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('name');
      return { data, error };
    },
    []
  );

  // Fetch terms
  const { data: terms, loading: termsLoading } = useSupabaseQuery<Term[]>(
    async () => {
      const { data, error } = await supabase
        .from('terms')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    },
    []
  );

  // Fetch students based on selected class
  const { data: students, loading: studentsLoading } = useSupabaseQuery<Student[]>(
    async () => {
      if (!selectedClass) return { data: [], error: null };
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('status', 'Active')
        .order('first_name');
      return { data, error };
    },
    [selectedClass]
  );

  // Set current term as default
  React.useEffect(() => {
    if (terms && terms.length > 0 && !selectedTerm) {
      const currentTerm = terms.find(term => term.is_current);
      if (currentTerm) {
        setSelectedTerm(currentTerm.id);
      }
    }
  }, [terms, selectedTerm]);

  const handleScoreChange = (studentId: string, score: string) => {
    const numericScore = parseFloat(score) || 0;
    setResults(prev => ({
      ...prev,
      [studentId]: numericScore
    }));
  };

  const handleSaveResults = async () => {
    if (!selectedClass || !selectedSubject || !selectedAssessment || !selectedTerm) {
      toast({
        title: "Missing Information",
        description: "Please select class, subject, assessment, and term.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save results.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const resultEntries = Object.entries(results).map(([studentId, score]) => ({
        student_id: studentId,
        subject_id: selectedSubject,
        assessment_id: selectedAssessment,
        term_id: selectedTerm,
        score: score,
        teacher_id: user.id,
        is_approved: false
      }));

      // First, delete existing results for this combination
      await supabase
        .from('results')
        .delete()
        .eq('subject_id', selectedSubject)
        .eq('assessment_id', selectedAssessment)
        .eq('term_id', selectedTerm)
        .in('student_id', Object.keys(results));

      // Then insert new results
      const { error } = await supabase
        .from('results')
        .insert(resultEntries);

      if (error) throw error;

      toast({
        title: "Results Saved",
        description: `Successfully saved results for ${resultEntries.length} students.`,
      });

      setResults({});
    } catch (error: any) {
      console.error('Error saving results:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedAssessmentData = assessments?.find(a => a.id === selectedAssessment);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FilePen className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold">Result Entry</h1>
            <p className="text-gray-600">Enter and upload student assessment results</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Select Term</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger>
                <SelectValue placeholder="Choose term" />
              </SelectTrigger>
              <SelectContent>
                {terms?.map((term) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.name} {term.is_current && <Badge variant="secondary" className="ml-2">Current</Badge>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Select Class</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Choose class" />
              </SelectTrigger>
              <SelectContent>
                {classes?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Select Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Choose subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects?.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Select Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
              <SelectTrigger>
                <SelectValue placeholder="Choose assessment" />
              </SelectTrigger>
              <SelectContent>
                {assessments?.map((assessment) => (
                  <SelectItem key={assessment.id} value={assessment.id}>
                    {assessment.name} (Max: {assessment.max_score})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {selectedClass && selectedSubject && selectedAssessment && selectedTerm && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Scores</CardTitle>
            <CardDescription>
              Enter scores for {selectedAssessmentData?.name} 
              {selectedAssessmentData && ` (Maximum: ${selectedAssessmentData.max_score} points)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
                <span className="ml-2">Loading students...</span>
              </div>
            ) : students && students.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const score = results[student.id] || 0;
                      const percentage = selectedAssessmentData 
                        ? ((score / selectedAssessmentData.max_score) * 100).toFixed(1)
                        : '0';
                      
                      return (
                        <TableRow key={student.id}>
                          <TableCell>{student.student_id}</TableCell>
                          <TableCell>{student.first_name} {student.last_name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max={selectedAssessmentData?.max_score || 100}
                              value={results[student.id] || ''}
                              onChange={(e) => handleScoreChange(student.id, e.target.value)}
                              className="w-20"
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant={parseFloat(percentage) >= 50 ? "default" : "destructive"}>
                              {percentage}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={handleSaveResults} 
                    disabled={saving || Object.keys(results).length === 0}
                    className="min-w-32"
                  >
                    {saving ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Results
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No students found in the selected class.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(!selectedClass || !selectedSubject || !selectedAssessment || !selectedTerm) && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center text-gray-500">
              <FilePen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select Required Fields</h3>
              <p>Please select term, class, subject, and assessment to begin entering results.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultEntry;
