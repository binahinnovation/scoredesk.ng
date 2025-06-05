
import React from 'react';
import TermManagement from '@/components/TermManagement';

const TermManagementPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Term Management</h1>
        <p className="text-gray-600">Manage academic terms and switch between periods</p>
      </div>
      <TermManagement />
    </div>
  );
};

export default TermManagementPage;
