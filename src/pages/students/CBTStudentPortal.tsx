import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { MonitorPlay, Search, Loader2 } from 'lucide-react';

export default function CBTStudentPortal() {
  const [studentId, setStudentId] = useState('');
  const [pin, setPin] = useState('');
  const [exams, setExams] = useState<any[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!studentId || !pin) {
      toast({ title: "Error", description: "Enter Student ID and PIN.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .or(`admission_number.eq.${studentId},student_id.eq.${studentId}`)
        .single();

      if (!student) {
        toast({ title: "Not Found", description: "Student not found.", variant: "destructive" });
        return;
      }

      const { data: examData } = await supabase
        .from('cbt_exams')
        .select('*')
        .eq('school_id', student.school_id)
        .eq('class_name', student.class_name)
        .eq('status', 'published');

      setExams(examData || []);
      setLoggedIn(true);
      toast({ title: "Welcome", description: `Hello, ${student.first_name}!` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <MonitorPlay className="h-12 w-12 text-cyan-600 mx-auto mb-2" />
            <CardTitle className="text-2xl">CBT Student Portal</CardTitle>
            <p className="text-gray-500">Login to take your computer-based tests.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Student ID / Admission Number" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
            <Input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={handleLogin} disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging in...</> : <><Search className="h-4 w-4 mr-2" /> Login</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Available Exams</h1>
        {exams.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-500">No exams available at this time.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map(exam => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{exam.title}</CardTitle>
                  <p className="text-sm text-gray-500">{exam.subject} • {exam.duration_minutes} min</p>
                </CardHeader>
                <CardContent>
                  {exam.instructions && <p className="text-sm text-gray-600 mb-4">{exam.instructions}</p>}
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Start Exam</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Button variant="outline" onClick={() => setLoggedIn(false)}>Logout</Button>
      </div>
    </div>
  );
}
