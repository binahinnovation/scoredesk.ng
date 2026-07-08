import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchoolId } from '@/hooks/use-school-id';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { sendSMS } from '@/utils/sms';
import { Send, MessageSquare, Loader2, Sparkles } from 'lucide-react';

export default function SMSNotifications() {
  const { schoolId } = useSchoolId();
  const [recipientType, setRecipientType] = useState('all_parents');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast({ title: "Error", description: "Please type a message.", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      // Fetch parent phone numbers from students table
      const { data: students, error } = await supabase
        .from('students')
        .select('parent_phone, parent_name, first_name, last_name')
        .eq('school_id', schoolId)
        .not('parent_phone', 'is', null);

      if (error) throw error;

      if (!students || students.length === 0) {
        toast({ title: "No Recipients", description: "No parent phone numbers found.", variant: "destructive" });
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const student of students) {
        if (student.parent_phone) {
          const result = await sendSMS({
            to: student.parent_phone,
            message: message.replace('{student_name}', `${student.first_name} ${student.last_name}`)
              .replace('{parent_name}', student.parent_name || 'Parent'),
          });
          if (result.success) successCount++;
          else failCount++;
        }
      }

      toast({ title: "SMS Sent", description: `${successCount} sent, ${failCount} failed out of ${students.length} recipients.` });
      setMessage('');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-xl p-6 border border-emerald-100 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-white rounded-lg shadow-sm border border-emerald-100 relative overflow-hidden">
          <MessageSquare className="h-8 w-8 text-emerald-600 relative z-10" />
          <div className="absolute top-0 right-0 -mt-2 -mr-2 text-emerald-200 opacity-50">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">SMS Notifications</h1>
          <p className="text-gray-600 mt-1">Send bulk, personalized SMS messages directly to parents and guardians.</p>
        </div>
      </div>

      <Card className="border-emerald-100 shadow-md">
        <CardHeader className="bg-emerald-50/50 border-b border-emerald-50 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-emerald-900">
            <Send className="h-5 w-5 text-emerald-600" /> Compose Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Select Recipients</label>
            <Select value={recipientType} onValueChange={setRecipientType}>
              <SelectTrigger className="focus-visible:ring-emerald-500 bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all_parents">All Parents (with registered phone numbers)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Message Body</label>
              <span className={`text-xs font-medium ${message.length > 160 ? 'text-amber-600' : 'text-gray-400'}`}>
                {message.length} / 160 characters {message.length > 160 && '(Multiple SMS)'}
              </span>
            </div>
            <Textarea 
              placeholder="Type your message here... Use {student_name} and {parent_name} for personalization."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="focus-visible:ring-emerald-500 resize-none bg-white"
            />
            <div className="mt-3 flex gap-2 flex-wrap">
              <span className="text-xs text-gray-500 font-medium mr-2">Available Variables:</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono cursor-pointer hover:bg-gray-200" onClick={() => setMessage(prev => prev + '{student_name}')}>{`{student_name}`}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono cursor-pointer hover:bg-gray-200" onClick={() => setMessage(prev => prev + '{parent_name}')}>{`{parent_name}`}</span>
            </div>
          </div>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all text-white font-medium py-6" onClick={handleSend} disabled={sending}>
            {sending ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Sending Messages...</> : <><Send className="h-5 w-5 mr-2" /> Send SMS to Parents</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
