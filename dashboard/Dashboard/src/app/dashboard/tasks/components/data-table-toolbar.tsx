'use client';

import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';
import { ComponentType } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from './data-table-view-options';
import { DataTableFacetedFilter } from './data-table-faceted-filter';

interface FilterOption {
  label: string;
  value: string | boolean | number;
  icon?: ComponentType<{ className?: string }>;
}

export interface FilterConfig {
  column: string;
  title: string;
  options: FilterOption[];
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterConfigs?: FilterConfig[];
  searchColumn?: string;
  searchPlaceholder?: string;
}

export function DataTableToolbar<TData>({
  table,
  filterConfigs = [],
  searchColumn = 'name',
  searchPlaceholder = 'Filter...',
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={searchPlaceholder}
          value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''}
          onChange={event => {
            const value = event.target.value;
            console.log('value', typeof value);
            // Convert the value for filtering if needed
            // This ensures that even if DB value is a number, string search will work
            table.getColumn(searchColumn)?.setFilterValue(value);
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {filterConfigs.map(config => {
          const column = table.getColumn(config.column);
          if (!column) return null;

          return (
            <DataTableFacetedFilter
              key={config.column}
              column={column}
              title={config.title}
              options={config.options}
            />
          );
        })}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}

export interface Order {
  _id?: string;
  orderId: number;  // This is already defined as a number
  // ...other properties
}
