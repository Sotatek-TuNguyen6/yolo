'use client';

import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface JwtPayload {
  exp: number;
  role?: string;
  permissions?: string[];
  [key: string]: string | number | string[] | undefined | null | boolean;
}

export function useAuth() {
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    
    if (!token) {
      setIsLoading(false);
      return;
    }
    
    try {
      const decoded: JwtPayload = jwtDecode(token);
      
      // Check if token is expired
      const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();
      if (isExpired) {
        setIsLoading(false);
        return;
      }
      
      setRole(decoded.role || null);
      setPermissions(decoded.permissions || []);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error decoding token:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasRole = (requiredRole: string | string[]) => {
    if (!role) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    
    return role === requiredRole;
  };

  const hasPermission = (requiredPermission: string | string[]) => {
    if (!permissions.length) return false;
    
    if (Array.isArray(requiredPermission)) {
      return requiredPermission.some(perm => permissions.includes(perm));
    }
    
    return permissions.includes(requiredPermission);
  };

  return {
    role,
    permissions,
    isAuthenticated,
    isLoading,
    hasRole,
    hasPermission
  };
} 