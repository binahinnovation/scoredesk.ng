import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSchoolId } from '@/hooks/use-school-id';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { DatabaseBackup, Download, Loader2 } from 'lucide-react';

export default function DataBackup() {
  const { schoolId } = useSchoolId();
  const [exporting, setExporting] = useState<string | null>(null);

  const convertToCSV = (objArray: any[]) => {
    if (objArray.length === 0) return '';
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    const headers = Object.keys(array[0]);
    str += headers.join(',') + '\r\n';

    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (const index in array[i]) {
        if (line !== '') line += ',';
        let value = array[i][index];
        if (value && typeof value === 'object') value = JSON.stringify(value);
        if (value !== null && value !== undefined) {
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            line += `"${stringValue.replace(/"/g, '""')}"`;
          } else {
            line += stringValue;
          }
        }
      }
      str += line + '\r\n';
    }
    return str;
  };

  const downloadCSV = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (table: string, name: string) => {
    if (!schoolId) return;
    setExporting(table);
    try {
      const { data, error } = await supabase.from(table).select('*').eq('school_id', schoolId);
      if (error) throw error;
      if (!data || data.length === 0) {
        toast({ title: "No Data", description: `No records found in ${name}.` });
        return;
      }
      const csv = convertToCSV(data);
      downloadCSV(csv, `Backup_${name}`);
      toast({ title: "Success", description: `${name} exported successfully.` });
    } catch (error: any) {
      toast({ title: "Export Failed", description: error.message, variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  const backupOptions = [
    { table: 'students', name: 'Students Register', description: 'Export all student biodata, admission numbers, and class assignments.' },
    { table: 'profiles', name: 'Staff & Teachers', description: 'Export all staff members, their roles, and contact information.' },
    { table: 'results', name: 'Academic Results', description: 'Export all uploaded academic results and scores.' },
    { table: 'fee_payments', name: 'Financial Records', description: 'Export all fee payments and financial transactions.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <DatabaseBackup className="h-8 w-8 text-teal-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Backup</h1>
          <p className="text-gray-600">Export and download offline backups of your school's critical data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {backupOptions.map((option) => (
          <Card key={option.table} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{option.name}</CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700"
                onClick={() => handleExport(option.table, option.name)}
                disabled={exporting !== null}
              >
                {exporting === option.table ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {exporting === option.table ? "Exporting..." : `Download ${option.name} (CSV)`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
