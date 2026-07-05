import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchoolId } from '@/hooks/use-school-id';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Briefcase, Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function StaffDirectory() {
  const { schoolId } = useSchoolId();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', role: '', department: '' });

  useEffect(() => {
    if (schoolId) fetchStaff();
  }, [schoolId]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setStaff(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.full_name || !formData.role) {
      toast({ title: "Error", description: "Name and role are required.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from('staff').insert({ school_id: schoolId, ...formData });
      if (error) throw error;
      toast({ title: "Success", description: "Staff member added." });
      setFormData({ full_name: '', email: '', phone: '', role: '', department: '' });
      setDialogOpen(false);
      fetchStaff();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this staff member?")) return;
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchStaff(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-violet-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Directory</h1>
            <p className="text-gray-600">Manage all school staff and teachers.</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700"><Plus className="h-4 w-4 mr-2" /> Add Staff</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Full Name *" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
              <Input placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <Input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger><SelectValue placeholder="Role *" /></SelectTrigger>
                <SelectContent>
                  {['Teacher', 'Head Teacher', 'Vice Principal', 'Principal', 'Admin', 'Bursar', 'Librarian', 'Security', 'Other'].map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
              <Button className="w-full" onClick={handleCreate}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : staff.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No staff members added yet.</TableCell></TableRow>
              ) : (
                staff.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.full_name}</TableCell>
                    <TableCell>{s.role}</TableCell>
                    <TableCell>{s.department || '—'}</TableCell>
                    <TableCell>{s.phone || '—'}</TableCell>
                    <TableCell>{s.email || '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
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
