import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchoolId } from '@/hooks/use-school-id';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Briefcase, Plus, Loader2, Edit, Trash2, Users } from 'lucide-react';
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
      toast({ title: "Success", description: "Staff member added successfully." });
      setFormData({ full_name: '', email: '', phone: '', role: '', department: '' });
      setDialogOpen(false);
      fetchStaff();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted", description: "Staff member removed." }); fetchStaff(); }
  };

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50/50 rounded-xl p-6 border border-violet-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm border border-violet-100">
            <Briefcase className="h-8 w-8 text-violet-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Staff Directory</h1>
            <p className="text-gray-600 mt-1">Manage school personnel, roles, and contact information.</p>
          </div>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 shadow-sm transition-all"><Plus className="h-4 w-4 mr-2" /> Add Staff</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle className="text-xl">Add New Staff Member</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name *</label>
                <Input placeholder="e.g. Jane Doe" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="focus-visible:ring-violet-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                  <Input placeholder="jane@school.com" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="focus-visible:ring-violet-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                  <Input placeholder="Phone number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="focus-visible:ring-violet-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Role *</label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                  <SelectTrigger className="focus-visible:ring-violet-500"><SelectValue placeholder="Select Role" /></SelectTrigger>
                  <SelectContent>
                    {['Teacher', 'Head Teacher', 'Vice Principal', 'Principal', 'Admin', 'Bursar', 'Librarian', 'Security', 'Other'].map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Department</label>
                <Input placeholder="e.g. Sciences" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="focus-visible:ring-violet-500" />
              </div>
              <Button className="w-full bg-violet-600 hover:bg-violet-700 mt-2" onClick={handleCreate}>Save Staff Member</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50 border-b border-gray-100">
              <TableRow>
                <TableHead className="py-4 pl-6 font-semibold text-gray-700">Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Role</TableHead>
                <TableHead className="font-semibold text-gray-700">Department</TableHead>
                <TableHead className="font-semibold text-gray-700">Phone</TableHead>
                <TableHead className="font-semibold text-gray-700">Email</TableHead>
                <TableHead className="text-right pr-6 font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-violet-600" /></TableCell></TableRow>
              ) : staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">No staff members found</p>
                    <p className="text-sm text-gray-500 mt-1">Add your school personnel to see them listed here.</p>
                  </TableCell>
                </TableRow>
              ) : (
                staff.map(s => (
                  <TableRow key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4 pl-6 font-medium text-gray-900 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm">
                        {s.full_name.charAt(0)}
                      </div>
                      {s.full_name}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {s.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">{s.department || '—'}</TableCell>
                    <TableCell className="text-gray-600">{s.phone || '—'}</TableCell>
                    <TableCell className="text-gray-600">{s.email || '—'}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors" onClick={() => handleDelete(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
