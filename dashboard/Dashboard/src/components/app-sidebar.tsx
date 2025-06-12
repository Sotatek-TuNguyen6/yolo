// components/sidebar.tsx
import {
  Sidebar as ShadcnSidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LucideIcon, Tag, User } from 'lucide-react';
import {
  Home,
  ChevronRight,
  Package,
  Layers,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Đảm bảo bạn đã tạo file này với hàm cn
import { getUserRole } from '@/app/utils/auth';

interface SidebarItemType {
  title: string;
  url?: string;
  icon?: LucideIcon;
  children?: SidebarItemType[];
  role?: string[];
}

const sidebarItems: SidebarItemType[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    role: ['admin', 'staff'],
  },
  {
    title: 'Product',
    icon: Package,
    role: ['admin'],
    children: [
      {
        title: 'List Product',
        url: '/dashboard/product',
        icon: Package,
        role: ['admin'],
      },
    ],
  },
  {
    title: 'Orders',
    icon: ShoppingCart,
    role: ['admin', 'staff'],
    children: [
      {
        title: 'List Orders',
        url: '/dashboard/orders',
        icon: ShoppingCart,
        role: ['admin', 'staff'],
      },
    ],
  },
  {
    title: 'User',
    icon: User,
    role: ['admin'],
    children: [
      {
        title: 'List User',
        url: '/dashboard/user',
        icon: User,
        role: ['admin'],
      },
    ],
  },
  {
    title: 'Category',
    icon: Layers,
    role: ['admin'],
    children: [
      {
        title: 'List Category',
        url: '/dashboard/category',
        icon: Layers,
        role: ['admin'],
      }
    ],
  },
  {
    title: 'Tags',
    icon: Tag,
    role: ['admin'],
    children: [
      {
        title: 'List Tags',
        url: '/dashboard/tags',
        icon: Tag,
        role: ['admin'],
      },
    ],
  },
];

export const AppSidebar = async () => {
  const userRole = await getUserRole();

  if (!userRole) {
    return <div>Loading...</div>;
  }

  // Filter items based on user role
  const filteredItems = sidebarItems.filter(item => 
    item.role?.includes(userRole)
  );

  return (
    <ShadcnSidebar className="w-60 border-r bg-secondary">
      <SidebarTrigger className="hidden" />
      <SidebarContent className="py-4">
        <p className="px-3 pb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          ADMIN
        </p>
        <SidebarMenu className="space-y-1">
          {filteredItems.map((item, index) =>
            item.children ? (
              <Collapsible key={index}>
                <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  <div className="flex items-center">
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    <span>{item.title}</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-90',
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-4">
                  {item.children
                    .filter(child => !child.role || child.role.includes(userRole))
                    .map((child, childIndex) =>
                      child.children ? (
                        <Collapsible key={childIndex}>
                          <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="flex items-center">
                              {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                              <span>{child.title}</span>
                            </div>
                            <ChevronRight
                              className={cn(
                                'h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-90',
                              )}
                            />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-1 pl-4">
                            {child.children
                              .filter(grandchild => !grandchild.role || grandchild.role.includes(userRole))
                              .map((grandchild, grandchildIndex) => (
                                <Link
                                  key={grandchildIndex}
                                  href={grandchild.url || '#'}
                                  className="block rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  {grandchild.title}
                                </Link>
                              ))}
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <Link
                          key={childIndex}
                          href={child.url || '#'}
                          className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                          <span>{child.title}</span>
                        </Link>
                      ),
                    )}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <Link
                key={index}
                href={item.url || '#'}
                className="group flex items-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              >
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                <span>{item.title}</span>
              </Link>
            ),
          )}
        </SidebarMenu>
      </SidebarContent>
    </ShadcnSidebar>
  );
};
