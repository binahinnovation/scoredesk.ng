import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Settings, Plus, Archive } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Term {
  id: string;
  name: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

interface CurrentTermSetting {
  term_id: string | null;
  term_name: string;
  academic_year: string;
}

const TermManagement = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTerm, setNewTerm] = useState({
    name: '',
    academic_year: '',
    start_date: '',
    end_date: ''
  });
  const { toast } = useToast();

  const { data: terms, loading: termsLoading, refetch: refetchTerms } = useSupabaseQuery<Term[]>(
    async () => {
      const { data, error } = await supabase
        .from('terms')
        .select('*')
        .order('academic_year', { ascending: false });
      return { data: data as Term[], error };
    },
    []
  );

  const { data: currentTermSetting, loading: settingLoading, refetch: refetchSetting } = useSupabaseQuery<CurrentTermSetting>(
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

  const createTerm = async () => {
    try {
      const { error } = await supabase
        .from('terms')
        .insert([{
          name: newTerm.name,
          academic_year: newTerm.academic_year,
          start_date: newTerm.start_date,
          end_date: newTerm.end_date,
          is_current: false
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Term created successfully",
      });

      setNewTerm({ name: '', academic_year: '', start_date: '', end_date: '' });
      setIsCreating(false);
      refetchTerms();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create term: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const setCurrentTerm = async (termId: string, termName: string, academicYear: string) => {
    try {
      // Archive current term data if switching
      if (currentTermSetting?.term_id && currentTermSetting.term_id !== termId) {
        await archiveCurrentTerm();
      }

      // Update current term setting
      const { error } = await supabase
        .from('settings')
        .upsert({
          setting_key: 'current_term',
          setting_value: {
            term_id: termId,
            term_name: termName,
            academic_year: academicYear
          }
        });

      if (error) throw error;

      // Update is_current flag in terms table
      await supabase
        .from('terms')
        .update({ is_current: false })
        .neq('id', 'none');

      await supabase
        .from('terms')
        .update({ is_current: true })
        .eq('id', termId);

      toast({
        title: "Success",
        description: `Current term set to ${termName} ${academicYear}`,
      });

      refetchSetting();
      refetchTerms();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to set current term: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const archiveCurrentTerm = async () => {
    if (!currentTermSetting?.term_id) return;

    try {
      // Count results and students for archiving
      const { data: resultsCount } = await supabase
        .from('results')
        .select('id', { count: 'exact', head: true })
        .eq('term_id', currentTermSetting.term_id);

      const { data: studentsCount } = await supabase
        .from('students')
        .select('id', { count: 'exact', head: true });

      // Create archive entry
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('term_archives')
        .insert({
          term_id: currentTermSetting.term_id,
          academic_year: currentTermSetting.academic_year,
          archived_by: user?.id,
          results_count: resultsCount || 0,
          students_count: studentsCount || 0
        });

    } catch (error) {
      console.error('Error archiving term:', error);
    }
  };

  if (termsLoading || settingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading terms...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center mb-6">
        <Calendar className="h-8 w-8 text-blue-600 mr-3" />
        <div>
          <h1 className="text-3xl font-bold">Term Management</h1>
          <p className="text-gray-600">Manage academic terms and current session</p>
        </div>
      </div>

      {/* Current Term Display */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Current Academic Term
          </CardTitle>
          <CardDescription>
            The currently active term for all operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentTermSetting ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800">
                {currentTermSetting.term_name} - {currentTermSetting.academic_year}
              </h3>
              <p className="text-sm text-blue-600 mt-1">
                All new results and data will be associated with this term
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">No current term set. Please select a term below.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create New Term */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Create New Term
            </span>
            <Button 
              onClick={() => setIsCreating(!isCreating)}
              variant="outline"
              size="sm"
            >
              {isCreating ? 'Cancel' : 'Add Term'}
            </Button>
          </CardTitle>
        </CardHeader>
        {isCreating && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="termName">Term Name</Label>
                <Select 
                  value={newTerm.name} 
                  onValueChange={(value) => setNewTerm({...newTerm, name: value})}
                >
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
                  value={newTerm.academic_year}
                  onChange={(e) => setNewTerm({...newTerm, academic_year: e.target.value})}
                  placeholder="e.g., 2024/2025"
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newTerm.start_date}
                  onChange={(e) => setNewTerm({...newTerm, start_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newTerm.end_date}
                  onChange={(e) => setNewTerm({...newTerm, end_date: e.target.value})}
                />
              </div>
            </div>
            <Button onClick={createTerm} className="w-full">
              Create Term
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Existing Terms */}
      <Card>
        <CardHeader>
          <CardTitle>All Academic Terms</CardTitle>
          <CardDescription>
            Manage existing terms and set the current active term
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {terms && terms.length > 0 ? (
              terms.map((term) => (
                <div key={term.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">
                      {term.name} - {term.academic_year}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(term.start_date).toLocaleDateString()} - {new Date(term.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {term.is_current ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Current
                      </span>
                    ) : (
                      <Button
                        onClick={() => setCurrentTerm(term.id, term.name, term.academic_year)}
                        variant="outline"
                        size="sm"
                      >
                        Set as Current
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No terms created yet. Create your first term above.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermManagement;
