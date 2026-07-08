import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchoolId } from '@/hooks/use-school-id';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Wallet, Plus, Loader2, Landmark } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function FeeManagement() {
  const { schoolId } = useSchoolId();
  const [fees, setFees] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', amount: '', term: '', session: '', class_id: 'all' });

  useEffect(() => {
    if (schoolId) {
      fetchClasses();
      fetchFees();
    }
  }, [schoolId]);

  const fetchClasses = async () => {
    const { data } = await supabase.from('classes').select('id, name').eq('school_id', schoolId);
    setClasses(data || []);
  };

  const fetchFees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fees')
        .select('*, classes(name)')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFees(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.amount) {
      toast({ title: "Error", description: "Name and amount are required.", variant: "destructive" });
      return;
    }

    try {
      const classId = formData.class_id === 'all' ? null : formData.class_id;
      
      const { error } = await supabase.from('fees').insert({
        school_id: schoolId,
        name: formData.name,
        amount: parseFloat(formData.amount),
        term: formData.term,
        session: formData.session,
        class_id: classId,
      });
      
      if (error) throw error;
      
      toast({ title: "Success", description: "Fee created successfully." });
      setFormData({ name: '', amount: '', term: '', session: '', class_id: 'all' });
      setDialogOpen(false);
      fetchFees();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50/50 rounded-xl p-6 border border-green-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm border border-green-100">
            <Wallet className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Fee Management</h1>
            <p className="text-gray-600 mt-1">Create and manage school fee structures by class.</p>
          </div>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 shadow-sm transition-all"><Plus className="h-4 w-4 mr-2" /> Add Fee</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle className="text-xl">Create New Fee</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Fee Name *</label>
                <Input placeholder="e.g. Tuition Fee" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="focus-visible:ring-green-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Amount (₦) *</label>
                <Input type="number" placeholder="Amount" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="focus-visible:ring-green-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Target Class</label>
                <Select value={formData.class_id} onValueChange={(v) => setFormData({ ...formData, class_id: v })}>
                  <SelectTrigger className="focus-visible:ring-green-500"><SelectValue placeholder="Select Class" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes (Generic Fee)</SelectItem>
                    {classes.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Term</label>
                  <Input placeholder="e.g. First Term" value={formData.term} onChange={(e) => setFormData({ ...formData, term: e.target.value })} className="focus-visible:ring-green-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Session</label>
                  <Input placeholder="e.g. 2025/2026" value={formData.session} onChange={(e) => setFormData({ ...formData, session: e.target.value })} className="focus-visible:ring-green-500" />
                </div>
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700 mt-2" onClick={handleCreate}>Save Fee</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="py-4 pl-6 font-semibold text-gray-700">Fee Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Class</TableHead>
                <TableHead className="font-semibold text-gray-700">Amount (₦)</TableHead>
                <TableHead className="font-semibold text-gray-700">Term</TableHead>
                <TableHead className="font-semibold text-gray-700">Session</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" /></TableCell></TableRow>
              ) : fees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16">
                    <Landmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">No fees configured</p>
                    <p className="text-sm text-gray-500 mt-1">Create your first fee structure to get started.</p>
                  </TableCell>
                </TableRow>
              ) : (
                fees.map(fee => (
                  <TableRow key={fee.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4 pl-6 font-medium text-gray-900">{fee.name}</TableCell>
                    <TableCell>
                      {fee.class_id ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {fee.classes?.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          All Classes
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">₦{parseFloat(fee.amount).toLocaleString()}</TableCell>
                    <TableCell className="text-gray-600">{fee.term || '—'}</TableCell>
                    <TableCell className="text-gray-600">{fee.session || '—'}</TableCell>
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
