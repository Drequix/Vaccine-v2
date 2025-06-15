"use client";

import { useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

// Define an interface for the child data structure
interface Child {
  id_Nino: number;
  Nombres: string;
  Apellidos: string;
  CodigoActivacion: string;
}

export default function ChildrenListPage() {
  const { user } = useAuth();
  const { data: children, loading, error, request: fetchChildren } = useApi<Child[]>();

  useEffect(() => {
    if (user?.id) {
      fetchChildren(`/api/tutors/${user.id}/children`);
    }
  }, [fetchChildren, user]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Mis Niños</h1>
        <Button asChild>
          <Link href="/children/register">Registrar Nuevo Niño</Link>
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-lg">Cargando niños...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los niños. Por favor, inténtalo de nuevo más tarde.
          </AlertDescription>
        </Alert>
      )}

      {!loading && !error && children && (
        <>
          {children.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <Card key={child.id_Nino}>
                  <CardHeader>
                    <CardTitle>{`${child.Nombres} ${child.Apellidos}`}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Código de Activación</p>
                      <p className="text-lg font-mono bg-gray-100 p-2 rounded-md text-center tracking-wider">{child.CodigoActivacion}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h2 className="text-xl font-semibold">No Tienes Niños Registrados</h2>
                <p className="text-gray-500 mt-2">Haz clic en el botón de arriba para registrar a tu primer niño.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

