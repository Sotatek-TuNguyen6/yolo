import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import { redirect } from 'next/navigation';

interface JwtPayload {
  exp: number;
  role?: string;
  [key: string]: string | number | string[] | undefined | null | boolean;
}

interface RoleProtectedLayoutProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default async function RoleProtectedLayout({ 
  children, 
  allowedRoles 
}: RoleProtectedLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const decoded: JwtPayload = jwtDecode(token);
    const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();

    if (isExpired) {
      redirect('/login');
    }

    // Check if user has allowed role
    const userRole = decoded.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      redirect('/unauthorized');
    }
  } catch (error) {
    console.error('Invalid token:', error);
    redirect('/login');
  }

  return <>{children}</>;
} 