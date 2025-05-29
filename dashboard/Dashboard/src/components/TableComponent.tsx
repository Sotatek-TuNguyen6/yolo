'use client';

import React, { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TableComponentProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey: keyof T | string;
    cell?: (row: T) => ReactNode;
  }[];
  caption?: string;
}

export function TableComponent<T extends object>({
  data,
  columns,
  caption,
}: TableComponentProps<T>) {
  return (
    <Table>
      {caption && <TableCaption>{caption}</TableCaption>}
      <TableHeader>
        <TableRow>
          {columns.map(column => (
            <TableHead key={String(column.accessorKey)}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map(column => (
              <TableCell key={`${rowIndex}-${String(column.accessorKey)}`}>
                {column.cell
                  ? column.cell(row)
                  : column.accessorKey in row
                    ? String(row[column.accessorKey as keyof T])
                    : ''}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Example usage:
/*
// Sample data
const invoices = [
  {
    id: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    id: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    id: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
];

// Sample columns
const columns = [
  {
    header: "Invoice",
    accessorKey: "id",
  },
  {
    header: "Status",
    accessorKey: "paymentStatus",
    cell: (row) => (
      <div className={`font-medium ${
        row.paymentStatus === "Paid" ? "text-green-500" : 
        row.paymentStatus === "Pending" ? "text-yellow-500" : "text-red-500"
      }`}>
        {row.paymentStatus}
      </div>
    ),
  },
  {
    header: "Amount",
    accessorKey: "totalAmount",
  },
  {
    header: "Payment Method",
    accessorKey: "paymentMethod",
  },
];

// Usage
<TableComponent 
  data={invoices} 
  columns={columns} 
  caption="A list of your recent invoices."
/>
*/

export default TableComponent;
