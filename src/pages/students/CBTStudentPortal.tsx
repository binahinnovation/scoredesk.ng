import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { MonitorPlay, Search, Loader2, Clock, ChevronLeft, ChevronRight, CheckCircle, GraduationCap, ArrowRight } from 'lucide-react';

export default function CBTStudentPortal() {
  const [studentId, setStudentId] = useState('');
  const [pin, setPin] = useState('');
  const [student, setStudent] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Exam-taking state
  const [activeExam, setActiveExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleLogin = async () => {
    if (!studentId || !pin) {
      toast({ title: "Error", description: "Enter Student ID and Scratch Card PIN.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // Verify scratch card PIN
      const { data: scratchCard, error: cardError } = await supabase
        .from('scratch_cards')
        .select('*')
        .eq('pin', pin)
        .eq('status', 'Active')
        .maybeSingle();

      if (cardError || !scratchCard) {
        toast({ title: "Invalid PIN", description: "The PIN you entered is invalid or not found.", variant: "destructive" });
        return;
      }

      // Check usage limit
      const currentUsage = scratchCard.usage_count || 0;
      const maxUsage = scratchCard.max_usage_count || 3;
      if (currentUsage >= maxUsage) {
        toast({ title: "Card Expired", description: "This scratch card has reached its maximum usage limit.", variant: "destructive" });
        return;
      }

      // Look up the student
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .or(`admission_number.eq.${studentId},student_id.eq.${studentId}`)
        .single();

      if (!studentData) {
        toast({ title: "Not Found", description: "Student not found.", variant: "destructive" });
        return;
      }

      // Increment scratch card usage
      await supabase
        .from('scratch_cards')
        .update({ usage_count: currentUsage + 1 })
        .eq('id', scratchCard.id);

      const { data: examData } = await supabase
        .from('cbt_exams')
        .select('*')
        .eq('school_id', studentData.school_id)
        .eq('class_name', studentData.class_name)
        .eq('status', 'published');

      setStudent(studentData);
      setExams(examData || []);
      setLoggedIn(true);
      toast({ title: "Welcome", description: `Hello, ${studentData.first_name}!` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Start an exam
  const startExam = async (exam: any) => {
    try {
      const { data: questionData } = await supabase
        .from('cbt_questions')
        .select('*')
        .eq('exam_id', exam.id)
        .order('created_at', { ascending: true });

      if (!questionData || questionData.length === 0) {
        toast({ title: "No Questions", description: "This exam has no questions yet.", variant: "destructive" });
        return;
      }

      setActiveExam(exam);
      setQuestions(questionData);
      setCurrentIndex(0);
      setAnswers({});
      setSubmitted(false);
      setScore(null);
      setTimeLeft(exam.duration_minutes * 60);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Timer
  useEffect(() => {
    if (!activeExam || submitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeExam, submitted]);

  const handleSubmit = useCallback(async () => {
    if (submitted) return;
    if (timeLeft > 0 && !window.confirm("Are you sure you want to submit your exam now?")) return;
    
    setSubmitted(true);

    let correctCount = 0;
    let totalPoints = 0;

    for (const q of questions) {
      const studentAnswer = answers[q.id];
      const isCorrect = studentAnswer === q.correct_answer;
      if (isCorrect) {
        correctCount++;
        totalPoints += (q.points || 1);
      }
    }

    const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    setScore(percentage);

    // Save attempt to database
    try {
      await supabase.from('cbt_attempts').insert({
        exam_id: activeExam.id,
        student_id: student.id,
        score: percentage,
        submitted_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Failed to save attempt:", e);
    }

    toast({ title: "Exam Submitted", description: `You scored ${correctCount}/${questions.length} (${percentage}%)` });
  }, [submitted, questions, answers, activeExam, student, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ---- Login Screen ----
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-cyan-600/5 bg-[linear-gradient(to_right,#0891b20a_1px,transparent_1px),linear-gradient(to_bottom,#0891b20a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <Card className="w-full max-w-md shadow-2xl border-cyan-100 relative z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
          <CardHeader className="text-center pt-8 pb-2">
            <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-100 shadow-sm">
              <MonitorPlay className="h-10 w-10 text-cyan-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">Student Assessment</CardTitle>
            <p className="text-gray-500 mt-2">Login with your credentials to access your CBT exams.</p>
          </CardHeader>
          <CardContent className="space-y-5 pt-6 pb-8">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 ml-1">Admission Number / Student ID</label>
              <Input 
                placeholder="e.g. ADM/2023/001" 
                value={studentId} 
                onChange={(e) => setStudentId(e.target.value)}
                className="focus-visible:ring-cyan-500 h-11"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 ml-1">Scratch Card PIN</label>
              <Input 
                type="password" 
                placeholder="Enter 12-digit PIN" 
                value={pin} 
                onChange={(e) => setPin(e.target.value)}
                className="focus-visible:ring-cyan-500 h-11 tracking-widest font-mono"
              />
            </div>
            <Button className="w-full bg-cyan-600 hover:bg-cyan-700 h-12 text-base font-medium mt-2 shadow-md transition-all" onClick={handleLogin} disabled={loading}>
              {loading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Authenticating...</> : <><Search className="h-5 w-5 mr-2" /> Enter Exam Portal</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- Dashboard / Exam Selection Screen ----
  if (loggedIn && !activeExam && !submitted) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
              <GraduationCap className="h-64 w-64" />
            </div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">Welcome, {student.first_name}!</h1>
              <p className="text-cyan-100 text-lg">Class: {student.class_name} | ID: {student.admission_number}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Exams</h2>
              <Button variant="outline" onClick={() => setLoggedIn(false)} className="border-gray-200">Logout</Button>
            </div>
            
            {exams.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200 bg-transparent shadow-none">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <MonitorPlay className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-xl font-medium text-gray-700">No Exams Available</p>
                  <p className="text-gray-500 mt-2">There are currently no active exams for your class.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(exam => (
                  <Card key={exam.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                    <CardHeader className="pb-2 border-b border-gray-100 bg-gray-50/50">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2">{exam.title}</CardTitle>
                        <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2 py-1 rounded whitespace-nowrap ml-2">
                          {exam.duration_minutes} MINS
                        </span>
                      </div>
                      <CardDescription className="font-medium text-cyan-700 mt-1">{exam.subject}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 flex flex-col flex-grow">
                      <p className="text-sm text-gray-600 mb-6 line-clamp-3 flex-grow">
                        {exam.instructions || "No specific instructions provided for this exam."}
                      </p>
                      <Button 
                        className="w-full bg-cyan-600 hover:bg-cyan-700 group-hover:shadow-md transition-all mt-auto" 
                        onClick={() => startExam(exam)}
                      >
                        Start Exam <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- Exam Results Screen ----
  if (submitted && score !== null) {
    const isPass = score >= 50;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Confetti or sad background based on score could go here */}
          <div className={`absolute inset-0 opacity-5 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] ${isPass ? 'bg-green-500' : 'bg-amber-500'}`}></div>
        </div>
        
        <Card className="w-full max-w-md shadow-2xl relative z-10 border-0 overflow-hidden">
          <div className={`h-3 w-full ${isPass ? 'bg-green-500' : 'bg-amber-500'}`}></div>
          <CardHeader className="text-center pt-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border-4 shadow-lg ${isPass ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
              <CheckCircle className={`h-12 w-12 ${isPass ? 'text-green-500' : 'text-amber-500'}`} />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">Exam Complete</CardTitle>
            <p className="text-gray-500 mt-1 font-medium">{activeExam?.title}</p>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8 text-center">
            <div className={`py-6 rounded-xl border ${isPass ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
              <p className="text-sm text-gray-600 uppercase tracking-wider font-semibold mb-1">Your Score</p>
              <p className={`text-6xl font-black ${isPass ? 'text-green-600' : 'text-amber-600'}`}>
                {score}%
              </p>
            </div>
            
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-600 font-medium">Questions Answered:</span>
              <span className="font-bold text-gray-900">{Object.keys(answers).length} / {questions.length}</span>
            </div>

            <Button 
              className={`w-full h-12 text-lg font-medium text-white shadow-md transition-all ${isPass ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}`} 
              onClick={() => { setActiveExam(null); setSubmitted(false); setScore(null); }}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---- Exam Taking Screen ----
  if (activeExam && questions.length > 0) {
    const currentQuestion = questions[currentIndex];
    const timeWarning = timeLeft < 60;
    const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col space-y-6">
          
          {/* Top Bar */}
          <div className="bg-white rounded-xl p-4 md:px-6 shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-20">
            <div className="text-center md:text-left">
              <h2 className="font-bold text-lg text-gray-900">{activeExam.title}</h2>
              <p className="text-sm text-cyan-600 font-medium">{activeExam.subject}</p>
            </div>
            
            <div className={`flex items-center gap-3 px-6 py-3 rounded-lg border-2 ${timeWarning ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-cyan-50 border-cyan-100 text-cyan-800'}`}>
              <Clock className={`h-6 w-6 ${timeWarning ? 'text-red-500' : 'text-cyan-600'}`} />
              <span className="text-3xl font-mono font-black tracking-tight">{formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-600 px-1">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>{Math.round(progressPercentage)}% Completed</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <Card className="border-0 shadow-lg flex-grow flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500"></div>
            <CardContent className="pt-8 md:pt-10 px-6 md:px-10 pb-8 flex-grow flex flex-col">
              <div className="mb-8">
                <span className="text-cyan-600 font-bold text-xl mr-3">Q{currentIndex + 1}.</span>
                <span className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed">
                  {currentQuestion.question_text}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                {['A', 'B', 'C', 'D'].map(option => {
                  const optionKey = `option_${option.toLowerCase()}` as string;
                  const optionText = currentQuestion[optionKey];
                  if (!optionText) return null;
                  
                  const isSelected = answers[currentQuestion.id] === option;
                  
                  return (
                    <button
                      key={option}
                      onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }))}
                      className={`text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-start gap-4
                        ${isSelected 
                          ? 'border-cyan-500 bg-cyan-50 ring-4 ring-cyan-500/10' 
                          : 'border-gray-200 hover:border-cyan-300 hover:bg-gray-50'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 transition-colors
                        ${isSelected ? 'bg-cyan-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-cyan-100 group-hover:text-cyan-700'}`}>
                        {option}
                      </div>
                      <span className={`text-lg pt-0.5 ${isSelected ? 'font-medium text-cyan-900' : 'text-gray-700'}`}>
                        {optionText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4">
            <Button 
              variant="outline" 
              size="lg"
              className="border-gray-300 hover:bg-gray-100 text-gray-700 font-medium px-6 h-14"
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-5 w-5 mr-2" /> Previous
            </Button>
            
            {currentIndex === questions.length - 1 ? (
              <Button 
                size="lg"
                className="bg-green-600 hover:bg-green-700 shadow-md text-white font-bold px-8 h-14 text-lg"
                onClick={handleSubmit}
              >
                Submit Exam <CheckCircle className="h-5 w-5 ml-2" />
              </Button>
            ) : (
              <Button 
                size="lg"
                className="bg-cyan-600 hover:bg-cyan-700 shadow-md text-white font-medium px-8 h-14"
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              >
                Next <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            )}
          </div>
          
          {/* Question Navigator Dots */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-10 h-10 rounded-lg font-medium text-sm transition-all flex items-center justify-center border-2
                    ${isCurrent ? 'ring-2 ring-offset-2 ring-cyan-500 border-cyan-500 bg-white text-cyan-700' : ''}
                    ${!isCurrent && isAnswered ? 'bg-cyan-100 border-cyan-200 text-cyan-800' : ''}
                    ${!isCurrent && !isAnswered ? 'bg-white border-gray-200 text-gray-500 hover:border-gray-300' : ''}
                  `}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

        </div>
      </div>
    );
  }

  return null;
}
