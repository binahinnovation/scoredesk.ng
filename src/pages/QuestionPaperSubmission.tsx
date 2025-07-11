import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, Scan, Download, Eye, Plus, Trash2, FileDown, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Printer } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Editor } from '@tinymce/tinymce-react';
import { useReactToPrint } from 'react-to-print';
import { RichQuestionEditor } from '@/components/RichQuestionEditor';
import jsPDF from 'jspdf';

interface QuestionPaper {
  id: string;
  title: string;
  subject_id: string;
  class_id: string;
  term_id: string;
  submission_mode: string;
  content: any;
  file_url: string | null;
  pdf_url: string | null;
  status: string;
  created_at: string;
  subjects: { name: string; code: string } | null;
  classes: { name: string } | null;
  terms: { name: string; academic_year: string } | null;
}

interface Question {
  [key: string]: any;
  id: string;
  question_text: string;
  marks: number;
  question_type: 'objective' | 'theory' | 'practical' | 'multiple_choice';
  options?: string[];
  correct_answer?: string;
}

export default function QuestionPaperSubmission() {
  const { user } = useAuth();
  const { hasPermission } = useUserRole();
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submissionMode, setSubmissionMode] = useState<'scan' | 'manual'>('manual');

  // Form state
  const [title, setTitle] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewPdf, setPreviewPdf] = useState<string | null>(null);

  useEffect(() => {
    if (hasPermission("Result Upload")) {
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
          terms:term_id (name, academic_year)
        `).eq("teacher_id", user?.id)
      ]);

      setSubjects(subjectsRes.data || []);
      setClasses(classesRes.data || []);
      setTerms(termsRes.data || []);
      setQuestionPapers(papersRes.data || []);

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

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question_text: '',
      marks: 1,
      question_type: 'theory'
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const generatePDF = async (questions: Question[], paperTitle: string): Promise<Blob> => {
    const pdf = new jsPDF();
    let yPos = 20;
    
    // Header
    pdf.setFontSize(16);
    pdf.text(paperTitle, 20, yPos);
    yPos += 20;
    
    pdf.setFontSize(12);
    pdf.text(`Subject: ${subjects.find(s => s.id === selectedSubject)?.name || 'Unknown'}`, 20, yPos);
    yPos += 10;
    pdf.text(`Class: ${classes.find(c => c.id === selectedClass)?.name || 'Unknown'}`, 20, yPos);
    yPos += 10;
    pdf.text(`Term: ${terms.find(t => t.id === selectedTerm)?.name || 'Unknown'}`, 20, yPos);
    yPos += 20;
    
    // Instructions
    pdf.text('Instructions:', 20, yPos);
    yPos += 10;
    pdf.text('• Answer all questions', 25, yPos);
    yPos += 8;
    pdf.text('• Write clearly and legibly', 25, yPos);
    yPos += 8;
    pdf.text('• Show all workings where applicable', 25, yPos);
    yPos += 20;
    
    // Questions
    questions.forEach((question, index) => {
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(11);
      pdf.text(`${index + 1}.`, 20, yPos);
      
      // Split question text into lines
      const lines = pdf.splitTextToSize(question.question_text, 160);
      pdf.text(lines, 30, yPos);
      yPos += lines.length * 7;
      
      // Question details
      pdf.setFontSize(9);
      pdf.text(`[${question.marks} mark${question.marks > 1 ? 's' : ''} - ${question.question_type}]`, 30, yPos);
      yPos += 15;
    });
    
    return pdf.output('blob');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setUploadedFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or image file",
          variant: "destructive",
        });
      }
    }
  };

  const generatePreview = async () => {
    if (submissionMode === 'manual' && questions.length > 0) {
      try {
        const pdfBlob = await generatePDF(questions, title || 'Question Paper');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPreviewPdf(pdfUrl);
      } catch (error) {
        toast({
          title: "Preview Error",
          description: "Failed to generate preview",
          variant: "destructive",
        });
      }
    }
  };

  const submitQuestionPaper = async () => {
    if (!title || !selectedSubject || !selectedClass || !selectedTerm) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (submissionMode === 'manual' && questions.length === 0) {
      toast({
        title: "No Questions",
        description: "Please add at least one question",
        variant: "destructive",
      });
      return;
    }

    if (submissionMode === 'scan' && !uploadedFile) {
      toast({
        title: "No File",
        description: "Please upload a question paper file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let fileUrl = null;
      let pdfUrl = null;

      // Generate PDF for manual mode
      if (submissionMode === 'manual') {
        const pdfBlob = await generatePDF(questions, title);
        const pdfFileName = `question-papers/pdf/${Date.now()}-${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        
        const { error: pdfUploadError } = await supabase.storage
          .from('documents')
          .upload(pdfFileName, pdfBlob);

        if (pdfUploadError) throw pdfUploadError;
        pdfUrl = pdfFileName;
      }

      // Upload file if in scan mode
      if (submissionMode === 'scan' && uploadedFile) {
        const fileName = `question-papers/original/${Date.now()}-${uploadedFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, uploadedFile);

        if (uploadError) throw uploadError;
        fileUrl = fileName;
        
        // For scanned files, also set as PDF if it's already a PDF
        if (uploadedFile.type === 'application/pdf') {
          pdfUrl = fileName;
        }
      }

      // Create question paper record
      const { error } = await supabase.from("question_papers").insert({
        teacher_id: user?.id,
        title,
        subject_id: selectedSubject,
        class_id: selectedClass,
        term_id: selectedTerm,
        submission_mode: submissionMode,
        content: submissionMode === 'manual' ? JSON.stringify({ questions }) : null,
        file_url: fileUrl,
        pdf_url: pdfUrl,
        status: 'Submitted',
        submitted_at: new Date().toISOString()
      } as any);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question paper submitted successfully",
      });

      // Reset form
      setTitle('');
      setSelectedSubject('');
      setSelectedClass('');
      setQuestions([]);
      setUploadedFile(null);
      setPreviewPdf(null);
      
      // Refresh data
      await fetchData();
    } catch (error: any) {
      console.error("Error submitting question paper:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit question paper",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission("Result Upload")) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-900">Question Paper Submission</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
            <FileText className="h-16 w-16 text-orange-500" />
            <h2 className="text-xl font-semibold">Access Restricted</h2>
            <p className="text-center text-muted-foreground">
              Only teachers can submit question papers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-900">Question Paper Submission</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit New Question Paper</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="title">Question Paper Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter question paper title"
                />
              </div>
            </div>

            <Tabs value={submissionMode} onValueChange={(value) => setSubmissionMode(value as 'scan' | 'manual')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
                <TabsTrigger value="scan" className="flex items-center gap-2">
                  <Scan className="h-4 w-4" />
                  Scan/Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4">
                <RichQuestionEditor
                  questions={questions}
                  onQuestionsChange={setQuestions}
                  title={title}
                  subjectName={subjects.find(s => s.id === selectedSubject)?.name || ''}
                  className={classes.find(c => c.id === selectedClass)?.name || ''}
                  termName={terms.find(t => t.id === selectedTerm)?.name || ''}
                />
              </TabsContent>

              <TabsContent value="scan" className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Upload Question Paper</Label>
                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".pdf,image/*"
                            onChange={handleFileUpload}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF or image files up to 10MB</p>
                    </div>
                  </div>
                  {uploadedFile && (
                    <p className="mt-2 text-sm text-green-600">
                      File selected: {uploadedFile.name}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {previewPdf && (
              <div className="border rounded-lg p-4">
                <Label>PDF Preview</Label>
                <iframe 
                  src={previewPdf} 
                  className="w-full h-96 border rounded mt-2"
                  title="Question Paper Preview"
                />
              </div>
            )}

            <Button 
              onClick={submitQuestionPaper} 
              disabled={loading} 
              className="w-full"
            >
              {loading ? "Submitting..." : "Submit Question Paper"}
            </Button>
          </CardContent>
        </Card>

        {/* Submitted Papers */}
        <Card>
          <CardHeader>
            <CardTitle>My Question Papers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questionPapers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No question papers submitted yet
                </p>
              ) : (
                questionPapers.map((paper) => (
                  <Card key={paper.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-medium">{paper.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {paper.subjects?.name} • {paper.classes?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {paper.terms?.name} ({paper.terms?.academic_year})
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            paper.status === 'Approved' ? 'default' :
                            paper.status === 'Submitted' ? 'secondary' : 'outline'
                          }>
                            {paper.status}
                          </Badge>
                          <Badge variant="outline">
                            {paper.submission_mode === 'manual' ? 'Manual' : 'Scanned'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {paper.pdf_url && (
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
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={async () => {
                            if (paper.pdf_url) {
                              try {
                                const { data } = await supabase.storage
                                  .from('documents')
                                  .download(paper.pdf_url);
                                
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
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}