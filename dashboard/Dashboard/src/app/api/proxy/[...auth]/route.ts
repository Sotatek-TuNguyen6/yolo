import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export async function GET(req: NextRequest, context: { params: { auth: string[] } }) {
  const { params } = context;
  const awaitedParams = await params;
  const auth = awaitedParams.auth;
  return proxyRequest(req, auth, 'GET');
}

export async function POST(req: NextRequest, context: { params: { auth: string[] } }) {
  const { params } = context;
  const awaitedParams = await params;
  const auth = awaitedParams.auth;
  return proxyRequest(req, auth, 'POST');
}

export async function PUT(req: NextRequest, context: { params: { auth: string[] } }) {
  const { params } = context;
  const awaitedParams = await params;
  const auth = awaitedParams.auth;
  return proxyRequest(req, auth, 'PUT');
}

export async function DELETE(req: NextRequest, context: { params: { auth: string[] } }) {
  const { params } = context;
  const awaitedParams = await params;
  const auth = awaitedParams.auth;
  return proxyRequest(req, auth, 'DELETE');
}

export async function PATCH(req: NextRequest, context: { params: { auth: string[] } }) {
  const { params } = context;
  const awaitedParams = await params;
  const auth = awaitedParams.auth;
  return proxyRequest(req, auth, 'PATCH');
}

async function proxyRequest(req: NextRequest, path: string[], method: string) {
  const token = (await cookies()).get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 });
  }
  const fullUrl = `${API_BASE_URL}/${path.join('/')}`;

  // Kiểm tra Content-Type
  const contentType = req.headers.get('Content-Type') || '';
  const isFormData = contentType.includes('multipart/form-data');

  // Xử lý body request
  let body: string | FormData | undefined;
  if (method !== 'GET') {
    if (isFormData) {
      // Nếu là FormData, chuyển trực tiếp
      body = await req.formData();
    } else {
      // Nếu không phải FormData, xử lý như cũ
      body = await req.text();
    }
  }

  // Chuẩn bị headers
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };

  // Chỉ thêm Content-Type khi không phải FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body,
  });

  const responseData = await res.json();

  // Handle 401 Unauthorized response - clear token cookie
  if (res.status === 401) {
    // Create a response with cleared cookie
    const response = NextResponse.json(
      { error: 'Unauthorized', redirectTo: '/login' },
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );

    // Delete the token cookie
    response.cookies.delete('token');

    return response;
  }

  // Return the entire response structure to preserve pagination and metadata
  return NextResponse.json(responseData, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
