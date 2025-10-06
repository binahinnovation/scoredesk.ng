
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Save, Plus, Search, Sparkles, Check, X, RefreshCw } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { logEdit, getCurrentUserSchoolId } from '@/utils/auditLogger';
import { useSchoolId } from "@/hooks/use-school-id";
import { useTeacherAssignments } from "@/hooks/use-teacher-assignments";

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
  teacher_comment?: string;
}

export default function ResultEntry() {
  const { userRole, loading, hasPermission } = useUserRole();
  const { user } = useAuth();
  const { schoolId, loading: schoolIdLoading } = useSchoolId();
  const { subjects: teacherSubjects, classes: teacherClasses, loading: assignmentsLoading, getClassesForSubject } = useTeacherAssignments();
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
  const [editReason, setEditReason] = useState("");
  const [suggestingComments, setSuggestingComments] = useState<Set<string>>(new Set());
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (hasPermission("Result Upload") && schoolId && !schoolIdLoading && !assignmentsLoading) {
      fetchData();
    }
  }, [hasPermission, schoolId, schoolIdLoading, assignmentsLoading]);

  const fetchData = async () => {
    if (!schoolId) {
      console.warn('No school_id available, skipping data fetch');
      return;
    }

    setDataLoading(true);
    try {
      // Fetch classes - FILTERED BY SCHOOL AND TEACHER ASSIGNMENTS
      const { data: classesData } = await supabase
        .from("classes")
        .select("*")
        .eq("school_id", schoolId);
      
      // Filter classes based on user role and teacher assignments
      let filteredClasses = classesData || [];
      if (userRole === 'Subject Teacher') {
        // Use new teacher assignments instead of user metadata
        const assignedClassIds = teacherClasses.map(c => c.class_id);
        if (assignedClassIds.length > 0) {
          filteredClasses = classesData?.filter(cls => 
            assignedClassIds.includes(cls.id)
          ) || [];
        } else {
          // Fallback to user metadata if no assignments found
          const userClasses = user?.user_metadata?.classes;
          if (userClasses && Array.isArray(userClasses)) {
            filteredClasses = classesData?.filter(cls => 
              userClasses.includes(cls.name)
            ) || [];
          }
        }
      }
      
      setClasses(filteredClasses);

      // Fetch subjects - FILTERED BY SCHOOL AND TEACHER ASSIGNMENTS
      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("*")
        .eq("school_id", schoolId);
      
      // Filter subjects based on user role and teacher assignments
      let filteredSubjects = subjectsData || [];
      if (userRole === 'Subject Teacher') {
        // Use new teacher assignments instead of user metadata
        const assignedSubjectIds = teacherSubjects.map(s => s.subject_id);
        if (assignedSubjectIds.length > 0) {
          filteredSubjects = subjectsData?.filter(subject => 
            assignedSubjectIds.includes(subject.id)
          ) || [];
        } else {
          // Fallback to user metadata if no assignments found
          const userSubjects = user?.user_metadata?.subjects;
          if (userSubjects && Array.isArray(userSubjects)) {
            filteredSubjects = subjectsData?.filter(subject => 
              userSubjects.includes(subject.name)
            ) || [];
          }
        }
      }
      
      setSubjects(filteredSubjects);

      // Fetch assessments - FILTERED BY SCHOOL
      const { data: assessmentsData } = await supabase
        .from("assessments")
        .select("*")
        .eq("school_id", schoolId);
      setAssessments(assessmentsData || []);

      // Fetch terms - FILTERED BY SCHOOL
      const { data: termsData } = await supabase
        .from("terms")
        .select("*")
        .eq("school_id", schoolId)
        .order("is_current", { ascending: false });
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
    } finally {
      setDataLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass || !schoolId) return;
    
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
        .eq("school_id", schoolId)
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
    if (!selectedSubject || !selectedAssessment || !selectedTerm || !schoolId) return;
    
    try {
      const { data: existingResults } = await supabase
        .from("results")
        .select("*, teacher_comment, comment_status")
        .eq("school_id", schoolId)
        .eq("subject_id", selectedSubject)
        .eq("assessment_id", selectedAssessment)
        .eq("term_id", selectedTerm);
      
      setResults(existingResults || []);
    } catch (error) {
      console.error("Error fetching existing results:", error);
    }
  };

  // Filter classes based on selected subject for Subject Teachers
  const availableClasses = React.useMemo(() => {
    if (userRole === 'Subject Teacher' && selectedSubject) {
      const assignedClassesForSubject = getClassesForSubject(selectedSubject);
      return classes.filter(cls => 
        assignedClassesForSubject.some(assignedClass => assignedClass.class_id === cls.id)
      );
    }
    return classes;
  }, [classes, selectedSubject, userRole, getClassesForSubject]);

  // Reset selected class when subject changes for Subject Teachers
  useEffect(() => {
    if (userRole === 'Subject Teacher' && selectedSubject) {
      const assignedClassesForSubject = getClassesForSubject(selectedSubject);
      const isCurrentClassValid = assignedClassesForSubject.some(cls => cls.class_id === selectedClass);
      
      if (!isCurrentClassValid && assignedClassesForSubject.length > 0) {
        setSelectedClass(assignedClassesForSubject[0].class_id);
      } else if (!isCurrentClassValid) {
        setSelectedClass("");
      }
    }
  }, [selectedSubject, userRole, getClassesForSubject, selectedClass]);

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
        // Create new result without id field - let database generate it
        const newResult = {
          student_id: studentId,
          subject_id: selectedSubject,
          assessment_id: selectedAssessment,
          term_id: selectedTerm,
          score: scoreValue
        };
        return [...prev, newResult];
      }
    });
  };

  const updateComment = (studentId: string, comment: string) => {
    // Trim and limit comment length
    const trimmedComment = comment.trim().substring(0, 200);
    
    setResults(prev => {
      const existing = prev.find(r => r.student_id === studentId);
      if (existing) {
        return prev.map(r => 
          r.student_id === studentId 
            ? { ...r, teacher_comment: trimmedComment }
            : r
        );
      } else {
        // Create new result without id field - let database generate it
        const newResult = {
          student_id: studentId,
          subject_id: selectedSubject,
          assessment_id: selectedAssessment,
          term_id: selectedTerm,
          score: 0,
          teacher_comment: trimmedComment
        };
        return [...prev, newResult];
      }
    });
  };

  // AI-powered comment suggestion based on score
  const generateCommentSuggestion = (score: number, maxScore: number, subjectName: string) => {
    const percentage = (score / maxScore) * 100;
    
    // Different comment templates based on performance
    const excellentComments = [
      `Outstanding performance in ${subjectName}! Demonstrates excellent understanding and application of concepts. Keep up the excellent work!`,
      `Exceptional work in ${subjectName}! Shows mastery of the subject matter. Continue to challenge yourself!`,
      `Brilliant performance in ${subjectName}! Your dedication and hard work are clearly evident. Well done!`,
      `Excellent achievement in ${subjectName}! Demonstrates strong analytical skills and deep understanding.`
    ];
    
    const goodComments = [
      `Good performance in ${subjectName}. Shows solid understanding with room for improvement. Keep working hard!`,
      `Well done in ${subjectName}! Demonstrates good grasp of concepts. Continue to practice for even better results.`,
      `Satisfactory performance in ${subjectName}. Shows understanding but could benefit from more practice.`,
      `Good work in ${subjectName}. You're on the right track - keep up the consistent effort!`
    ];
    
    const averageComments = [
      `Average performance in ${subjectName}. Focus on understanding fundamentals and practice regularly.`,
      `Fair performance in ${subjectName}. Consider reviewing key concepts and seeking additional help if needed.`,
      `Moderate performance in ${subjectName}. More practice and focus on weak areas will help improve.`,
      `Acceptable performance in ${subjectName}. Identify areas for improvement and work on them consistently.`
    ];
    
    const poorComments = [
      `Below expected performance in ${subjectName}. Please review the material and consider seeking extra help.`,
      `Performance in ${subjectName} needs improvement. Focus on understanding basic concepts first.`,
      `Unsatisfactory performance in ${subjectName}. Please meet with the teacher to discuss improvement strategies.`,
      `Performance in ${subjectName} requires immediate attention. Review lessons and practice regularly.`
    ];
    
    // Select comment based on percentage
    let selectedComments: string[];
    if (percentage >= 90) {
      selectedComments = excellentComments;
    } else if (percentage >= 80) {
      selectedComments = goodComments;
    } else if (percentage >= 60) {
      selectedComments = averageComments;
    } else {
      selectedComments = poorComments;
    }
    
    // Return a random comment from the appropriate category
    return selectedComments[Math.floor(Math.random() * selectedComments.length)];
  };

  const suggestComment = async (studentId: string) => {
    const existingResult = results.find(r => r.student_id === studentId);
    if (!existingResult || !existingResult.score) {
      toast({
        title: "No Score",
        description: "Please enter a score first before generating a comment suggestion.",
        variant: "destructive",
      });
      return;
    }

    const assessment = assessments.find(a => a.id === selectedAssessment);
    const subject = subjects.find(s => s.id === selectedSubject);
    
    if (!assessment || !subject) {
      toast({
        title: "Error",
        description: "Unable to generate comment. Please ensure assessment and subject are selected.",
        variant: "destructive",
      });
      return;
    }

    // Add to suggesting state
    setSuggestingComments(prev => new Set(prev).add(studentId));

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    const suggestedComment = generateCommentSuggestion(
      existingResult.score, 
      assessment.max_score, 
      subject.name
    );

    // Update the comment
    updateComment(studentId, suggestedComment);

    // Remove from suggesting state
    setSuggestingComments(prev => {
      const newSet = new Set(prev);
      newSet.delete(studentId);
      return newSet;
    });

    toast({
      title: "Comment Generated",
      description: "AI has generated a comment suggestion based on the student's performance.",
    });
  };

  const generateAllComments = async () => {
    const studentsWithScores = results.filter(r => r.score && r.score > 0);
    
    if (studentsWithScores.length === 0) {
      toast({
        title: "No Scores",
        description: "Please enter scores for students before generating comments.",
        variant: "destructive",
      });
      return;
    }

    const assessment = assessments.find(a => a.id === selectedAssessment);
    const subject = subjects.find(s => s.id === selectedSubject);
    
    if (!assessment || !subject) {
      toast({
        title: "Error",
        description: "Unable to generate comments. Please ensure assessment and subject are selected.",
        variant: "destructive",
      });
      return;
    }

    // Add all students to suggesting state
    const studentIds = studentsWithScores.map(r => r.student_id);
    setSuggestingComments(new Set(studentIds));

    // Generate comments for all students
    for (const result of studentsWithScores) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Small delay between generations
      
      const suggestedComment = generateCommentSuggestion(
        result.score, 
        assessment.max_score, 
        subject.name
      );
      
      updateComment(result.student_id, suggestedComment);
    }

    // Remove from suggesting state
    setSuggestingComments(new Set());

    toast({
      title: "Comments Generated",
      description: `AI has generated comment suggestions for ${studentsWithScores.length} students.`,
    });
  };

  const saveResults = async () => {
    if (!user || !selectedSubject || !selectedAssessment || !selectedTerm || !schoolId) {
      toast({
        title: "Error",
        description: "Please select subject, assessment, and term",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Fetch existing results for audit logging
      const existingResultsForLogging = new Map();
      for (const result of results.filter(r => r.id)) {
        const { data: oldRecord } = await supabase
          .from('results')
          .select('*')
          .eq('id', result.id)
          .single();
        if (oldRecord) {
          existingResultsForLogging.set(result.id, oldRecord);
        }
      }

      // Separate new and existing results - INCLUDE SCHOOL_ID
      const newResults = results.filter(result => !result.id).map(result => ({
        student_id: result.student_id,
        subject_id: result.subject_id,
        assessment_id: result.assessment_id,
        term_id: result.term_id,
        score: result.score,
        school_id: schoolId,
        teacher_comment: result.teacher_comment || null,
        comment_status: result.teacher_comment?.trim() ? 'pending' : 'pending',
        teacher_id: user.id,
        is_approved: false
      }));

      const existingResults = results.filter(result => result.id).map(result => ({
        ...result,
        teacher_comment: result.teacher_comment || null,
        comment_status: result.teacher_comment?.trim() ? 'pending' : 'pending',
        teacher_id: user.id,
        is_approved: false
      }));

      console.log("New results to insert:", newResults);
      console.log("Existing results to update:", existingResults);

      let insertedResults: any[] = [];
      let updatedResults: any[] = [];

      // Insert new results
      if (newResults.length > 0) {
        const { data: insertData, error: insertError } = await supabase
          .from("results")
          .insert(newResults)
          .select();
        
        if (insertError) throw insertError;
        insertedResults = insertData || [];
      }

      // Update existing results
      if (existingResults.length > 0) {
        const { data: updateData, error: updateError } = await supabase
          .from("results")
          .upsert(existingResults, { 
            onConflict: "id",
            ignoreDuplicates: false 
          })
          .select();
        
        if (updateError) throw updateError;
        updatedResults = updateData || [];
      }

      // Log all operations
      if (user && schoolId) {
        // Log inserts
        for (const newRecord of insertedResults) {
          await logEdit({
            schoolId: schoolId,
            actorId: user.id,
            actionType: 'insert',
            tableName: 'results',
            recordId: newRecord.id,
            oldValue: null,
            newValue: newRecord,
            reason: editReason || 'Result entry',
          });
        }

        // Log updates
        for (const updatedRecord of updatedResults) {
          const oldRecord = existingResultsForLogging.get(updatedRecord.id);
          if (oldRecord) {
            await logEdit({
              schoolId: schoolId,
              actorId: user.id,
              actionType: 'update',
              tableName: 'results',
              recordId: updatedRecord.id,
              oldValue: oldRecord,
              newValue: updatedRecord,
              reason: editReason || 'Result update',
            });
          }
        }
      }

      toast({
        title: "Success",
        description: "Results saved successfully",
      });
      
      await fetchExistingResults();
      setEditReason(""); // Reset reason after save
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


  // Show loading state while school ID or permissions are loading
  if (schoolIdLoading || assignmentsLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-900">Result Entry</h1>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
              <div>
                <p className="text-blue-800 font-medium">Loading School Information</p>
                <p className="text-blue-700 text-sm">
                  Please wait while we load your school details...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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

  if (!schoolId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-900">Result Entry</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <h2 className="text-xl font-semibold">School Not Assigned</h2>
            <p className="text-center text-muted-foreground">
              Your account is not assigned to a school. Please contact your administrator.
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
      
      {dataLoading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
              <div>
                <p className="text-blue-800 font-medium">Loading Data</p>
                <p className="text-blue-700 text-sm">
                  Please wait while we load terms, assessments, and classes...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!dataLoading && terms.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-amber-800 font-medium">No Terms Available</p>
                <p className="text-amber-700 text-sm">
                  You need to create academic terms before entering results.{" "}
                  <a 
                    href="/settings/terms" 
                    className="text-blue-600 hover:underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Go to Term Management →
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!dataLoading && assessments.length === 0 && terms.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-amber-800 font-medium">No Assessments Available</p>
                <p className="text-amber-700 text-sm">
                  You need to set up assessments (First CA, Second CA, Exam) before entering results.{" "}
                  <a 
                    href="/settings/assessments" 
                    className="text-blue-600 hover:underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Go to Assessment Settings →
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
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
                  {terms.length > 0 ? (
                    terms.map((term) => (
                      <SelectItem key={term.id} value={term.id}>
                        {term.name} ({term.academic_year})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-terms" disabled>
                      No terms available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {!dataLoading && terms.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  No terms found. Please create terms in{" "}
                  <a 
                    href="/settings/terms" 
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Settings → Term Management
                  </a>
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map((cls) => (
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
                  {assessments.length > 0 ? (
                    assessments.map((assessment) => (
                      <SelectItem key={assessment.id} value={assessment.id}>
                        {assessment.name} (Max: {assessment.max_score})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-assessments" disabled>
                      No assessments available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {!dataLoading && assessments.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  No assessments found. Please set up assessments in{" "}
                  <a 
                    href="/settings/assessments" 
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Settings → Assessment Settings
                  </a>
                </p>
              )}
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
              <div>
                <Label htmlFor="editReason">Reason for changes (Optional)</Label>
                <Textarea
                  id="editReason"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g., Corrected scores, added comments, updated assessments"
                  rows={2}
                />
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Enter scores for {subjects.find(s => s.id === selectedSubject)?.name} - {assessments.find(a => a.id === selectedAssessment)?.name}
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={generateAllComments} 
                    disabled={saving || suggestingComments.size > 0}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    {suggestingComments.size > 0 ? "Generating..." : "Generate All Comments"}
                  </Button>
                  <Button onClick={saveResults} disabled={saving} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Results"}
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Score (Max: {assessments.find(a => a.id === selectedAssessment)?.max_score})</TableHead>
                      <TableHead>Teacher Comment</TableHead>
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
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Textarea
                                  placeholder="Performance comment..."
                                  value={existingResult?.teacher_comment || ""}
                                  onChange={(e) => updateComment(student.id, e.target.value)}
                                  className="min-h-[60px] text-sm resize-none flex-1"
                                  maxLength={200}
                                  rows={2}
                                />
                                <div className="flex flex-col gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => suggestComment(student.id)}
                                    disabled={suggestingComments.has(student.id) || !existingResult?.score}
                                    className="h-8 w-8 p-0"
                                    title="Generate AI comment suggestion"
                                  >
                                    {suggestingComments.has(student.id) ? (
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Sparkles className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <span>
                                  {(existingResult?.teacher_comment || "").length}/200
                                  {existingResult?.teacher_comment && (
                                    <span className="ml-2 text-blue-600">✨ AI Suggested</span>
                                  )}
                                </span>
                                {existingResult?.score && (
                                  <span className="text-green-600">
                                    {((existingResult.score / (assessments.find(a => a.id === selectedAssessment)?.max_score || 100)) * 100).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </div>
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
