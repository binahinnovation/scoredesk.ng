import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchoolId } from '@/hooks/use-school-id';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Search } from 'lucide-react';

export default function StudentPerformanceTracker() {
  const { schoolId } = useSchoolId();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (schoolId) fetchStudents();
  }, [schoolId]);

  useEffect(() => {
    if (selectedStudent) fetchResults();
  }, [selectedStudent]);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select('id, first_name, last_name, admission_number')
      .eq('school_id', schoolId);
    setStudents(data || []);
  };

  const fetchResults = async () => {
    const { data } = await supabase
      .from('results')
      .select('*')
      .eq('student_id', selectedStudent)
      .order('created_at', { ascending: true });
    setResults(data || []);
  };

  const filteredStudents = students.filter(s =>
    `${s.first_name} ${s.last_name} ${s.admission_number}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate average per term for the trend
  const termAverages = results.reduce((acc: any[], r) => {
    const key = `${r.term} ${r.session}`;
    const existing = acc.find(a => a.label === key);
    if (existing) {
      existing.total += parseFloat(r.total || 0);
      existing.count += 1;
      existing.avg = Math.round(existing.total / existing.count);
    } else {
      acc.push({ label: key, total: parseFloat(r.total || 0), count: 1, avg: Math.round(parseFloat(r.total || 0)) });
    }
    return acc;
  }, []);

  const maxAvg = Math.max(...termAverages.map(t => t.avg), 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Performance Tracker</h1>
          <p className="text-gray-600">Track individual student performance trends across terms.</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Select Student</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input className="pl-10" placeholder="Search by name or admission number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger><SelectValue placeholder="Choose a student" /></SelectTrigger>
            <SelectContent>
              {filteredStudents.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.admission_number})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedStudent && (
        <Card>
          <CardHeader><CardTitle>Performance Trend</CardTitle></CardHeader>
          <CardContent>
            {termAverages.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No results available for this student.</p>
            ) : (
              <div className="space-y-3">
                {termAverages.map((t, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-sm w-32 text-gray-600 truncate">{t.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-end pr-2 text-xs font-bold text-white transition-all duration-500"
                        style={{ width: `${(t.avg / maxAvg) * 100}%` }}
                      >
                        {t.avg}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
