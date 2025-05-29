'use client';

import React from 'react';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import CustomInput from '@/components/Input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
// import { useRouter } from 'next/navigation';
import { useMutationRequest } from '@/hooks/useQuery';
import { useRouter } from 'next/navigation';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

const formSchema = z.object({
  email: z.string().email({ message: 'Email is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutationRequest<LoginResponse, FormValues>({
    url: '/api/login',
    method: 'post',
    successMessage: 'Login successful!',
    errorMessage: 'Login failed. Please check your credentials.',
    auth: false,
    mutationOptions: {
      onSuccess: () => {
        router.push('/dashboard');
      },
    },
  });

  async function onSubmit(values: FormValues) {
    loginMutation.mutate(values);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md px-4">
        <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden">
          <CardHeader className="space-y-2 pt-8">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }: { field: ControllerRenderProps<FormValues, 'email'> }) => (
                    <FormItem className="mb-0">
                      <FormControl>
                        <CustomInput
                          label="Email"
                          placeholder="Email"
                          error={form.formState.errors.email?.message}
                          inputClassName="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }: { field: ControllerRenderProps<FormValues, 'password'> }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-2">
                        <div></div>
                      </div>
                      <FormControl>
                        <CustomInput
                          label="Password"
                          type="password"
                          placeholder="******"
                          error={form.formState.errors.password?.message}
                          inputClassName="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          {...field}
                        />
                      </FormControl>
                      <a
                        href="#"
                        className="text-sm text-blue-600 hover:underline flex justify-end"
                      >
                        Forgot password?
                      </a>
                    </FormItem>
                  )}
                />
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all py-6"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <a href="#" className="text-blue-600 hover:underline font-medium">
                Create an account
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
