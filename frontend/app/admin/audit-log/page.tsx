"use client"

import { useState, useEffect } from "react"
import { useApi } from "@/hooks/use-api"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Search, User, Edit, Plus, Trash2, Eye, AlertCircle } from "lucide-react"

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
}

const getActionIcon = (action: string) => {
  switch (action.toUpperCase()) {
    case "CREATE":
      return <Plus className="h-4 w-4 mr-2" />
    case "UPDATE":
      return <Edit className="h-4 w-4 mr-2" />
    case "DELETE":
      return <Trash2 className="h-4 w-4 mr-2" />
    case "VIEW":
      return <Eye className="h-4 w-4 mr-2" />
    case "LOGIN":
      return <User className="h-4 w-4 mr-2" />
    default:
      return <Shield className="h-4 w-4 mr-2" />
  }
}

const getActionVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (action.toUpperCase()) {
    case "CREATE":
      return "default"
    case "UPDATE":
      return "secondary"
    case "DELETE":
      return "destructive"
    default:
      return "outline"
  }
}

export default function AuditLogPage() {
  const { data: logs, loading, error, request: fetchLogs } = useApi<AuditLog[]>()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAction, setSelectedAction] = useState("all")
  const [selectedResource, setSelectedResource] = useState("all")

  useEffect(() => {
    fetchLogs('/api/admin/audit-log')
  }, [fetchLogs])

  const filteredLogs = (logs ?? []).filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm)

    const matchesAction = selectedAction === "all" || log.action.toUpperCase() === selectedAction.toUpperCase()
    const matchesResource = selectedResource === "all" || log.resource.toLowerCase() === selectedResource.toLowerCase()

    return matchesSearch && matchesAction && matchesResource
  })

  const uniqueResources = [...new Set((logs ?? []).map(log => log.resource))]

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Bitácora de Auditoría</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : logs?.length ?? 0}</div>
              <p className="text-xs text-muted-foreground">Registros en la bitácora</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Creaciones</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {loading ? '...' : logs?.filter((log) => log.action.toUpperCase() === "CREATE").length ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">Nuevos registros</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actualizaciones</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '...' : logs?.filter((log) => log.action.toUpperCase() === "UPDATE").length ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">Modificaciones</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eliminaciones</CardTitle>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {loading ? '...' : logs?.filter((log) => log.action.toUpperCase() === "DELETE").length ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">Registros eliminados</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registros de Auditoría</CardTitle>
            <CardDescription>
              Un registro detallado de todas las acciones realizadas en el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuario, detalle o IP..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo de Acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Acciones</SelectItem>
                  <SelectItem value="CREATE">Crear</SelectItem>
                  <SelectItem value="UPDATE">Actualizar</SelectItem>
                  <SelectItem value="DELETE">Eliminar</SelectItem>
                  <SelectItem value="VIEW">Ver</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedResource} onValueChange={setSelectedResource}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo de Recurso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Recursos</SelectItem>
                  {uniqueResources.map(resource => (
                    <SelectItem key={resource} value={resource.toLowerCase()}>{resource}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Detalles</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Dirección IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                          <span className="ml-4">Cargando registros...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {error && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-red-500">
                        <div className="flex flex-col items-center">
                          <AlertCircle className="h-10 w-10 mb-2" />
                          <p className="font-semibold">Error al cargar la bitácora</p>
                          <p className="text-sm">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
                          <p className="text-xs mt-2 text-muted-foreground">Asegúrate de que la API esté funcionando y la tabla 'BitacoraAuditoria' exista en la base de datos.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && !error && filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="font-medium">{log.user}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionVariant(log.action)} className="flex items-center">
                          {getActionIcon(log.action)}
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{log.resource} ({log.resourceId})</div>
                      </TableCell>
                      <TableCell>{log.details}</TableCell>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString('es-ES', {
                          year: 'numeric', month: '2-digit', day: '2-digit',
                          hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.ipAddress}</TableCell>
                    </TableRow>
                  ))}
                  {!loading && !error && filteredLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="font-semibold">No se encontraron registros de auditoría</p>
                          <p className="text-muted-foreground text-sm">Prueba a cambiar los filtros o realiza alguna acción en el sistema para generar nuevos registros.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {!loading && !error && filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No se encontraron registros de auditoría</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
