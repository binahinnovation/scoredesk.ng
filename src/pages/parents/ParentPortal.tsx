import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Users, Search, Loader2, GraduationCap } from 'lucide-react';

export default function ParentPortal() {
  const [studentId, setStudentId] = useState('');
  const [pin, setPin] = useState('');
  const [studentData, setStudentData] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!studentId || !pin) {
      toast({ title: "Error", description: "Please enter Student ID and PIN.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Verify student
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .or(`admission_number.eq.${studentId},student_id.eq.${studentId}`)
        .single();

      if (error || !student) {
        toast({ title: "Not Found", description: "Student not found. Please check the ID.", variant: "destructive" });
        return;
      }

      setStudentData(student);

      // Fetch results
      const { data: resultData } = await supabase
        .from('results')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false });

      setResults(resultData || []);
      toast({ title: "Success", description: `Welcome, parent of ${student.first_name} ${student.last_name}!` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <GraduationCap className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
            <CardTitle className="text-2xl">Parent Portal</CardTitle>
            <p className="text-gray-500">View your child's academic records.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Student ID / Admission Number" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
            <Input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleLogin} disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging in...</> : <><Search className="h-4 w-4 mr-2" /> View Records</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Student Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><span className="text-sm text-gray-500">Name:</span><p className="font-medium">{studentData.first_name} {studentData.last_name}</p></div>
            <div><span className="text-sm text-gray-500">Admission No:</span><p className="font-medium">{studentData.admission_number}</p></div>
            <div><span className="text-sm text-gray-500">Class:</span><p className="font-medium">{studentData.class_name}</p></div>
            <div><span className="text-sm text-gray-500">Guardian:</span><p className="font-medium">{studentData.parent_name || '—'}</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Academic Results</CardTitle></CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No results available yet.</p>
            ) : (
              <div className="space-y-3">
                {results.map(r => (
                  <div key={r.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{r.subject}</p>
                      <p className="text-sm text-gray-500">{r.term} — {r.session}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{r.total || '—'}</p>
                      <p className="text-sm text-gray-500">{r.grade || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button variant="outline" onClick={() => { setStudentData(null); setResults([]); }}>Logout</Button>
      </div>
    </div>
  );
}
