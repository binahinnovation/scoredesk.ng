
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Save } from 'lucide-react';

const RolePermissions = () => {
  const roles = [
    {
      name: 'Principal',
      permissions: [
        'View all results',
        'Approve results',
        'Manage users',
        'Create login details',
        'Manage classes',
        'Manage subjects',
        'Generate scratch cards',
        'Set current term',
        'Export reports',
        'View analytics'
      ]
    },
    {
      name: 'Form Master',
      permissions: [
        'View class results',
        'Export class reports',
        'Approve class results',
        'View class students',
        'Upload results (assigned classes)'
      ]
    },
    {
      name: 'Subject Teacher',
      permissions: [
        'Upload results (assigned subjects)',
        'View assigned results',
        'Edit own results'
      ]
    },
    {
      name: 'Exam Officer',
      permissions: [
        'View all results',
        'Approve results',
        'Generate scratch cards',
        'Export reports',
        'Manage assessments'
      ]
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold">Role Permissions</h1>
            <p className="text-gray-600">Configure permissions for different user roles</p>
          </div>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Card key={role.name}>
            <CardHeader>
              <CardTitle>{role.name}</CardTitle>
              <CardDescription>
                Manage permissions for {role.name.toLowerCase()} role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {role.permissions.map((permission) => (
                <div key={permission} className="flex items-center justify-between">
                  <Label htmlFor={`${role.name}-${permission}`} className="text-sm">
                    {permission}
                  </Label>
                  <Switch
                    id={`${role.name}-${permission}`}
                    defaultChecked={true}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RolePermissions;
