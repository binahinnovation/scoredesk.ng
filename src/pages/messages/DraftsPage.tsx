import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function DraftsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Draft Messages</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Draft Messages</CardTitle>
          <CardDescription>
            View and manage your draft messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Messaging system coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}