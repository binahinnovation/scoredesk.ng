import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchoolId } from '@/hooks/use-school-id';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { MonitorPlay, Plus, Loader2, Trash2, ListChecks, ChevronLeft, LayoutDashboard, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function CBTExamManagement() {
  const { schoolId } = useSchoolId();
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', subject: '', class_name: '', duration_minutes: '30', instructions: '' });

  // Question management state
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: '', points: '1'
  });

  useEffect(() => {
    if (schoolId) fetchExams();
  }, [schoolId]);

  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cbt_exams')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setExams(data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.subject || !formData.class_name) {
      toast({ title: "Error", description: "Title, subject, and class are required.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from('cbt_exams').insert({
        school_id: schoolId,
        created_by: user?.id,
        title: formData.title,
        subject: formData.subject,
        class_name: formData.class_name,
        duration_minutes: parseInt(formData.duration_minutes),
        instructions: formData.instructions,
        status: 'draft',
      });
      if (error) throw error;
      toast({ title: "Success", description: "CBT Exam created." });
      setFormData({ title: '', subject: '', class_name: '', duration_minutes: '30', instructions: '' });
      setDialogOpen(false);
      fetchExams();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this exam and all its questions?")) return;
    const { error } = await supabase.from('cbt_exams').delete().eq('id', id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted", description: "Exam removed successfully." }); fetchExams(); }
  };

  const handleToggleStatus = async (exam: any) => {
    const newStatus = exam.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('cbt_exams').update({ status: newStatus }).eq('id', exam.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Updated", description: `Exam is now ${newStatus}.` }); fetchExams(); }
  };

  // ---- Question Management ----
  const openQuestionManager = async (exam: any) => {
    setSelectedExam(exam);
    await fetchQuestions(exam.id);
  };

  const fetchQuestions = async (examId: string) => {
    setQuestionsLoading(true);
    const { data, error } = await supabase
      .from('cbt_questions')
      .select('*')
      .eq('exam_id', examId)
      .order('created_at', { ascending: true });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setQuestions(data || []);
    setQuestionsLoading(false);
  };

  const handleAddQuestion = async () => {
    if (!questionForm.question_text || !questionForm.correct_answer) {
      toast({ title: "Error", description: "Question text and correct answer are required.", variant: "destructive" });
      return;
    }
    if (!['A', 'B', 'C', 'D'].includes(questionForm.correct_answer)) {
      toast({ title: "Error", description: "Correct answer must be A, B, C, or D.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from('cbt_questions').insert({
        exam_id: selectedExam.id,
        question_text: questionForm.question_text,
        option_a: questionForm.option_a,
        option_b: questionForm.option_b,
        option_c: questionForm.option_c,
        option_d: questionForm.option_d,
        correct_answer: questionForm.correct_answer,
        points: parseInt(questionForm.points) || 1,
      });
      if (error) throw error;
      toast({ title: "Success", description: "Question added." });
      setQuestionForm({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: '', points: '1' });
      setQuestionDialogOpen(false);
      fetchQuestions(selectedExam.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm("Delete this question?")) return;
    const { error } = await supabase.from('cbt_questions').delete().eq('id', id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted", description: "Question removed." }); fetchQuestions(selectedExam.id); }
  };

  // ---- Question Manager View ----
  if (selectedExam) {
    return (
      <div className="space-y-6">
        {/* Premium Header - Questions View */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50/50 rounded-xl p-6 border border-cyan-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setSelectedExam(null)} className="rounded-full h-10 w-10 border-cyan-200 text-cyan-700 hover:bg-cyan-50">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{selectedExam.title}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${selectedExam.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  {selectedExam.status.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 mt-1 flex items-center gap-2 text-sm">
                <span className="bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">{selectedExam.subject}</span>
                <span className="bg-white px-2 py-0.5 rounded border border-gray-200 shadow-sm">{selectedExam.class_name}</span>
                <span className="text-cyan-700 font-medium">{questions.length} question(s)</span>
              </p>
            </div>
          </div>
          <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700 shadow-sm"><Plus className="h-4 w-4 mr-2" /> Add Question</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle className="text-xl">Add New Question</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Question Text *</label>
                  <Textarea value={questionForm.question_text} onChange={e => setQuestionForm({ ...questionForm, question_text: e.target.value })} placeholder="Type the question here..." rows={3} className="focus-visible:ring-cyan-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Option A</label>
                    <Input value={questionForm.option_a} onChange={e => setQuestionForm({ ...questionForm, option_a: e.target.value })} className="focus-visible:ring-cyan-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Option B</label>
                    <Input value={questionForm.option_b} onChange={e => setQuestionForm({ ...questionForm, option_b: e.target.value })} className="focus-visible:ring-cyan-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Option C</label>
                    <Input value={questionForm.option_c} onChange={e => setQuestionForm({ ...questionForm, option_c: e.target.value })} className="focus-visible:ring-cyan-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Option D</label>
                    <Input value={questionForm.option_d} onChange={e => setQuestionForm({ ...questionForm, option_d: e.target.value })} className="focus-visible:ring-cyan-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Correct Answer (A/B/C/D) *</label>
                    <Select value={questionForm.correct_answer} onValueChange={(v) => setQuestionForm({ ...questionForm, correct_answer: v })}>
                      <SelectTrigger className="focus-visible:ring-cyan-500"><SelectValue placeholder="Select correct option" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Option A</SelectItem>
                        <SelectItem value="B">Option B</SelectItem>
                        <SelectItem value="C">Option C</SelectItem>
                        <SelectItem value="D">Option D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Points</label>
                    <Input type="number" value={questionForm.points} onChange={e => setQuestionForm({ ...questionForm, points: e.target.value })} min="1" className="focus-visible:ring-cyan-500" />
                  </div>
                </div>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 mt-2" onClick={handleAddQuestion}>Save Question</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {questionsLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-cyan-600" /></div>
        ) : questions.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200 shadow-none bg-gray-50/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ListChecks className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">No questions added yet</p>
              <p className="text-sm text-gray-500 mt-1">Click "Add Question" to build your exam.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((q, index) => (
              <Card key={q.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="py-4 border-b border-gray-100 bg-gray-50/30 flex flex-row justify-between items-start">
                  <CardTitle className="text-base font-semibold text-gray-800 leading-snug">
                    <span className="text-cyan-600 mr-2">Q{index + 1}.</span> {q.question_text}
                  </CardTitle>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium border border-gray-200">{q.points} point(s)</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteQuestion(q.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const optKey = `option_${opt.toLowerCase()}` as keyof typeof q;
                      const isCorrect = q.correct_answer === opt;
                      return (
                        <div key={opt} className={`p-3 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                          <span className={`font-bold mr-2 ${isCorrect ? 'text-green-700' : 'text-gray-500'}`}>{opt}.</span>
                          {q[optKey] || '—'}
                          {isCorrect && <span className="float-right text-green-600 font-bold">✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---- Main Exam List View ----
  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50/50 rounded-xl p-6 border border-cyan-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm border border-cyan-100">
            <MonitorPlay className="h-8 w-8 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">CBT Exam Management</h1>
            <p className="text-gray-600 mt-1">Create and manage Computer Based Tests for students.</p>
          </div>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700 shadow-sm transition-all"><Plus className="h-4 w-4 mr-2" /> Create Exam</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle className="text-xl">Create New CBT Exam</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Exam Title *</label>
                <Input placeholder="e.g. Mid-Term Assessment" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="focus-visible:ring-cyan-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Subject *</label>
                  <Input placeholder="e.g. Mathematics" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="focus-visible:ring-cyan-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Class *</label>
                  <Select value={formData.class_name} onValueChange={(v) => setFormData({ ...formData, class_name: v })}>
                    <SelectTrigger className="focus-visible:ring-cyan-500"><SelectValue placeholder="Select Class" /></SelectTrigger>
                    <SelectContent>
                      {['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Duration (minutes)</label>
                <Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} min="5" className="focus-visible:ring-cyan-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Instructions</label>
                <Textarea placeholder="e.g. Answer all questions. Calculators are not allowed." value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} rows={3} className="focus-visible:ring-cyan-500 resize-none" />
              </div>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700 mt-2" onClick={handleCreate}>Save Exam Configuration</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50 border-b border-gray-100">
              <TableRow>
                <TableHead className="py-4 pl-6 font-semibold text-gray-700">Exam Details</TableHead>
                <TableHead className="font-semibold text-gray-700">Class & Subject</TableHead>
                <TableHead className="font-semibold text-gray-700">Duration</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="text-right pr-6 font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-600" /></TableCell></TableRow>
              ) : exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16">
                    <LayoutDashboard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">No CBT exams created</p>
                    <p className="text-sm text-gray-500 mt-1">Create your first exam to add questions and publish it for students.</p>
                  </TableCell>
                </TableRow>
              ) : (
                exams.map(exam => (
                  <TableRow key={exam.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4 pl-6">
                      <p className="font-bold text-gray-900">{exam.title}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Created {new Date(exam.created_at).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-800">{exam.subject}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 mt-1">
                        {exam.class_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded-md inline-block border border-gray-100">
                        {exam.duration_minutes} mins
                      </span>
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => handleToggleStatus(exam)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors border ${
                          exam.status === 'published' 
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {exam.status.toUpperCase()}
                      </button>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="border-cyan-200 text-cyan-700 hover:bg-cyan-50" onClick={() => openQuestionManager(exam)}>
                          <ListChecks className="h-4 w-4 mr-1" /> Questions
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(exam.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
