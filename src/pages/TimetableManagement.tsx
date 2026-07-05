import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateWithAI } from '@/utils/ai';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Calendar, Copy } from 'lucide-react';

export default function TimetableManagement() {
  const [schoolType, setSchoolType] = useState('');
  const [numClasses, setNumClasses] = useState('6');
  const [subjects, setSubjects] = useState('');
  const [generatedTimetable, setGeneratedTimetable] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!schoolType || !subjects) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const prompt = `Generate a weekly school timetable for a Nigerian ${schoolType} school with the following:
        Number of Classes: ${numClasses}
        Subjects: ${subjects}
        
        Create a Monday-Friday timetable with 8 periods per day (40 minutes each).
        Include break and lunch periods. Ensure no subject clashes for teachers.
        Format as a clear table.`;

      const result = await generateWithAI(prompt);
      setGeneratedTimetable(result);
      toast({ title: "Success", description: "Timetable generated!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedTimetable);
    toast({ title: "Copied", description: "Timetable copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Timetable Generator</h1>
          <p className="text-gray-600">Generate weekly school timetables using AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Timetable Parameters</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">School Type *</label>
              <Select value={schoolType} onValueChange={setSchoolType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primary">Primary School</SelectItem>
                  <SelectItem value="Junior Secondary">Junior Secondary</SelectItem>
                  <SelectItem value="Senior Secondary">Senior Secondary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Number of Classes</label>
              <Input type="number" value={numClasses} onChange={(e) => setNumClasses(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Subjects (comma-separated) *</label>
              <Input placeholder="e.g. Math, English, Physics, Chemistry" value={subjects} onChange={(e) => setSubjects(e.target.value)} />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleGenerate} disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : 'Generate Timetable'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Generated Timetable</CardTitle>
              {generatedTimetable && (
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedTimetable ? (
              <div className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg max-h-[500px] overflow-y-auto">
                {generatedTimetable}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Your generated timetable will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
