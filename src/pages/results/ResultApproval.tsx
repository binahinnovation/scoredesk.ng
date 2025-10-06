
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, X, Search, Filter } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useUserRole } from "@/hooks/use-user-role";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useSchoolId } from "@/hooks/use-school-id";

interface ResultWithDetails {
  id: string;
  score: number;
  is_approved: boolean;
  approved_at: string | null;
  created_at: string;
  teacher_id: string | null;
  students: {
    first_name: string;
    last_name: string;
    student_id: string;
    classes: { name: string } | null;
  } | null;
  subjects: {
    name: string;
    code: string;
  } | null;
  assessments: {
    name: string;
    max_score: number;
  } | null;
  terms: {
    name: string;
    academic_year: string;
  } | null;
}

export default function ResultApproval() {
  const { userRole, loading, hasPermission } = useUserRole();
  const { user } = useAuth();
  const { schoolId, loading: schoolIdLoading } = useSchoolId();
  const [results, setResults] = useState<ResultWithDetails[]>([]);
  const [filteredResults, setFilteredResults] = useState<ResultWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [approving, setApproving] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempts, setFetchAttempts] = useState(0);

  const fetchData = async () => {
    if (!schoolId) {
      console.warn('No school_id available for result approval');
      setLoadingData(false);
      return;
    }

    if (fetchAttempts >= 3) {
      console.log("Max fetch attempts reached, stopping...");
      setError("Maximum fetch attempts reached. Please try refreshing the page.");
      setLoadingData(false);
      return;
    }

    console.log("Starting to fetch results data...");
    setLoadingData(true);
    setError(null);
    setFetchAttempts(prev => prev + 1);
    
    try {
      // Fetch results with basic data first - FILTERED BY SCHOOL
      console.log("Fetching results...");
      const { data: resultsData, error: resultsError } = await supabase
        .from("results")
        .select(`
          id,
          score,
          is_approved,
          approved_at,
          created_at,
          teacher_id,
          teacher_comment,
          comment_status,
          student_id,
          subject_id,
          assessment_id,
          term_id
        `)
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (resultsError) {
        console.error("Error fetching results:", resultsError);
        throw new Error(`Failed to fetch results: ${resultsError.message}`);
      }

      console.log("Results fetched:", resultsData?.length || 0);

      if (!resultsData || resultsData.length === 0) {
        console.log("No results found");
        setResults([]);
        setFilteredResults([]);
        setLoadingData(false);
        return;
      }

      // Fetch related data with error handling - FILTERED BY SCHOOL
      const [studentsRes, subjectsRes, assessmentsRes, termsRes, classesRes] = await Promise.allSettled([
        supabase.from("students").select("id, first_name, last_name, student_id, class_id").eq("school_id", schoolId),
        supabase.from("subjects").select("id, name, code").eq("school_id", schoolId),
        supabase.from("assessments").select("id, name, max_score").eq("school_id", schoolId),
        supabase.from("terms").select("id, name, academic_year").eq("school_id", schoolId),
        supabase.from("classes").select("id, name").eq("school_id", schoolId)
      ]);

      // Handle each result safely
      const studentsData = studentsRes.status === 'fulfilled' ? studentsRes.value.data || [] : [];
      const subjectsData = subjectsRes.status === 'fulfilled' ? subjectsRes.value.data || [] : [];
      const assessmentsData = assessmentsRes.status === 'fulfilled' ? assessmentsRes.value.data || [] : [];
      const termsData = termsRes.status === 'fulfilled' ? termsRes.value.data || [] : [];
      const classesData = classesRes.status === 'fulfilled' ? classesRes.value.data || [] : [];

      // Create lookup maps
      const studentsMap = new Map(studentsData.map(s => [s.id, s]));
      const subjectsMap = new Map(subjectsData.map(s => [s.id, s]));
      const assessmentsMap = new Map(assessmentsData.map(a => [a.id, a]));
      const termsMap = new Map(termsData.map(t => [t.id, t]));
      const classesMap = new Map(classesData.map(c => [c.id, c]));

      // Combine data safely
      const enrichedResults: ResultWithDetails[] = resultsData.map(result => {
        const student = studentsMap.get(result.student_id);
        const studentClass = student ? classesMap.get(student.class_id) : null;
        
        return {
          ...result,
          students: student ? {
            first_name: student.first_name || 'Unknown',
            last_name: student.last_name || 'Student',
            student_id: student.student_id || 'N/A',
            classes: studentClass ? { name: studentClass.name } : null
          } : null,
          subjects: subjectsMap.get(result.subject_id) || null,
          assessments: assessmentsMap.get(result.assessment_id) || null,
          terms: termsMap.get(result.term_id) || null
        };
      });

      console.log("Enriched results:", enrichedResults.length);
      setResults(enrichedResults);
      
      // Set filter data
      setSubjects(subjectsData);
      setClasses(classesData);
      setFetchAttempts(0); // Reset on success
      
    } catch (error: any) {
      console.error("Error fetching results:", error);
      setError(error.message || "Failed to load results");
      toast({
        title: "Error",
        description: "Failed to load results: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (hasPermission("Result Approval") && !loadingData && results.length === 0 && fetchAttempts === 0 && schoolId && !schoolIdLoading) {
      fetchData();
    }
  }, [hasPermission, schoolId, schoolIdLoading]);

  useEffect(() => {
    filterResults();
  }, [results, searchTerm, statusFilter, subjectFilter, classFilter]);

  const filterResults = () => {
    let filtered = [...results];

    // Status filter
    if (statusFilter === "pending") {
      filtered = filtered.filter(result => !result.is_approved);
    } else if (statusFilter === "approved") {
      filtered = filtered.filter(result => result.is_approved);
    }

    // Subject filter
    if (subjectFilter !== "all") {
      filtered = filtered.filter(result => result.subjects?.name === subjectFilter);
    }

    // Class filter
    if (classFilter !== "all") {
      filtered = filtered.filter(result => result.students?.classes?.name === classFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(result => 
        result.students?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.students?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.students?.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.subjects?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredResults(filtered);
  };

  const approveResult = async (resultId: string) => {
    if (!user) return;

    setApproving(prev => [...prev, resultId]);
    try {
      const { error } = await supabase
        .from("results")
        .update({
          is_approved: true,
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq("id", resultId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Result approved successfully",
      });

      // Update local state instead of refetching
      setResults(prev => prev.map(result => 
        result.id === resultId 
          ? { ...result, is_approved: true, approved_at: new Date().toISOString() }
          : result
      ));
    } catch (error: any) {
      console.error("Error approving result:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve result",
        variant: "destructive",
      });
    } finally {
      setApproving(prev => prev.filter(id => id !== resultId));
    }
  };

  const rejectResult = async (resultId: string) => {
    setApproving(prev => [...prev, resultId]);
    try {
      const { error } = await supabase
        .from("results")
        .update({
          is_approved: false,
          approved_by: null,
          approved_at: null
        })
        .eq("id", resultId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Result rejected successfully",
      });

      // Update local state instead of refetching
      setResults(prev => prev.map(result => 
        result.id === resultId 
          ? { ...result, is_approved: false, approved_at: null }
          : result
      ));
    } catch (error: any) {
      console.error("Error rejecting result:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject result",
        variant: "destructive",
      });
    } finally {
      setApproving(prev => prev.filter(id => id !== resultId));
    }
  };

  const handleRefresh = () => {
    setFetchAttempts(0);
    setError(null);
    fetchData();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!hasPermission("Result Approval")) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-900">Result Approval</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
            <AlertCircle className="h-16 w-16 text-orange-500" />
            <h2 className="text-xl font-semibold">Access Restricted</h2>
            <p className="text-center text-muted-foreground">
              Only Principals and Exam Officers can approve results. 
              Please contact your administrator if you need access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-900">Result Approval</h1>
      
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>Error: {error}</span>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Review and Approve Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.name}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={handleRefresh} className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Results Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {results.filter(r => !r.is_approved).length}
                </div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {results.filter(r => r.is_approved).length}
                </div>
                <p className="text-sm text-muted-foreground">Approved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {results.length}
                </div>
                <p className="text-sm text-muted-foreground">Total Results</p>
              </CardContent>
            </Card>
          </div>

          {/* Results Table */}
          {loadingData ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading results...</div>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Teacher Comment</TableHead>
                    <TableHead>Comment Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        {results.length === 0 ? "No results found. Teachers need to enter results first." : "No results found matching your criteria"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {result.students?.first_name} {result.students?.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {result.students?.student_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{result.students?.classes?.name || "N/A"}</TableCell>
                        <TableCell>
                          <div>
                            <div>{result.subjects?.name || "N/A"}</div>
                            <div className="text-sm text-muted-foreground">
                              {result.subjects?.code || ""}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{result.assessments?.name || "N/A"}</TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {result.score}/{result.assessments?.max_score || 100}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {result.assessments?.max_score ? ((result.score / result.assessments.max_score) * 100).toFixed(1) : "N/A"}%
                          </div>
                        </TableCell>
                        <TableCell>
                          {result.terms?.name} ({result.terms?.academic_year})
                        </TableCell>
                        <TableCell>
                          {result.is_approved ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {result.teacher_comment ? (
                              <div className="space-y-1">
                                <p className="text-sm text-gray-700 line-clamp-2">
                                  {result.teacher_comment}
                                </p>
                                <div className="text-xs text-muted-foreground">
                                  {result.teacher_comment.length}/200
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm italic">No comment</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {result.teacher_comment ? (
                            <Badge variant={
                              result.comment_status === 'approved' ? 'default' :
                              result.comment_status === 'rejected' ? 'destructive' : 'secondary'
                            }>
                              {result.comment_status}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {!result.is_approved ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => approveResult(result.id)}
                                disabled={approving.includes(result.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {approving.includes(result.id) ? "..." : "Approve"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectResult(result.id)}
                                disabled={approving.includes(result.id)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectResult(result.id)}
                              disabled={approving.includes(result.id)}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Unapprove
                            </Button>
                          )}
                          
                          {/* Comment approval actions for EO/Principal */}
                          {result.teacher_comment && result.comment_status === 'pending' && (
                            <div className="flex gap-1 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCommentStatus(result.id, 'approved')}
                                disabled={approving.includes(result.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                ✓ Comment
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCommentStatus(result.id, 'rejected')}
                                disabled={approving.includes(result.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                ✗ Comment
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
