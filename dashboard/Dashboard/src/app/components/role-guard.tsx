'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

interface JwtPayload {
  exp: number;
  role?: string;
  [key: string]: string | number | string[] | undefined | null | boolean;
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get('token');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      try {
        const decoded: JwtPayload = jwtDecode(token);
        
        // Check if token is expired
        const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();
        if (isExpired) {
          router.push('/login');
          return;
        }
        
        // Check if user has allowed role
        const userRole = decoded.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
          router.push('/unauthorized');
          return;
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [allowedRoles, router]);
  
  return <>{children}</>;
} 