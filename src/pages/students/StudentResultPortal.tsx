
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Eye, Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StudentResult {
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
  results?: StudentResult[];
}

export default function StudentResultPortal() {
  const [studentId, setStudentId] = useState("");
  const [scratchCardPin, setScratchCardPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [hasViewed, setHasViewed] = useState(false);

  const viewResults = async () => {
    if (!studentId.trim() || !scratchCardPin.trim()) {
      toast({
        title: "Error",
        description: "Please enter both Student ID and Scratch Card PIN",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get current term
      const { data: currentTerm, error: termError } = await supabase
        .from('terms')
        .select('id')
        .eq('is_current', true)
        .single();

      if (termError) throw termError;

      if (!currentTerm) {
        toast({
          title: "Error",
          description: "No current term found. Please contact administration.",
          variant: "destructive",
        });
        return;
      }

      // Use the database function to validate and get results
      const { data, error } = await supabase.rpc('use_scratch_card_for_results', {
        p_pin: scratchCardPin,
        p_student_id: studentId,
        p_term_id: currentTerm.id
      });

      if (error) throw error;

      // Type cast the response data
      const response = data as ApiResponse;

      if (!response.success) {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
        return;
      }

      setStudent(response.student || null);
      setResults(response.results || []);
      setHasViewed(true);

      toast({
        title: "Success",
        description: response.message,
      });

    } catch (error) {
      console.error('Error viewing results:', error);
      toast({
        title: "Error",
        description: "Failed to retrieve results. Please check your details and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalScore = () => {
    return results.reduce((sum, result) => sum + result.score, 0);
  };

  const calculateTotalMaxScore = () => {
    return results.reduce((sum, result) => sum + result.max_score, 0);
  };

  const calculateOverallPercentage = () => {
    const total = calculateTotalScore();
    const maxTotal = calculateTotalMaxScore();
    return maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
  };

  const exportResults = () => {
    if (!results.length || !student) return;

    const csvContent = [
      `Student: ${student.name} (${student.student_id})`,
      "",
      "Subject,Assessment,Score,Max Score,Percentage",
      ...results.map(result => 
        `${result.subject},${result.assessment},${result.score},${result.max_score},${result.percentage}%`
      ),
      "",
      `Total Score: ${calculateTotalScore()}/${calculateTotalMaxScore()}`,
      `Overall Percentage: ${calculateOverallPercentage()}%`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.student_id}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setStudentId("");
    setScratchCardPin("");
    setResults([]);
    setStudent(null);
    setHasViewed(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Result Portal</h1>
          <p className="text-lg text-gray-600">View your academic results using your Student ID and Scratch Card</p>
        </div>

        {!hasViewed ? (
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Access Your Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  placeholder="Enter your Student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="scratchPin">Scratch Card PIN</Label>
                <Input
                  id="scratchPin"
                  placeholder="Enter 16-digit PIN"
                  value={scratchCardPin}
                  onChange={(e) => setScratchCardPin(e.target.value)}
                  maxLength={16}
                />
              </div>
              
              <Button 
                onClick={viewResults} 
                disabled={loading}
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                {loading ? "Loading..." : "View Results"}
              </Button>

              <div className="text-sm text-muted-foreground text-center mt-4">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Each scratch card can only be used once per student per term
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Student Information</span>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={exportResults}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" onClick={reset}>
                      View Another Result
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <p className="font-semibold">{student?.name}</p>
                  </div>
                  <div>
                    <Label>Student ID</Label>
                    <p className="font-semibold">{student?.student_id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Results Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{calculateTotalScore()}</p>
                    <p className="text-sm text-blue-600">Total Score</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{calculateTotalMaxScore()}</p>
                    <p className="text-sm text-green-600">Maximum Score</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{calculateOverallPercentage()}%</p>
                    <p className="text-sm text-purple-600">Overall Percentage</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Results</CardTitle>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Results Available</h3>
                    <p className="text-muted-foreground">
                      Your results are not yet available or have not been approved. 
                      Please contact your teacher or check back later.
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Assessment</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Max Score</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.map((result, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {result.subject}
                              {result.subject_code && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  ({result.subject_code})
                                </span>
                              )}
                            </TableCell>
                            <TableCell>{result.assessment}</TableCell>
                            <TableCell>{result.score}</TableCell>
                            <TableCell>{result.max_score}</TableCell>
                            <TableCell>{result.percentage}%</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  result.percentage >= 80 ? "default" :
                                  result.percentage >= 70 ? "secondary" :
                                  result.percentage >= 60 ? "outline" : "destructive"
                                }
                                className={
                                  result.percentage >= 80 ? "bg-green-100 text-green-800" :
                                  result.percentage >= 70 ? "bg-blue-100 text-blue-800" :
                                  result.percentage >= 60 ? "bg-yellow-100 text-yellow-800" : ""
                                }
                              >
                                {result.percentage >= 80 ? "A" :
                                 result.percentage >= 70 ? "B" :
                                 result.percentage >= 60 ? "C" :
                                 result.percentage >= 50 ? "D" : "F"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
