import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchoolId } from '@/hooks/use-school-id';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Search, UserCircle, LineChart } from 'lucide-react';

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
    const totalValue = Number(r.total);
    const safeTotal = isNaN(totalValue) ? 0 : totalValue;
    const existing = acc.find(a => a.label === key);
    if (existing) {
      existing.total += safeTotal;
      existing.count += 1;
      existing.avg = Math.round(existing.total / existing.count);
    } else {
      acc.push({ label: key, total: safeTotal, count: 1, avg: Math.round(safeTotal) });
    }
    return acc;
  }, []);

  const maxAvg = Math.max(...termAverages.map(t => t.avg), 100);
  const selectedStudentData = students.find(s => s.id === selectedStudent);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-xl p-6 border border-emerald-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-white rounded-lg shadow-sm border border-emerald-100">
          <TrendingUp className="h-8 w-8 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Performance Tracker</h1>
          <p className="text-gray-600 mt-1">Visualize and analyze individual student academic progression across terms.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <Card className="border-emerald-100 shadow-md h-full">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-emerald-900">
                <Search className="h-5 w-5 text-emerald-600" /> Find Student
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input className="pl-10 focus-visible:ring-emerald-500" placeholder="Name or admission no..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="focus-visible:ring-emerald-500 bg-white">
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.length === 0 ? (
                    <SelectItem value="none" disabled>No students found</SelectItem>
                  ) : (
                    filteredStudents.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.admission_number})</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card className="border-gray-200 shadow-sm h-full flex flex-col">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-gray-800">
                {selectedStudentData ? `Performance Trend: ${selectedStudentData.first_name} ${selectedStudentData.last_name}` : 'Performance Trend'}
              </CardTitle>
              {selectedStudentData && (
                <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-gray-200 shadow-sm text-gray-600">
                  ID: {selectedStudentData.admission_number}
                </span>
              )}
            </CardHeader>
            <CardContent className="pt-6 flex-grow flex flex-col">
              {!selectedStudent ? (
                <div className="flex-grow flex flex-col items-center justify-center text-gray-400 py-12">
                  <UserCircle className="h-16 w-16 text-gray-200 mb-4" />
                  <p className="text-lg font-medium text-gray-600">Select a student</p>
                  <p className="text-sm mt-1 text-center max-w-xs">Search and choose a student from the list to view their academic progression.</p>
                </div>
              ) : termAverages.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-gray-400 py-12">
                  <LineChart className="h-16 w-16 text-gray-200 mb-4" />
                  <p className="text-lg font-medium text-gray-600">No results available</p>
                  <p className="text-sm mt-1 text-center max-w-xs">This student does not have any recorded results yet.</p>
                </div>
              ) : (
                <div className="space-y-6 mt-4">
                  {termAverages.map((t, i) => {
                    const percentage = (t.avg / maxAvg) * 100;
                    // Determine color based on performance
                    let barColor = 'from-emerald-400 to-emerald-600';
                    if (t.avg < 40) barColor = 'from-red-400 to-red-600';
                    else if (t.avg < 60) barColor = 'from-amber-400 to-amber-600';

                    return (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-36 flex-shrink-0 text-right">
                          <span className="text-sm font-medium text-gray-700">{t.label}</span>
                        </div>
                        <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden shadow-inner relative">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${barColor} flex items-center justify-end pr-3 text-xs font-bold text-white transition-all duration-1000 ease-out group-hover:brightness-110`}
                            style={{ width: `${Math.max(percentage, 5)}%` }} // Ensure bar is visible even if low
                          >
                            {t.avg}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-6 border-t border-gray-100 mt-8 flex gap-6 justify-center">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Excellent (≥60%)</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Average (40-59%)</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium"><div className="w-3 h-3 rounded-full bg-red-500"></div> Poor (&lt;40%)</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
