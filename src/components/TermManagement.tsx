
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Plus, Calendar, Archive } from "lucide-react";
import { useUserRole } from '@/hooks/use-user-role';

interface Term {
  id: string;
  name: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

const TermManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    academic_year: '',
    start_date: '',
    end_date: ''
  });

  const { hasPermission } = useUserRole();
  const queryClient = useQueryClient();

  // Fetch all terms
  const { data: terms = [], isLoading } = useQuery({
    queryKey: ['terms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('terms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Term[];
    }
  });

  // Create term mutation
  const createTermMutation = useMutation({
    mutationFn: async (termData: typeof formData) => {
      const { data, error } = await supabase
        .from('terms')
        .insert([termData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      toast({ title: "Term created successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating term",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Set current term mutation
  const setCurrentTermMutation = useMutation({
    mutationFn: async (termId: string) => {
      // First, set all terms to not current
      await supabase
        .from('terms')
        .update({ is_current: false })
        .neq('id', '');

      // Then set the selected term as current
      const { error } = await supabase
        .from('terms')
        .update({ is_current: true })
        .eq('id', termId);

      if (error) throw error;

      // Update the settings table
      const term = terms.find(t => t.id === termId);
      if (term) {
        await supabase
          .from('settings')
          .upsert({
            setting_key: 'current_term',
            setting_value: {
              term_name: term.name,
              academic_year: term.academic_year,
              term_id: termId
            }
          });
      }

      return termId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      toast({ title: "Current term updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating current term",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Archive term mutation
  const archiveTermMutation = useMutation({
    mutationFn: async (termId: string) => {
      const term = terms.find(t => t.id === termId);
      if (!term) throw new Error('Term not found');

      // Get counts for archiving
      const [studentsResult, resultsResult] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('results').select('id', { count: 'exact' }).eq('term_id', termId)
      ]);

      // Create archive record
      const { error } = await supabase
        .from('term_archives')
        .insert({
          term_id: termId,
          academic_year: term.academic_year,
          students_count: studentsResult.count || 0,
          results_count: resultsResult.count || 0
        });

      if (error) throw error;
      return termId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      toast({ title: "Term archived successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error archiving term",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      academic_year: '',
      start_date: '',
      end_date: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTermMutation.mutate(formData);
  };

  const handleSetCurrent = (termId: string) => {
    setCurrentTermMutation.mutate(termId);
  };

  const handleArchive = (termId: string) => {
    if (confirm('Are you sure you want to archive this term? This action cannot be undone.')) {
      archiveTermMutation.mutate(termId);
    }
  };

  const canManageTerms = hasPermission('Term Management') || hasPermission('System Administration');

  if (!canManageTerms) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">You don't have permission to manage terms.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Academic Terms</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Term
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Academic Term</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Term Name *</Label>
                <Select value={formData.name} onValueChange={(value) => setFormData({ ...formData, name: value })}>
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
                <Label htmlFor="academic_year">Academic Year *</Label>
                <Input
                  id="academic_year"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  placeholder="e.g., 2024/2025"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTermMutation.isPending}>
                  Create Term
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Academic Terms
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading terms...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Term</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {terms.map((term) => (
                  <TableRow key={term.id}>
                    <TableCell className="font-medium">{term.name}</TableCell>
                    <TableCell>{term.academic_year}</TableCell>
                    <TableCell>
                      {new Date(term.start_date).toLocaleDateString()} - {new Date(term.end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {term.is_current ? (
                        <Badge variant="default">Current</Badge>
                      ) : (
                        <Badge variant="secondary">Past</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!term.is_current && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetCurrent(term.id)}
                            disabled={setCurrentTermMutation.isPending}
                          >
                            Set Current
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleArchive(term.id)}
                          disabled={archiveTermMutation.isPending}
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TermManagement;
