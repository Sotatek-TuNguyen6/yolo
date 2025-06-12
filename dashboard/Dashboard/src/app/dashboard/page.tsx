'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Main } from '@/components/layout/main';
import { Overview } from './components/overview';
import { RecentSales } from './components/recent-sales';
import { useQueryRequest } from '@/hooks/useQuery';
import { Product } from '@/types/product';
import { CategoryStats } from '@/types/report';
import React from 'react';
import RoleBasedElement from '@/components/role-based-element';

// Define the API response type
interface OrderSummary {
  totalOrders: number;
  totalRevenue: number;
  totalItems: number;
  averageOrderValue: number;
}

interface ProductSummary {
  totalProducts: number;
  totalActiveProducts: number;
  totalInactiveProducts: number;
  totalStock: number;
}

interface ReportResponse {
  data: {
    orderReport: {
      summary: OrderSummary;
    };
    productReport: {
      summary: ProductSummary;
      categoryStats?: CategoryStats;
      topProducts?: Product[];
    };
  };
}

export default function Dashboard() {
  const { data: reports, isLoading: isLoadingReports } = useQueryRequest<ReportResponse>({
    url: '/report',
    queryKey: ['reports'],
  });

  if (isLoadingReports) {
    return <div>Loading...</div>;
  }
  
  // Extract the specific reports from the API response
  const { orderReport, productReport } = reports?.data || { orderReport: { summary: {} as OrderSummary }, productReport: { summary: {} as ProductSummary } };
  const orderSummary = orderReport?.summary || {} as OrderSummary;
  const productSummary = productReport?.summary || {} as ProductSummary;

  return (
    <>
      {/* ===== Main ===== */}
      <Main>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Button>Download Report</Button>
          </div>
        </div>
        <Tabs orientation="vertical" defaultValue="overview" className="space-y-4">
          {/* <div className="w-full overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics" disabled>
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" disabled>
                Reports
              </TabsTrigger>
              <TabsTrigger value="notifications" disabled>
                Notifications
              </TabsTrigger>
            </TabsList>
          </div> */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="text-muted-foreground h-4 w-4"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${orderSummary.totalRevenue?.toFixed(2) || '0.00'}</div>
                  <p className="text-muted-foreground text-xs">
                    {orderSummary.totalOrders || 0} orders total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Order
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="text-muted-foreground h-4 w-4"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${orderSummary.averageOrderValue?.toFixed(2) || '0.00'}</div>
                  <p className="text-muted-foreground text-xs">
                    {orderSummary.totalItems || 0} items sold
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="text-muted-foreground h-4 w-4"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{productSummary.totalProducts || 0}</div>
                  <p className="text-muted-foreground text-xs">
                    {productSummary.totalStock || 0} in stock
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Products
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="text-muted-foreground h-4 w-4"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{productSummary.totalActiveProducts || 0}</div>
                  <p className="text-muted-foreground text-xs">
                    {productSummary.totalInactiveProducts || 0} inactive
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle>Order Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview categoryStats={productReport?.categoryStats} />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>
                    {productReport?.topProducts?.length || 0} products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales topProducts={productReport?.topProducts} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>

      {/* Admin-only content */}
      <RoleBasedElement allowedRoles={['admin']}>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
          <div className="space-y-4">
            <div className="rounded-md bg-yellow-50 p-4">
              <h3 className="font-medium text-yellow-800">System Alerts</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-yellow-700">
                <li>Database backup scheduled for tonight at 2 AM</li>
                <li>3 new user registrations require approval</li>
                <li>System update available</li>
              </ul>
            </div>
          </div>
        </div>
      </RoleBasedElement>

      {/* Manager-only content */}
      <RoleBasedElement allowedRoles={['admin', 'manager']}>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">Sales Overview</h2>
          <div className="space-y-4">
            <div className="rounded-md bg-blue-50 p-4">
              <h3 className="font-medium text-blue-800">Monthly Performance</h3>
              <p className="mt-1 text-sm text-blue-700">
                Sales are up 12% from last month. Top performing category: Electronics.
              </p>
            </div>
          </div>
        </div>
      </RoleBasedElement>

      {/* Staff-only content */}
      <RoleBasedElement allowedRoles={['admin', 'staff']}>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">Inventory Management</h2>
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-4">
              <h3 className="font-medium text-green-800">Stock Alerts</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-green-700">
                <li>5 products are low in stock</li>
                <li>New shipment arriving tomorrow</li>
                <li>3 product categories need restocking</li>
              </ul>
            </div>
          </div>
        </div>
      </RoleBasedElement>
    </>
  );
}
