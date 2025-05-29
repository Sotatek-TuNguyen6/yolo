import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Call server logout API
    // await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // });

    // Delete the token cookie
    (await cookies()).delete('token');
    
    // Create response with redirect
    const response = NextResponse.json(
      { message: 'Đăng xuất thành công' }, 
      { status: 200 }
    );
    
    // Set cookie to expire
    response.cookies.set('token', '', { 
      expires: new Date(0),
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    // Still delete the cookie even if server logout fails
    (await cookies()).delete('token');
    
    // Create response even if there's an error
    const response = NextResponse.json(
      { message: 'Đăng xuất thành công' },
      { status: 200 }
    );
    
    // Set cookie to expire
    response.cookies.set('token', '', { 
      expires: new Date(0),
      path: '/',
    });
    
    return response;
  }
}
