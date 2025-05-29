import { cookies } from 'next/headers';

export async function isAuthenticated() {
  const token = (await cookies()).get('token')?.value;
  return !!token;
}