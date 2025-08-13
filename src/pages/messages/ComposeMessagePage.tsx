import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PenTool, Send, Save, Paperclip } from 'lucide-react';
import { Editor } from '@tinymce/tinymce-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';

interface Profile {
  id: string;
  full_name: string;
}

export default function ComposeMessagePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const editorRef = useRef<any>(null);

  const [recipientId, setRecipientId] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState<boolean>(false);

  // Fetch all profiles to use as recipients
  const { data: allProfiles, loading: profilesLoading } = useSupabaseQuery<Profile[]>(
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .neq('id', user?.id); // Exclude current user from recipients
      return { data, error };
    },
    [user]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAttachments(Array.from(event.target.files));
    }
  };

  const handleSendMessage = async (isDraft: boolean) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to send messages.",
        variant: "destructive",
      });
      return;
    }

    if (!isDraft && (!recipientId || !subject.trim() || !body.trim())) {
      toast({
        title: "Missing Information",
        description: "Please fill in recipient, subject, and message body.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      // Get user's school_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', user.id)
        .single();

      // 1. Insert message into 'messages' table
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          school_id: profile?.school_id,
          sender_id: user.id,
          subject: subject.trim(),
          body: body.trim(),
          has_attachments: attachments.length > 0,
          is_draft: isDraft,
        })
        .select()
        .single();

      if (messageError) throw messageError;

      const messageId = messageData.id;

      // 2. Insert recipient into 'message_recipients' table (if not a draft)
      if (!isDraft && recipientId) {
        const { error: recipientError } = await supabase
          .from('message_recipients')
          .insert({
            message_id: messageId,
            recipient_id: recipientId,
          });
        if (recipientError) throw recipientError;
      }

      // 3. Upload attachments to storage (if any)
      if (attachments.length > 0) {
        for (const file of attachments) {
          const filePath = `${messageId}/${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('message_attachments')
            .upload(filePath, file);
          
          if (uploadError) {
            console.error("Error uploading attachment:", uploadError);
          } else {
            // Record attachment in database
            await supabase
              .from('message_attachments')
              .insert({
                message_id: messageId,
                file_path: filePath,
              });
          }
        }
      }

      toast({
        title: "Success",
        description: isDraft ? "Message saved as draft!" : "Message sent successfully!",
      });

      // Clear form
      setRecipientId('');
      setSubject('');
      setBody('');
      if (editorRef.current) {
        editorRef.current.setContent('');
      }
      setAttachments([]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <PenTool className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Compose Message</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>New Message</CardTitle>
          <CardDescription>
            Compose and send a new message
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipient">To</Label>
            <Select value={recipientId} onValueChange={setRecipientId} disabled={profilesLoading || sending}>
              <SelectTrigger id="recipient">
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {profilesLoading ? (
                  <SelectItem value="loading" disabled>Loading recipients...</SelectItem>
                ) : (
                  allProfiles?.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name || 'Unknown User'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
              disabled={sending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message Body</Label>
            <Editor
              apiKey="4p9rrdmnwohm65wffmzhj0mlmk7gt99cw2c47btmqh5rakzm"
              onInit={(evt, editor) => editorRef.current = editor}
              value={body}
              onEditorChange={(content) => setBody(content)}
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                         'bold italic forecolor | alignleft aligncenter ' +
                         'alignright alignjustify | bullist numlist outdent indent | ' +
                         'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                placeholder: 'Compose your message here...',
                readonly: sending,
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments</Label>
            <div className="flex items-center gap-2">
              <Input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={sending}
                className="flex-1"
              />
              <Paperclip className="h-4 w-4 text-muted-foreground" />
            </div>
            {attachments.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Selected files:</p>
                <ul className="list-disc list-inside">
                  {attachments.map((file, index) => (
                    <li key={index}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleSendMessage(true)}
              disabled={sending || (!subject.trim() && !body.trim())}
            >
              <Save className="h-4 w-4 mr-2" />
              {sending ? "Saving..." : "Save as Draft"}
            </Button>
            <Button
              onClick={() => handleSendMessage(false)}
              disabled={sending || !recipientId || !subject.trim() || !body.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}