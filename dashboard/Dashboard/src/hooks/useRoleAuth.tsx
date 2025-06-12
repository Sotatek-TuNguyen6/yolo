'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface JwtPayload {
  exp: number;
  role?: string;
  [key: string]: string | number | string[] | undefined | null | boolean;
}

export function useRoleAuth(allowedRoles: string[]) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

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
        
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error verifying token:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [allowedRoles, router]);
  
  return { isLoading, isAuthorized };
}

export function withRoleAuth<P extends object>(Component: React.ComponentType<P>, allowedRoles: string[]) {
  return function ProtectedComponent(props: P) {
    const { isLoading, isAuthorized } = useRoleAuth(allowedRoles);
    
    if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    
    if (!isAuthorized) {
      return null; // Router will redirect
    }
    
    return <Component {...props} />;
  };
} 