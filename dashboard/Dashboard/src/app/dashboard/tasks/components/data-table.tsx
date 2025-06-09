'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getExpandedRowModel,
  Row,
  FilterFn,
  FilterFnOption,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar, FilterConfig } from './data-table-toolbar';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterConfigs?: FilterConfig[];
  searchColumn?: string;
  searchPlaceholder?: string;
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement;
}

// Custom filter function that handles type conversion between string and number
const fuzzyFilter: FilterFn<unknown> = (row, columnId, filterValue) => {
  const rowValue = row.getValue(columnId);
  
  // If filter value is empty, show all rows
  if (!filterValue || filterValue === '') return true;
  
  // If both are strings or both are numbers, do direct comparison
  if (typeof rowValue === typeof filterValue) {
    // For strings, do case-insensitive includes
    if (typeof rowValue === 'string') {
      return rowValue.toLowerCase().includes(String(filterValue).toLowerCase());
    }
    // For numbers, check equality
    return rowValue === filterValue;
  }
  
  // If rowValue is number and filterValue is string
  if (typeof rowValue === 'number' && typeof filterValue === 'string') {
    // Convert both to strings for comparison
    return String(rowValue).toLowerCase().includes(filterValue.toLowerCase());
  }
  
  // If rowValue is string and filterValue is number
  if (typeof rowValue === 'string' && typeof filterValue === 'number') {
    return rowValue.toLowerCase().includes(String(filterValue).toLowerCase());
  }
  
  return false;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  filterConfigs,
  searchColumn,
  searchPlaceholder,
  renderSubComponent,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [expanded, setExpanded] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      expanded,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    defaultColumn: {
      filterFn: 'fuzzy' as FilterFnOption<TData>,
    },
    enableRowSelection: true,
    enableExpanding: !!renderSubComponent,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        filterConfigs={filterConfigs}
        searchColumn={searchColumn}
        searchPlaceholder={searchPlaceholder}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup, index) => (
              <TableRow key={index}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && renderSubComponent && (
                    <TableRow>
                      <TableCell colSpan={row.getVisibleCells().length} className="p-0">
                        {renderSubComponent({ row })}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Không có kết quả nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
