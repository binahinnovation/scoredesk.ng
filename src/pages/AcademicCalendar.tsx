import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchoolId } from '@/hooks/use-school-id';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Calendar, Plus, Loader2, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AcademicCalendar() {
  const { schoolId } = useSchoolId();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', event_type: 'holiday', start_date: '', end_date: '', description: '' });

  useEffect(() => {
    if (schoolId) fetchEvents();
  }, [schoolId]);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('academic_events')
      .select('*')
      .eq('school_id', schoolId)
      .order('start_date', { ascending: true });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setEvents(data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.start_date) {
      toast({ title: "Error", description: "Title and start date are required.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from('academic_events').insert({
        school_id: schoolId,
        ...formData,
      });
      if (error) throw error;
      toast({ title: "Success", description: "Event created." });
      setFormData({ title: '', event_type: 'holiday', start_date: '', end_date: '', description: '' });
      setDialogOpen(false);
      fetchEvents();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this event?")) return;
    const { error } = await supabase.from('academic_events').delete().eq('id', id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchEvents(); }
  };

  const typeColors: Record<string, string> = {
    holiday: 'bg-red-100 text-red-800',
    exam: 'bg-blue-100 text-blue-800',
    event: 'bg-green-100 text-green-800',
    term_start: 'bg-purple-100 text-purple-800',
    term_end: 'bg-amber-100 text-amber-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-orange-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Academic Calendar</h1>
            <p className="text-gray-600">Schedule school events, holidays, and terms.</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700"><Plus className="h-4 w-4 mr-2" /> Add Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Event Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <Select value={formData.event_type} onValueChange={(v) => setFormData({ ...formData, event_type: v })}>
                <SelectTrigger><SelectValue placeholder="Event Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="exam">Exam Period</SelectItem>
                  <SelectItem value="event">School Event</SelectItem>
                  <SelectItem value="term_start">Term Start</SelectItem>
                  <SelectItem value="term_end">Term End</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
              <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
              <Input placeholder="Description (optional)" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <Button className="w-full" onClick={handleCreate}>Save Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : events.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No events scheduled.</TableCell></TableRow>
              ) : (
                events.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[e.event_type] || 'bg-gray-100'}`}>
                        {e.event_type}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(e.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{e.end_date ? new Date(e.end_date).toLocaleDateString() : '—'}</TableCell>
                    <TableCell className="text-right">
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
