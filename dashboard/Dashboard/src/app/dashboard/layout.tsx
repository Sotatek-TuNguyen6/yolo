import { ReactNode } from 'react';
import { isAuthenticated } from '../utils/auth';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import Header from '@/components/header';
import { redirect } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    redirect('/login');
  }
  

  return (
    <SidebarProvider>
      {/* Sidebar */}
      <AppSidebar />
      <div className="my-4">
        <SidebarTrigger />
      </div>
      {/*(header + main) */}
      <div className="flex-1 flex flex-col w-full min-h-screen">
        <Header />

        {/* Main content */}
        <div className="flex flex-col p-6 gap-20">
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
