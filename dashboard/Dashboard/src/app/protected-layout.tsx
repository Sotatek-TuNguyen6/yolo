import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import { redirect } from 'next/navigation';

interface JwtPayload {
  exp: number;
  role?: string;
  [key: string]: string | number | undefined;
}

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
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
  } catch (error) {
    console.error('Invalid token:', error);
    redirect('/login');
  }

  return <>{children}</>;
}
