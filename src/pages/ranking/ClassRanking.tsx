
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Trophy, Medal, Award, RefreshCw, Download } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface StudentRanking {
  id: string;
  position: number;
  total_score: number;
  average_score: number;
  grade: string;
  students: {
    first_name: string;
    last_name: string;
    student_id: string;
  };
  classes: {
    name: string;
  };
  terms: {
    name: string;
    academic_year: string;
  };
}

interface Class {
  id: string;
  name: string;
}

interface Term {
  id: string;
  name: string;
  academic_year: string;
  is_current: boolean;
}

export default function ClassRanking() {
  const { userRole, loading, hasPermission } = useUserRole();
  const [rankings, setRankings] = useState<StudentRanking[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [loadingData, setLoadingData] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (hasPermission("Position & Ranking")) {
      fetchInitialData();
    }
  }, [hasPermission]);

  useEffect(() => {
    if (selectedClass && selectedTerm) {
      fetchRankings();
    }
  }, [selectedClass, selectedTerm]);

  const fetchInitialData = async () => {
    try {
      // Fetch classes
      const { data: classesData } = await supabase.from("classes").select("*");
      setClasses(classesData || []);

      // Fetch terms
      const { data: termsData } = await supabase
        .from("terms")
        .select("*")
        .order("is_current", { ascending: false });
      setTerms(termsData || []);

      // Set current term as default
      const currentTerm = termsData?.find(term => term.is_current);
      if (currentTerm) {
        setSelectedTerm(currentTerm.id);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast({
        title: "Error",
        description: "Failed to load classes and terms",
        variant: "destructive",
      });
    }
  };

  const fetchRankings = async () => {
    if (!selectedClass || !selectedTerm) return;

    setLoadingData(true);
    try {
      const { data: rankingsData, error } = await supabase
        .from("student_rankings")
        .select(`
          *,
          students:student_id (
            first_name,
            last_name,
            student_id
          ),
          classes:class_id (name),
          terms:term_id (name, academic_year)
        `)
        .eq("class_id", selectedClass)
        .eq("term_id", selectedTerm)
        .order("position", { ascending: true });

      if (error) throw error;
      setRankings(rankingsData || []);
    } catch (error: any) {
      console.error("Error fetching rankings:", error);
      toast({
        title: "Error",
        description: "Failed to load rankings",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const generateRankings = async () => {
    if (!selectedClass || !selectedTerm) {
      toast({
        title: "Error",
        description: "Please select both class and term",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      // Get all approved results for the selected class and term
      const { data: results, error: resultsError } = await supabase
        .from("results")
        .select(`
          *,
          students:student_id (id, class_id),
          assessments:assessment_id (weight, max_score)
        `)
        .eq("term_id", selectedTerm)
        .eq("is_approved", true);

      if (resultsError) throw resultsError;

      // Filter results for students in the selected class
      const classResults = results?.filter(result => 
        result.students.class_id === selectedClass
      ) || [];

      // Group results by student
      const studentScores: { [key: string]: { total: number; count: number; studentId: string } } = {};

      classResults.forEach(result => {
        if (!studentScores[result.student_id]) {
          studentScores[result.student_id] = { 
            total: 0, 
            count: 0, 
            studentId: result.student_id 
          };
        }
        
        // Calculate weighted score
        const percentage = (result.score / result.assessments.max_score) * 100;
        const weightedScore = (percentage * result.assessments.weight) / 100;
        
        studentScores[result.student_id].total += weightedScore;
        studentScores[result.student_id].count += result.assessments.weight;
      });

      // Calculate averages and create rankings
      const rankingData = Object.values(studentScores)
        .map(student => ({
          student_id: student.studentId,
          total_score: student.total,
          average_score: student.count > 0 ? student.total / student.count * 100 : 0,
        }))
        .sort((a, b) => b.average_score - a.average_score)
        .map((student, index) => ({
          student_id: student.student_id,
          class_id: selectedClass,
          term_id: selectedTerm,
          total_score: student.total_score,
          average_score: student.average_score,
          position: index + 1,
          grade: getGrade(student.average_score),
        }));

      // Save rankings to database
      const { error: deleteError } = await supabase
        .from("student_rankings")
        .delete()
        .eq("class_id", selectedClass)
        .eq("term_id", selectedTerm);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from("student_rankings")
        .insert(rankingData);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Rankings generated successfully",
      });

      await fetchRankings();
    } catch (error: any) {
      console.error("Error generating rankings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate rankings",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getGrade = (average: number): string => {
    if (average >= 90) return "A+";
    if (average >= 80) return "A";
    if (average >= 70) return "B";
    if (average >= 60) return "C";
    if (average >= 50) return "D";
    if (average >= 40) return "E";
    return "F";
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium">{position}</span>;
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-green-100 text-green-800";
      case "B":
        return "bg-blue-100 text-blue-800";
      case "C":
        return "bg-yellow-100 text-yellow-800";
      case "D":
        return "bg-orange-100 text-orange-800";
      case "E":
      case "F":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!hasPermission("Position & Ranking")) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-900">Class Ranking</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
            <AlertCircle className="h-16 w-16 text-orange-500" />
            <h2 className="text-xl font-semibold">Access Restricted</h2>
            <p className="text-center text-muted-foreground">
              Only Principals and Exam Officers can view class rankings. 
              Please contact your administrator if you need access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-900">Class Ranking</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Student Rankings by Class</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Term</label>
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
              <label className="text-sm font-medium mb-2 block">Class</label>
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

            <div className="flex items-end gap-2">
              <Button 
                onClick={generateRankings} 
                disabled={generating || !selectedClass || !selectedTerm}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                {generating ? "Generating..." : "Generate Rankings"}
              </Button>
            </div>
          </div>

          {/* Rankings Table */}
          {selectedClass && selectedTerm && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    {classes.find(c => c.id === selectedClass)?.name} Rankings
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {terms.find(t => t.id === selectedTerm)?.name} ({terms.find(t => t.id === selectedTerm)?.academic_year})
                  </p>
                </div>
                {rankings.length > 0 && (
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                )}
              </div>

              {loadingData ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Loading rankings...</div>
                </div>
              ) : rankings.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
                    <Trophy className="h-16 w-16 text-gray-300" />
                    <h3 className="text-lg font-semibold">No Rankings Available</h3>
                    <p className="text-center text-muted-foreground">
                      Click "Generate Rankings" to calculate student positions based on approved results.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Position</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Total Score</TableHead>
                        <TableHead>Average (%)</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rankings.map((ranking) => (
                        <TableRow key={ranking.id} className={ranking.position <= 3 ? "bg-yellow-50" : ""}>
                          <TableCell className="text-center">
                            {getPositionIcon(ranking.position)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {ranking.students.first_name} {ranking.students.last_name}
                          </TableCell>
                          <TableCell>{ranking.students.student_id}</TableCell>
                          <TableCell>{ranking.total_score.toFixed(2)}</TableCell>
                          <TableCell>{ranking.average_score.toFixed(2)}%</TableCell>
                          <TableCell>
                            <Badge className={getGradeColor(ranking.grade)}>
                              {ranking.grade}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
