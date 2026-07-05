import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSchoolId } from '@/hooks/use-school-id';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3 } from 'lucide-react';

export default function FinanceReports() {
  const { schoolId } = useSchoolId();
  const [totalFees, setTotalFees] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    if (schoolId) fetchData();
  }, [schoolId]);

  const fetchData = async () => {
    const { data: fees } = await supabase.from('fees').select('amount').eq('school_id', schoolId);
    const { data: payments } = await supabase.from('fee_payments').select('amount_paid').eq('school_id', schoolId);
    const { count } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId);

    const feeTotal = fees?.reduce((sum, f) => sum + parseFloat(f.amount), 0) || 0;
    const paidTotal = payments?.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0) || 0;

    setTotalFees(feeTotal * (count || 0)); // Expected revenue = total fees * student count
    setTotalPaid(paidTotal);
    setTotalStudents(count || 0);
  };

  const outstanding = totalFees - totalPaid;
  const collectionRate = totalFees > 0 ? ((totalPaid / totalFees) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">Overview of school revenue and fee collection.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Total Students</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{totalStudents}</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Total Collected</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-600">₦{totalPaid.toLocaleString()}</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Outstanding</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-600">₦{outstanding.toLocaleString()}</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Collection Rate</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-amber-600">{collectionRate}%</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
