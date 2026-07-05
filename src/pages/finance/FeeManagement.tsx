import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSchoolId } from '@/hooks/use-school-id';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Wallet, Plus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function FeeManagement() {
  const { schoolId } = useSchoolId();
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', amount: '', term: '', session: '' });

  useEffect(() => {
    if (schoolId) fetchFees();
  }, [schoolId]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fees')
        .select('*')
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
      const { error } = await supabase.from('fees').insert({
        school_id: schoolId,
        name: formData.name,
        amount: parseFloat(formData.amount),
        term: formData.term,
        session: formData.session,
      });
      if (error) throw error;
      toast({ title: "Success", description: "Fee created." });
      setFormData({ name: '', amount: '', term: '', session: '' });
      setDialogOpen(false);
      fetchFees();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet className="h-8 w-8 text-amber-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
            <p className="text-gray-600">Create and manage school fee structures.</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700"><Plus className="h-4 w-4 mr-2" /> Add Fee</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Fee</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Fee Name (e.g. Tuition Fee)" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <Input type="number" placeholder="Amount (₦)" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
              <Input placeholder="Term (e.g. First Term)" value={formData.term} onChange={(e) => setFormData({ ...formData, term: e.target.value })} />
              <Input placeholder="Session (e.g. 2025/2026)" value={formData.session} onChange={(e) => setFormData({ ...formData, session: e.target.value })} />
              <Button className="w-full" onClick={handleCreate}>Save Fee</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee Name</TableHead>
                <TableHead>Amount (₦)</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Session</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : fees.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">No fees created yet.</TableCell></TableRow>
              ) : (
                fees.map(fee => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.name}</TableCell>
                    <TableCell>₦{parseFloat(fee.amount).toLocaleString()}</TableCell>
                    <TableCell>{fee.term || '—'}</TableCell>
                    <TableCell>{fee.session || '—'}</TableCell>
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
