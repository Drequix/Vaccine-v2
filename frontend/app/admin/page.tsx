"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { useState, useEffect } from "react"
import { useApi } from "@/hooks/use-api"
import { Users, Calendar, AlertTriangle, TrendingUp, Syringe, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

const mockAlerts = [
  {
    id: 1,
    type: "warning",
    message: "12 pacientes con esquemas de vacunación incompletos",
    priority: "high",
  },
  {
    id: 2,
    type: "info",
    message: "45 dosis programadas para los próximos 7 días",
    priority: "medium",
  },
  {
    id: 3,
    type: "success",
    message: "Meta mensual de vacunación alcanzada al 89%",
    priority: "low",
  },
]

const mockUpcomingAppointments = [
  {
    id: 1,
    patient: "María González",
    vaccine: "COVID-19 (2da dosis)",
    time: "09:30",
    center: "Centro Norte",
  },
  {
    id: 2,
    patient: "Carlos Rodríguez",
    vaccine: "Influenza",
    time: "10:15",
    center: "Centro Sur",
  },
  {
    id: 3,
    patient: "Ana Martínez",
    vaccine: "Hepatitis B (1ra dosis)",
    time: "11:00",
    center: "Centro Norte",
  },
]

interface DashboardStats {
  TotalPacientes: number;
  CitasHoy: number;
  TotalVacunaciones: number;
  AlertasPendientes: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data: stats, loading, error, request: fetchStats } = useApi<DashboardStats>();

  useEffect(() => {
    const controller = new AbortController();
    fetchStats('/api/admin/dashboard-stats', { signal: controller.signal });

    return () => {
      controller.abort();
    };
  }, [fetchStats]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido, {user?.email}. Aquí tienes un resumen de la actividad del sistema.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold">Cargando...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.TotalPacientes?.toLocaleString() ?? 'N/A'}</div>
                  <p className="text-xs text-muted-foreground">Total de tutores y niños registrados</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold">Cargando...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.CitasHoy ?? 'N/A'}</div>
                  <p className="text-xs text-muted-foreground">Citas programadas para hoy</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vacunaciones</CardTitle>
              <Syringe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold">Cargando...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.TotalVacunaciones?.toLocaleString() ?? 'N/A'}</div>
                  <p className="text-xs text-muted-foreground">Total de dosis aplicadas</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-2xl font-bold">Cargando...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.AlertasPendientes ?? 'N/A'}</div>
                  <p className="text-xs text-muted-foreground">Alertas que requieren atención</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Alerts Section */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas y Notificaciones
              </CardTitle>
              <CardDescription>Información importante que requiere tu atención</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex items-start gap-3">
                    {alert.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                    {alert.type === "info" && <Clock className="h-4 w-4 text-blue-500 mt-0.5" />}
                    {alert.type === "success" && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium">{alert.message}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      alert.priority === "high" ? "destructive" : alert.priority === "medium" ? "default" : "secondary"
                    }
                  >
                    {alert.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximas Citas
              </CardTitle>
              <CardDescription>Citas programadas para hoy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockUpcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{appointment.patient}</p>
                    <p className="text-xs text-muted-foreground">{appointment.vaccine}</p>
                    <p className="text-xs text-muted-foreground">{appointment.center}</p>
                  </div>
                  <Badge variant="outline">{appointment.time}</Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Ver todas las citas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Accede rápidamente a las funciones más utilizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button asChild className="h-20 flex-col gap-2">
                <Link href="/admin/users">
                  <Users className="h-6 w-6" />
                  Gestionar Usuarios
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href="/admin/audit-log">
                  <Syringe className="h-6 w-6" />
                  Ver Auditoría
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href="/appointments/new">
                  <Calendar className="h-6 w-6" />
                  Agendar Cita
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col gap-2">
                <Link href="/reports">
                  <TrendingUp className="h-6 w-6" />
                  Ver Reportes
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
