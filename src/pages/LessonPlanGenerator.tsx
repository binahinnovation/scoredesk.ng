import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateWithAI } from '@/utils/ai';
import { toast } from '@/components/ui/use-toast';
import { Loader2, BookOpen, Copy } from 'lucide-react';

export default function LessonPlanGenerator() {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [duration, setDuration] = useState('40');
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!subject || !topic || !classLevel) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const prompt = `Generate a detailed lesson plan for a Nigerian secondary school with the following details:
        Subject: ${subject}
        Topic: ${topic}
        Class: ${classLevel}
        Duration: ${duration} minutes
        
        Include: Objectives, Materials needed, Introduction, Lesson body (step-by-step), Activities, Assessment, and Conclusion.
        Format the output clearly with headers and bullet points.`;

      const result = await generateWithAI(prompt);
      setGeneratedPlan(result);
      toast({ title: "Success", description: "Lesson plan generated!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPlan);
    toast({ title: "Copied", description: "Lesson plan copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Lesson Plan Generator</h1>
          <p className="text-gray-600">Generate comprehensive lesson plans using AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Lesson Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Subject *</label>
              <Input placeholder="e.g. Mathematics" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Topic *</label>
              <Input placeholder="e.g. Quadratic Equations" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Class Level *</label>
              <Select value={classLevel} onValueChange={setClassLevel}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleGenerate} disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : 'Generate Lesson Plan'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Generated Plan</CardTitle>
              {generatedPlan && (
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedPlan ? (
              <div className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg max-h-[500px] overflow-y-auto">
                {generatedPlan}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Your generated lesson plan will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
