import { ReactNode } from 'react';
import { requireRole } from '../../utils/auth';

interface ProductLayoutProps {
  children: ReactNode;
}

export default async function ProductLayout({ children }: ProductLayoutProps) {
  // Allow admin and manager roles to access product pages
  await requireRole(['admin']);

  return <>{children}</>;
}
