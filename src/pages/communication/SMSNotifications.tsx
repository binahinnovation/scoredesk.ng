import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchoolId } from '@/hooks/use-school-id';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { sendSMS } from '@/utils/sms';
import { Send, MessageSquare, Loader2 } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SMS Notifications</h1>
          <p className="text-gray-600">Send bulk SMS messages to parents and guardians.</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Compose Message</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Recipients</label>
            <Select value={recipientType} onValueChange={setRecipientType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all_parents">All Parents</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea 
              placeholder="Type your message here... Use {student_name} and {parent_name} for personalization."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
            <p className="text-xs text-gray-400 mt-1">{message.length}/160 characters</p>
          </div>
          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleSend} disabled={sending}>
            {sending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : <><Send className="h-4 w-4 mr-2" /> Send SMS</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
