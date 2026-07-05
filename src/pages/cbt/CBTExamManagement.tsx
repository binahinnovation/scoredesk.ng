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
import { MonitorPlay, Plus, Loader2, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function CBTExamManagement() {
  const { schoolId } = useSchoolId();
  const { user } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', subject: '', class_name: '', duration_minutes: '30', instructions: '' });

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
    if (!window.confirm("Delete this exam?")) return;
    const { error } = await supabase.from('cbt_exams').delete().eq('id', id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchExams(); }
  };

  const handleToggleStatus = async (exam: any) => {
    const newStatus = exam.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('cbt_exams').update({ status: newStatus }).eq('id', exam.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Updated", description: `Exam ${newStatus}.` }); fetchExams(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MonitorPlay className="h-8 w-8 text-cyan-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CBT Exam Management</h1>
            <p className="text-gray-600">Create and manage computer-based tests.</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700"><Plus className="h-4 w-4 mr-2" /> Create Exam</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create CBT Exam</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Exam Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <Input placeholder="Subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
              <Input placeholder="Class (e.g. JSS 1)" value={formData.class_name} onChange={(e) => setFormData({ ...formData, class_name: e.target.value })} />
              <Input type="number" placeholder="Duration (minutes)" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} />
              <Textarea placeholder="Instructions for students" value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} />
              <Button className="w-full" onClick={handleCreate}>Create Exam</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : exams.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No CBT exams created yet.</TableCell></TableRow>
              ) : (
                exams.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell>{e.subject}</TableCell>
                    <TableCell>{e.class_name}</TableCell>
                    <TableCell>{e.duration_minutes} min</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${e.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {e.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleToggleStatus(e)}>
                        {e.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(e.id)}><Trash2 className="h-4 w-4" /></Button>
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
