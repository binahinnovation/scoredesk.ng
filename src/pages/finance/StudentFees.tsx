import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchoolId } from '@/hooks/use-school-id';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { CreditCard, Loader2, FileText } from 'lucide-react';

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
    // Fetch students with class_id to filter fees
    const { data } = await supabase.from('students').select('id, first_name, last_name, admission_number, class_id').eq('school_id', schoolId);
    setStudents(data || []);
  };

  const fetchFees = async () => {
    const { data } = await supabase.from('fees').select('*, classes(name)').eq('school_id', schoolId);
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
      toast({ title: "Success", description: "Payment recorded successfully." });
      setAmountPaid('');
      fetchPayments();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Filter fees based on the selected student's class
  const applicableFees = useMemo(() => {
    if (!selectedStudent) return [];
    const student = students.find(s => s.id === selectedStudent);
    if (!student) return fees;
    
    // Return generic fees (class_id is null) OR fees that match the student's class_id
    return fees.filter(f => !f.class_id || f.class_id === student.class_id);
  }, [selectedStudent, fees, students]);

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50/50 rounded-xl p-6 border border-green-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-white rounded-lg shadow-sm border border-green-100">
          <CreditCard className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Fee Payments</h1>
          <p className="text-gray-600 mt-1">Record payments and track fee collection per student.</p>
        </div>
      </div>

      <Card className="border-green-100 shadow-md">
        <CardHeader className="bg-green-50/50 border-b border-green-100">
          <CardTitle className="text-xl">Record New Payment</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Select Student</label>
            <Select value={selectedStudent} onValueChange={(v) => { setSelectedStudent(v); setSelectedFee(''); }}>
              <SelectTrigger className="focus-visible:ring-green-500"><SelectValue placeholder="Search student..." /></SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.admission_number})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Select Fee</label>
            <Select value={selectedFee} onValueChange={setSelectedFee} disabled={!selectedStudent}>
              <SelectTrigger className="focus-visible:ring-green-500"><SelectValue placeholder={selectedStudent ? "Select applicable fee..." : "Select student first"} /></SelectTrigger>
              <SelectContent>
                {applicableFees.length === 0 ? (
                  <SelectItem value="none" disabled>No fees configured for this class</SelectItem>
                ) : (
                  applicableFees.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} {f.class_id ? '' : '(General)'} — ₦{parseFloat(f.amount).toLocaleString()}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Amount Paid (₦)</label>
            <Input type="number" placeholder="Enter amount" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className="focus-visible:ring-green-500" />
          </div>
          <div className="flex items-end">
            <Button className="w-full bg-green-600 hover:bg-green-700 shadow-sm" onClick={handleRecordPayment}>Record Payment</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle>Recent Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/30">
              <TableRow>
                <TableHead className="py-4 pl-6 font-semibold text-gray-700">Student</TableHead>
                <TableHead className="font-semibold text-gray-700">Fee</TableHead>
                <TableHead className="font-semibold text-gray-700">Amount Paid</TableHead>
                <TableHead className="font-semibold text-gray-700">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" /></TableCell></TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-16">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">No payments recorded</p>
                    <p className="text-sm text-gray-500 mt-1">When payments are logged, they will appear here.</p>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map(p => (
                  <TableRow key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4 pl-6 font-medium text-gray-900">
                      {p.students?.first_name} {p.students?.last_name}
                      <span className="block text-xs text-gray-500 font-normal">{p.students?.admission_number}</span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {p.fees?.name}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-green-600">₦{parseFloat(p.amount_paid).toLocaleString()}</TableCell>
                    <TableCell className="text-gray-500 text-sm">{new Date(p.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
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
