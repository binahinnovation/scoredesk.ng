import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/user';

interface RoleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    user_id: string;
    full_name: string;
    role: string;
  } | null;
  onRoleUpdated: () => void;
}

const AVAILABLE_ROLES: UserRole[] = [
  'Principal',
  'Exam Officer', 
  'Form Teacher',
  'Subject Teacher'
];

export const RoleAssignmentDialog: React.FC<RoleAssignmentDialogProps> = ({
  open,
  onOpenChange,
  user,
  onRoleUpdated
}) => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (user && open) {
      setSelectedRole(user.role || '');
    }
  }, [user, open]);

  const handleAssignRole = async () => {
    if (!user || !selectedRole) return;

    setIsAssigning(true);
    try {
      // Check if user already has a role assigned
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.user_id)
        .single();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: selectedRole as UserRole })
          .eq('user_id', user.user_id);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.user_id,
            role: selectedRole as UserRole
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Role assigned successfully to ${user.full_name}`,
      });

      onRoleUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveRole = async () => {
    if (!user) return;

    setIsAssigning(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role removed from ${user.full_name}`,
      });

      onRoleUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove role",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Role</DialogTitle>
          <DialogDescription>
            Assign a role to {user?.full_name || 'this user'}. This will determine their permissions in the system.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {user?.role && user.role !== 'No Role Assigned' && (
            <Button
              variant="destructive"
              onClick={handleRemoveRole}
              disabled={isAssigning}
            >
              Remove Role
            </Button>
          )}
          <Button
            onClick={handleAssignRole}
            disabled={isAssigning || !selectedRole}
          >
            {isAssigning ? 'Assigning...' : 'Assign Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};