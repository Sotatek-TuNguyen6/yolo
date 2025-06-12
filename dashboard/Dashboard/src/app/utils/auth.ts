import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import { redirect } from 'next/navigation';

interface JwtPayload {
  exp: number;
  role?: string;
  permissions?: string[];
  [key: string]: string | number | boolean | string[] | undefined | null;
}

export async function isAuthenticated() {
  const token = (await cookies()).get('token')?.value;
  return !!token;
}

export async function getUserRole() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return null;
  
  try {
    const decoded: JwtPayload = jwtDecode(token);
    return decoded.role || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

export async function getUserPermissions() {
  const token = (await cookies()).get('token')?.value;
  if (!token) return [];
  
  try {
    const decoded: JwtPayload = jwtDecode(token);
    return decoded.permissions || [];
  } catch (error) {
    console.error('Error decoding token:', error);
    return [];
  }
}

export async function hasRole(requiredRole: string | string[]) {
  const userRole = await getUserRole();
  if (!userRole) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  
  return userRole === requiredRole;
}

export async function hasPermission(requiredPermission: string | string[]) {
  const userPermissions = await getUserPermissions();
  if (!userPermissions.length) return false;
  
  if (Array.isArray(requiredPermission)) {
    return requiredPermission.some(perm => userPermissions.includes(perm));
  }
  
  return userPermissions.includes(requiredPermission);
}

export async function requireRole(requiredRole: string | string[]) {
  const userRole = await getUserRole();
  
  if (!userRole) {
    redirect('/login');
  }
  
  let hasRequiredRole = false;
  
  if (Array.isArray(requiredRole)) {
    hasRequiredRole = requiredRole.includes(userRole);
  } else {
    hasRequiredRole = userRole === requiredRole;
  }
  
  if (!hasRequiredRole) {
    redirect('/unauthorized');
  }
  
  return true;
}