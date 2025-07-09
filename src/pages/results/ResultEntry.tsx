
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Save, Plus, Search } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_id: string;
  class_id: string;
  classes: { name: string };
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Assessment {
  id: string;
  name: string;
  weight: number;
  max_score: number;
}

interface Term {
  id: string;
  name: string;
  academic_year: string;
  is_current: boolean;
}

interface Result {
  id?: string;
  student_id: string;
  subject_id: string;
  term_id: string;
  assessment_id: string;
  score: number;
}

export default function ResultEntry() {
  const { userRole, loading, hasPermission } = useUserRole();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedAssessment, setSelectedAssessment] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classes, setClasses] = useState<any[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hasPermission("Result Upload")) {
      fetchData();
    }
  }, [hasPermission]);

  const fetchData = async () => {
    try {
      // Fetch classes
      const { data: classesData } = await supabase.from("classes").select("*");
      setClasses(classesData || []);

      // Fetch subjects
      const { data: subjectsData } = await supabase.from("subjects").select("*");
      
      // Filter subjects based on user role and assigned subjects
      let filteredSubjects = subjectsData || [];
      if (userRole === 'Subject Teacher' && user?.user_metadata?.subjects) {
        const assignedSubjects = user.user_metadata.subjects;
        filteredSubjects = subjectsData?.filter(subject => 
          assignedSubjects.includes(subject.name)
        ) || [];
      }
      
      setSubjects(filteredSubjects);

      // Fetch assessments
      const { data: assessmentsData } = await supabase.from("assessments").select("*");
      setAssessments(assessmentsData || []);

      // Fetch terms
      const { data: termsData } = await supabase.from("terms").select("*").order("is_current", { ascending: false });
      setTerms(termsData || []);
      
      // Set current term as default
      const currentTerm = termsData?.find(term => term.is_current);
      if (currentTerm) {
        setSelectedTerm(currentTerm.id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass) return;
    
    try {
      const { data: studentsData } = await supabase
        .from("students")
        .select(`
          id,
          first_name,
          last_name,
          student_id,
          class_id,
          classes:class_id (name)
        `)
        .eq("class_id", selectedClass)
        .eq("status", "Active");
      
      setStudents(studentsData || []);
      
      // Initialize results array for students
      if (studentsData && selectedSubject && selectedAssessment && selectedTerm) {
        await fetchExistingResults();
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchExistingResults = async () => {
    if (!selectedSubject || !selectedAssessment || !selectedTerm) return;
    
    try {
      const { data: existingResults } = await supabase
        .from("results")
        .select("*")
        .eq("subject_id", selectedSubject)
        .eq("assessment_id", selectedAssessment)
        .eq("term_id", selectedTerm);
      
      setResults(existingResults || []);
    } catch (error) {
      console.error("Error fetching existing results:", error);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedSubject && selectedAssessment && selectedTerm) {
      fetchExistingResults();
    }
  }, [selectedSubject, selectedAssessment, selectedTerm]);

  const updateScore = (studentId: string, score: string) => {
    const scoreValue = parseFloat(score) || 0;
    const maxScore = assessments.find(a => a.id === selectedAssessment)?.max_score || 100;
    
    if (scoreValue > maxScore) {
      toast({
        title: "Invalid Score",
        description: `Score cannot exceed ${maxScore}`,
        variant: "destructive",
      });
      return;
    }

    setResults(prev => {
      const existing = prev.find(r => r.student_id === studentId);
      if (existing) {
        return prev.map(r => 
          r.student_id === studentId 
            ? { ...r, score: scoreValue }
            : r
        );
      } else {
        return [...prev, {
          student_id: studentId,
          subject_id: selectedSubject,
          assessment_id: selectedAssessment,
          term_id: selectedTerm,
          score: scoreValue
        }];
      }
    });
  };

  const saveResults = async () => {
    if (!user || !selectedSubject || !selectedAssessment || !selectedTerm) {
      toast({
        title: "Error",
        description: "Please select subject, assessment, and term",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const resultsToSave = results.map(result => ({
        ...result,
        teacher_id: user.id,
        is_approved: false
      }));

      const { error } = await supabase
        .from("results")
        .upsert(resultsToSave, { 
          onConflict: "student_id,subject_id,term_id,assessment_id",
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Results saved successfully",
      });
      
      await fetchExistingResults();
    } catch (error: any) {
      console.error("Error saving results:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save results",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!hasPermission("Result Upload")) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-900">Result Entry</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
            <AlertCircle className="h-16 w-16 text-orange-500" />
            <h2 className="text-xl font-semibold">Access Restricted</h2>
            <p className="text-center text-muted-foreground">
              Only Subject Teachers can enter results. 
              Please contact your administrator if you need access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredStudents = students.filter(student => 
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-900">Result Entry</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Enter Student Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="term">Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name} ({term.academic_year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assessment">Assessment</Label>
              <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assessment" />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map((assessment) => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {assessment.name} (Max: {assessment.max_score})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search */}
          {selectedClass && (
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          )}

          {/* Results Table */}
          {selectedClass && selectedSubject && selectedAssessment && selectedTerm && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Enter scores for {subjects.find(s => s.id === selectedSubject)?.name} - {assessments.find(a => a.id === selectedAssessment)?.name}
                </p>
                <Button onClick={saveResults} disabled={saving} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Results"}
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Score (Max: {assessments.find(a => a.id === selectedAssessment)?.max_score})</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => {
                      const existingResult = results.find(r => r.student_id === student.id);
                      return (
                        <TableRow key={student.id}>
                          <TableCell>{student.student_id}</TableCell>
                          <TableCell>{student.first_name} {student.last_name}</TableCell>
                          <TableCell>{student.classes?.name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              max={assessments.find(a => a.id === selectedAssessment)?.max_score}
                              value={existingResult?.score || ""}
                              onChange={(e) => updateScore(student.id, e.target.value)}
                              className="w-24"
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell>
                            {existingResult?.score !== undefined ? (
                              <span className="text-green-600 text-sm">Entered</span>
                            ) : (
                              <span className="text-gray-400 text-sm">Pending</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
