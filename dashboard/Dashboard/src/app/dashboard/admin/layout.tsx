import { ReactNode } from 'react';
import { requireRole } from '../../utils/auth';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requireRole('admin');

  return (
    <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
      <div className="mb-4 pb-2 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Admin Area</h1>
        <p className="text-sm text-gray-600">Restricted access section</p>
      </div>
      {children}
    </div>
  );
}
