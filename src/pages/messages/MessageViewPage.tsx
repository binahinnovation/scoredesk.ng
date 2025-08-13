import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default function MessageViewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Message Details</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Message View</CardTitle>
          <CardDescription>
            View message details and content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Messaging system coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}