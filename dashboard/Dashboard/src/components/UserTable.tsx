'use client';

import React, { useState } from 'react';
import TableComponent from '@/components/TableComponent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const initialUsers: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'User' },
];

export default function UserPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showDialog, setShowDialog] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<User, 'id'>>({ name: '', email: '', role: '' });

  const openDialog = (index: number | null = null) => {
    if (index !== null) {
      const { name, email, role } = users[index];
      setFormData({ name, email, role });
    } else {
      setFormData({ name: '', email: '', role: '' });
    }
    setEditIndex(index);
    setShowDialog(true);
  };

  const handleSave = () => {
    if (editIndex !== null) {
      const updated = [...users];
      updated[editIndex] = { ...updated[editIndex], ...formData };
      setUsers(updated);
    } else {
      setUsers([...users, { id: Date.now(), ...formData }]);
    }
    setShowDialog(false);
  };

  const handleDelete = (index: number) => {
    const updated = [...users];
    updated.splice(index, 1);
    setUsers(updated);
  };

  const columns = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Role', accessorKey: 'role' },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (_: User, index: number) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openDialog(index)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDelete(index)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => openDialog()}>Add User</Button>
      </div>

      <TableComponent
        data={users}
        columns={columns.map(col => ({
          ...col,
          cell: col.cell ? (row: User) => col.cell!(row, users.indexOf(row)) : undefined,
        }))}
      />

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              placeholder="Email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              placeholder="Role"
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
