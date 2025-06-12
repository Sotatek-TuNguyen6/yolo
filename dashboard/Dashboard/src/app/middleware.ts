import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  role?: string;
  [key: string]: string | number | string[] | undefined | null | boolean;
}

// Define routes that require specific roles
const protectedRoutes = [
  {
    path: '/dashboard/admin',
    roles: ['admin'],
  },
  {
    path: '/dashboard/product',
    roles: ['admin', 'staff'],
  },
  {
    path: '/dashboard/user',
    roles: ['admin'],
  },
  {
    path: '/dashboard/orders',
    roles: ['admin', 'manager'],
  },
  {
    path: '/dashboard/category',
    roles: ['admin'],
  },
  {
    path: '/dashboard/tags',
    roles: ['admin'],
  },
  // Add more protected routes as needed
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for non-dashboard routes and API routes
  if (!pathname.startsWith('/dashboard') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Check if the current path is protected
  const matchedRoute = protectedRoutes.find(route => 
    pathname === route.path || pathname.startsWith(`${route.path}/`)
  );
  
  if (!matchedRoute) {
    return NextResponse.next();
  }
  
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    const decoded: JwtPayload = jwtDecode(token);
    
    // Check if token is expired
    const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();
    if (isExpired) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Check if user has required role
    const userRole = decoded.role;
    if (!userRole || !matchedRoute.roles.includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
}; 