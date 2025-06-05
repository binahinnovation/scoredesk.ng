
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Calendar, Clock, Archive, Settings2 } from 'lucide-react';

interface Term {
  id: string;
  name: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

interface CurrentTermSetting {
  term_id: string | null;
  term_name: string;
  academic_year: string;
}

const TermManagement = () => {
  const [newTermName, setNewTermName] = useState('');
  const [newAcademicYear, setNewAcademicYear] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { toast } = useToast();

  const { data: termsData, loading: termsLoading, refetch: refetchTerms } = useSupabaseQuery<Term[]>(
    async () => {
      const { data, error } = await supabase
        .from('terms')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    },
    []
  );

  const { data: currentTermData, loading: settingsLoading, refetch: refetchSettings } = useSupabaseQuery<CurrentTermSetting>(
    async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('setting_value')
        .eq('setting_key', 'current_term')
        .single();
      
      if (data) {
        return { data: data.setting_value as CurrentTermSetting, error };
      }
      return { data: null, error };
    },
    []
  );

  const terms = termsData || [];
  const currentTerm = currentTermData || { term_id: null, term_name: 'First Term', academic_year: '2024/2025' };

  const createTerm = async () => {
    if (!newTermName || !newAcademicYear || !startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('terms')
        .insert({
          name: newTermName,
          academic_year: newAcademicYear,
          start_date: startDate,
          end_date: endDate,
          is_current: false
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "New term created successfully.",
      });

      setNewTermName('');
      setNewAcademicYear('');
      setStartDate('');
      setEndDate('');
      refetchTerms();
    } catch (error: any) {
      console.error("Error creating term:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create term.",
        variant: "destructive",
      });
    }
  };

  const setCurrentTerm = async (termId: string) => {
    const selectedTerm = terms.find(t => t.id === termId);
    if (!selectedTerm) return;

    try {
      // Archive current term data if switching terms
      if (currentTerm.term_id && currentTerm.term_id !== termId) {
        const { data: resultsCount } = await supabase
          .from('results')
          .select('id', { count: 'exact' })
          .eq('term_id', currentTerm.term_id);

        const { data: studentsCount } = await supabase
          .from('students')
          .select('id', { count: 'exact' });

        await supabase
          .from('term_archives')
          .insert({
            term_id: currentTerm.term_id,
            academic_year: currentTerm.academic_year,
            results_count: resultsCount?.length || 0,
            students_count: studentsCount?.length || 0,
          });
      }

      // Update current term setting
      const { error } = await supabase
        .from('settings')
        .upsert({
          setting_key: 'current_term',
          setting_value: {
            term_id: termId,
            term_name: selectedTerm.name,
            academic_year: selectedTerm.academic_year
          }
        });

      if (error) throw error;

      // Update the is_current flag in terms table
      await supabase
        .from('terms')
        .update({ is_current: false })
        .neq('id', termId);

      await supabase
        .from('terms')
        .update({ is_current: true })
        .eq('id', termId);

      toast({
        title: "Success",
        description: `Current term set to ${selectedTerm.name} ${selectedTerm.academic_year}.`,
      });

      refetchSettings();
      refetchTerms();
    } catch (error: any) {
      console.error("Error setting current term:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to set current term.",
        variant: "destructive",
      });
    }
  };

  if (termsLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading term management...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Term Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Current Academic Term
          </CardTitle>
          <CardDescription>
            The active term for student results and assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {currentTerm.term_name} {currentTerm.academic_year}
          </div>
          {currentTerm.term_id && (
            <p className="text-sm text-muted-foreground mt-2">
              Term ID: {currentTerm.term_id}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create New Term */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Create New Term
            </CardTitle>
            <CardDescription>
              Add a new academic term to the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="termName">Term Name</Label>
              <Select value={newTermName} onValueChange={setNewTermName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Term">First Term</SelectItem>
                  <SelectItem value="Second Term">Second Term</SelectItem>
                  <SelectItem value="Third Term">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                placeholder="e.g., 2024/2025"
                value={newAcademicYear}
                onChange={(e) => setNewAcademicYear(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={createTerm} className="w-full">
              Create Term
            </Button>
          </CardContent>
        </Card>

        {/* Set Current Term */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings2 className="h-5 w-5 mr-2" />
              Switch Current Term
            </CardTitle>
            <CardDescription>
              Change the active term (archives current data)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {terms.map((term) => (
                <div key={term.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{term.name} {term.academic_year}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(term.start_date).toLocaleDateString()} - {new Date(term.end_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {term.is_current && <Badge variant="default">Current</Badge>}
                    {!term.is_current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentTerm(term.id)}
                      >
                        Set as Current
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {terms.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No terms created yet. Create your first term to get started.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermManagement;
