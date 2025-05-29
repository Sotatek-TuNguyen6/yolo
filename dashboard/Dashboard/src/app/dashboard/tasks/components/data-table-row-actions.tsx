'use client';

import { Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReactNode } from 'react';

interface ActionItem<TData> {
  label: string;
  onClick: (row: TData) => void;
  shortcut?: string;
  icon?: ReactNode;
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  actions?: ActionItem<TData>[];
}

export function DataTableRowActions<TData>({
  row,
  actions = [
    {
      label: 'Chỉnh sửa',
      onClick: row => console.log('Edit', row),
    },
    {
      label: 'Xóa',
      onClick: row => console.log('Delete', row),
      shortcut: '⌘⌫',
    },
  ],
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <MoreHorizontal />
          <span className="sr-only">Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {actions.map((action, index) => (
          <DropdownMenuItem key={index} onClick={() => action.onClick(row.original)}>
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
            {action.shortcut && <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
