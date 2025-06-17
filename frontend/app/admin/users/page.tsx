"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddAdminUserForm } from "@/components/admin/add-admin-user-form"
import { useApi } from "@/hooks/use-api"

interface User {
  ID: number;
  EMAIL: string;
  ROLE: string;
  STATUS: string;
}

export default function UsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { data: users, loading: isLoading, error, request: fetchUsers } = useApi<User[]>()

    useEffect(() => {
    fetchUsers("/api/users")
  }, [fetchUsers])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Completa los detalles para agregar un nuevo usuario al sistema. Este formulario utiliza el nuevo flujo de creación segura.
              </DialogDescription>
            </DialogHeader>
            <AddAdminUserForm onSuccess={() => {
                setIsDialogOpen(false);
                fetchUsers("/api/users");
              }} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p>Loading users...</p>}
      {error && <p className="text-red-500">Failed to load users: {error}</p>}

      {users && (
        <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
              </tr>
            </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-900 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.ID}>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{user.ID}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{user.EMAIL}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{user.ROLE}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{user.STATUS}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
