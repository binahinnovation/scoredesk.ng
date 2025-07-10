import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Eye, FileDown, Check, X, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import jsPDF from 'jspdf';

interface QuestionPaper {
  id: string;
  title: string;
  subject_id: string;
  class_id: string;
  term_id: string;
  teacher_id: string;
  submission_mode: string;
  content: any;
  file_url: string | null;
  pdf_url: string | null;
  status: string;
  created_at: string;
  submitted_at: string;
  approved_at: string | null;
  approved_by: string | null;
  subjects: { name: string; code: string } | null;
  classes: { name: string } | null;
  terms: { name: string; academic_year: string } | null;
  profiles: { full_name: string | null } | null;
}

export default function QuestionPaperManagement() {
  const { user } = useAuth();
  const { hasPermission } = useUserRole();
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (hasPermission("Result Approval") || hasPermission("Manage Users")) {
      fetchData();
    }
  }, [hasPermission]);

  const fetchData = async () => {
    try {
      const [subjectsRes, classesRes, termsRes, papersRes] = await Promise.all([
        supabase.from("subjects").select("*"),
        supabase.from("classes").select("*"),
        supabase.from("terms").select("*").order("is_current", { ascending: false }),
        supabase.from("question_papers").select(`
          *,
          subjects:subject_id (name, code),
          classes:class_id (name),
          terms:term_id (name, academic_year),
          profiles:teacher_id (full_name)
        `).order('created_at', { ascending: false })
      ]);

      setSubjects(subjectsRes.data || []);
      setClasses(classesRes.data || []);
      setTerms(termsRes.data || []);
      setQuestionPapers((papersRes.data as any) || []);

      // Set current term as default
      const currentTerm = termsRes.data?.find(term => term.is_current);
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

  const handleStatusUpdate = async (paperId: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      const { error } = await supabase
        .from('question_papers')
        .update({
          status: newStatus,
          approved_by: newStatus === 'Approved' ? user?.id : null,
          approved_at: newStatus === 'Approved' ? new Date().toISOString() : null
        })
        .eq('id', paperId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Question paper ${newStatus.toLowerCase()} successfully`,
      });

      await fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const bulkDownloadPDFs = async () => {
    const approvedPapers = filteredPapers.filter(paper => 
      paper.status === 'Approved' && paper.pdf_url
    );

    if (approvedPapers.length === 0) {
      toast({
        title: "No PDFs Available",
        description: "No approved question papers with PDFs found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create a combined PDF
      const combinedPdf = new jsPDF();
      let isFirstPage = true;

      for (const paper of approvedPapers) {
        if (!isFirstPage) {
          combinedPdf.addPage();
        }
        
        // Add cover page for each paper
        combinedPdf.setFontSize(16);
        combinedPdf.text(paper.title, 20, 30);
        combinedPdf.setFontSize(12);
        combinedPdf.text(`Subject: ${paper.subjects?.name}`, 20, 50);
        combinedPdf.text(`Class: ${paper.classes?.name}`, 20, 65);
        combinedPdf.text(`Teacher: ${paper.profiles?.full_name}`, 20, 80);
        combinedPdf.text(`Submitted: ${new Date(paper.submitted_at).toLocaleDateString()}`, 20, 95);
        
        combinedPdf.addPage();
        isFirstPage = false;
      }

      // Download the combined PDF
      combinedPdf.save(`question-papers-${selectedTerm === 'all' ? 'all-terms' : terms.find(t => t.id === selectedTerm)?.name}-${Date.now()}.pdf`);

      toast({
        title: "Success",
        description: `Downloaded ${approvedPapers.length} question papers`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate bulk download",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPapers = questionPapers.filter(paper => {
    if (selectedSubject !== 'all' && paper.subject_id !== selectedSubject) return false;
    if (selectedClass !== 'all' && paper.class_id !== selectedClass) return false;
    if (selectedTerm !== 'all' && paper.term_id !== selectedTerm) return false;
    if (statusFilter !== 'all' && paper.status !== statusFilter) return false;
    return true;
  });

  if (!hasPermission("Result Approval") && !hasPermission("Manage Users")) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-900">Question Paper Management</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
            <Clock className="h-16 w-16 text-orange-500" />
            <h2 className="text-xl font-semibold">Access Restricted</h2>
            <p className="text-center text-muted-foreground">
              Only Exam Officers and Principals can manage question papers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Question Paper Management</h1>
        <Button 
          onClick={bulkDownloadPDFs}
          disabled={loading || filteredPapers.filter(p => p.status === 'Approved' && p.pdf_url).length === 0}
          className="flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Bulk Download ({filteredPapers.filter(p => p.status === 'Approved' && p.pdf_url).length})
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="All Terms" />
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

            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Papers */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPapers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
              <Clock className="h-16 w-16 text-gray-400" />
              <h2 className="text-xl font-semibold">No Question Papers Found</h2>
              <p className="text-center text-muted-foreground">
                No question papers match your current filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPapers.map((paper) => (
            <Card key={paper.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-semibold">{paper.title}</h3>
                      <Badge variant={
                        paper.status === 'Approved' ? 'default' :
                        paper.status === 'Submitted' ? 'secondary' : 
                        paper.status === 'Rejected' ? 'destructive' : 'outline'
                      }>
                        {paper.status}
                      </Badge>
                      <Badge variant="outline">
                        {paper.submission_mode === 'manual' ? 'Manual' : 'Scanned'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <strong>Subject:</strong> {paper.subjects?.name}
                      </div>
                      <div>
                        <strong>Class:</strong> {paper.classes?.name}
                      </div>
                      <div>
                        <strong>Teacher:</strong> {paper.profiles?.full_name}
                      </div>
                      <div>
                        <strong>Submitted:</strong> {new Date(paper.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {paper.approved_at && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Approved:</strong> {new Date(paper.approved_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {paper.pdf_url && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const { data } = await supabase.storage
                                .from('documents')
                                .download(paper.pdf_url!);
                              
                              if (data) {
                                const url = URL.createObjectURL(data);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${paper.title}.pdf`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }
                            } catch (error) {
                              toast({
                                title: "Download Error",
                                description: "Failed to download PDF",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const { data } = await supabase.storage
                                .from('documents')
                                .download(paper.pdf_url!);
                              
                              if (data) {
                                const url = URL.createObjectURL(data);
                                window.open(url, '_blank');
                              }
                            } catch (error) {
                              toast({
                                title: "Preview Error",
                                description: "Failed to preview PDF",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {paper.status === 'Submitted' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleStatusUpdate(paper.id, 'Approved')}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(paper.id, 'Rejected')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}