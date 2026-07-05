import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchoolId } from '@/hooks/use-school-id';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { CreditCard, Loader2 } from 'lucide-react';

export default function StudentFees() {
  const { schoolId } = useSchoolId();
  const [students, setStudents] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedFee, setSelectedFee] = useState('');
  const [amountPaid, setAmountPaid] = useState('');

  useEffect(() => {
    if (schoolId) {
      fetchStudents();
      fetchFees();
      fetchPayments();
    }
  }, [schoolId]);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('id, first_name, last_name, admission_number').eq('school_id', schoolId);
    setStudents(data || []);
  };

  const fetchFees = async () => {
    const { data } = await supabase.from('fees').select('*').eq('school_id', schoolId);
    setFees(data || []);
  };

  const fetchPayments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('fee_payments')
      .select('*, students(first_name, last_name, admission_number), fees(name, amount)')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });
    setPayments(data || []);
    setLoading(false);
  };

  const handleRecordPayment = async () => {
    if (!selectedStudent || !selectedFee || !amountPaid) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from('fee_payments').insert({
        school_id: schoolId,
        student_id: selectedStudent,
        fee_id: selectedFee,
        amount_paid: parseFloat(amountPaid),
        payment_method: 'cash',
      });
      if (error) throw error;
      toast({ title: "Success", description: "Payment recorded." });
      setAmountPaid('');
      fetchPayments();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Fee Payments</h1>
          <p className="text-gray-600">Record and track fee payments per student.</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Record Payment</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
            <SelectContent>
              {students.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.admission_number})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedFee} onValueChange={setSelectedFee}>
            <SelectTrigger><SelectValue placeholder="Select Fee" /></SelectTrigger>
            <SelectContent>
              {fees.map(f => (
                <SelectItem key={f.id} value={f.id}>{f.name} — ₦{parseFloat(f.amount).toLocaleString()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Amount Paid (₦)" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleRecordPayment}>Record Payment</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
              ) : payments.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">No payments recorded yet.</TableCell></TableRow>
              ) : (
                payments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.students?.first_name} {p.students?.last_name}</TableCell>
                    <TableCell>{p.fees?.name}</TableCell>
                    <TableCell>₦{parseFloat(p.amount_paid).toLocaleString()}</TableCell>
                    <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
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
