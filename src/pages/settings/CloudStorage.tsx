import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { useSchoolId } from '@/hooks/use-school-id';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Cloud, Upload, Download, Trash2, FileText, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CloudStorage() {
  const { user } = useAuth();
  const { schoolId, loading: schoolIdLoading } = useSchoolId();

  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (schoolId) fetchData();
  }, [schoolId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('school_documents')
        .select(`*, profiles(first_name, last_name)`)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !schoolId || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${schoolId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('school_documents')
        .upload(filePath, file);

      if (uploadError) throw new Error(uploadError.message || "Failed to upload file.");

      const { error: dbError } = await supabase
        .from('school_documents')
        .insert({
          school_id: schoolId,
          file_name: file.name,
          file_size: file.size,
          content_type: file.type,
          storage_path: filePath,
          uploaded_by: user.id,
        });

      if (dbError) throw dbError;

      toast({ title: "Success", description: "Document uploaded successfully." });
      fetchData();
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('school_documents')
        .download(doc.storage_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    } catch (error: any) {
      toast({ title: "Download Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (doc: any) => {
    if (!window.confirm(`Are you sure you want to delete ${doc.file_name}?`)) return;

    try {
      const { error: storageError } = await supabase.storage
        .from('school_documents')
        .remove([doc.storage_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('school_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      toast({ title: "Deleted", description: "Document has been removed." });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (schoolIdLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cloud className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Secure Cloud Storage</h1>
            <p className="text-gray-600">Store and manage school documents safely in the cloud.</p>
          </div>
        </div>

        <div>
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <Button
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading..." : "Upload Document"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>School Documents</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />Loading documents...
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium">No documents uploaded yet</p>
                    <p className="text-sm">Click "Upload Document" to add files.</p>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="truncate max-w-[300px]">{doc.file_name}</span>
                    </TableCell>
                    <TableCell>{formatBytes(doc.file_size)}</TableCell>
                    <TableCell>{doc.profiles ? `${doc.profiles.first_name} ${doc.profiles.last_name}` : 'Unknown'}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}><Download className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(doc)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
