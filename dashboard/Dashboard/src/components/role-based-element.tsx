'use client';

import { useAuth } from '@/hooks/useAuth';
import { ReactNode } from 'react';

interface RoleBasedElementProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export default function RoleBasedElement({ 
  children, 
  allowedRoles, 
  fallback = null 
}: RoleBasedElementProps) {
  const { hasRole, isLoading } = useAuth();
  
  // While loading, don't render anything
  if (isLoading) {
    return null;
  }
  
  // If user has the required role, render the children
  if (hasRole(allowedRoles)) {
    return <>{children}</>;
  }
  
  // Otherwise, render the fallback (if provided)
  return <>{fallback}</>;
} 