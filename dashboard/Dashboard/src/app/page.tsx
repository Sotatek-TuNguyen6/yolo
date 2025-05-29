import LoginForm from '@/feature/auth/ui/Login';
import React from 'react';
import { isAuthenticated } from './utils/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const isAuth = await isAuthenticated();
  if (isAuth) {
    redirect('/dashboard');
  }
  return <LoginForm />;
}
