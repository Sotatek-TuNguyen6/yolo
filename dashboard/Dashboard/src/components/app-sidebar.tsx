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

interface SidebarItemType {
  title: string;
  url?: string;
  icon?: LucideIcon;
  children?: SidebarItemType[];
}

const sidebarItems: SidebarItemType[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Product',
    icon: Package,
    children: [
      {
        title: 'List Product',
        url: '/dashboard/product',
        icon: Package,
      },
    ],
  },
  {
    title: 'Orders',
    icon: ShoppingCart,
    children: [
      {
        title: 'List Orders',
        url: '/dashboard/orders',
        icon: ShoppingCart,
      },
    ],
  },
  {
    title: 'User',
    icon: User,
    children: [
      {
        title: 'List User',
        url: '/dashboard/user',
        icon: User,
      },
    ],
  },
  {
    title: 'Category',
    icon: Layers,
    children: [
      {
        title: 'List Category',
        url: '/dashboard/category',
        icon: Layers,
      }
    ],
  },
  {
    title: 'Tags',
    icon: Tag,
    children: [
      {
        title: 'List Tags',
        url: '/dashboard/tags',
        icon: Tag,
      },
    ],
  },
];

export const AppSidebar = () => {
  return (
    <ShadcnSidebar className="w-60 border-r bg-secondary">
      <SidebarTrigger className="hidden" />
      <SidebarContent className="py-4">
        <p className="px-3 pb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          ADMIN
        </p>
        <SidebarMenu className="space-y-1">
          {sidebarItems.map((item, index) =>
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
                  {item.children.map((child, childIndex) =>
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
                          {child.children.map((grandchild, grandchildIndex) => (
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
