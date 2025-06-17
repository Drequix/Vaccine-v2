"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useApi } from "@/hooks/use-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Users, AlertCircle, User } from "lucide-react"
import Link from "next/link"
import { ChildProfileModal } from "@/components/child-profile-modal"
import { AppointmentDetailsModal } from "@/components/appointment-details-modal"

interface Appointment {
  id_Cita: number
  Fecha: string
  Hora: string
  NombreVacuna: string
  NombreCentro: string
  EstadoCita: string
}

interface Child {
  id_nino: number
  Nombres: string
  Apellidos: string
  FechaNacimiento: string
}

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [allAppointments, setAllAppointments] = useState<Appointment[] | null>(null)
  const [children, setChildren] = useState<Child[] | null>(null)
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [childrenLoading, setChildrenLoading] = useState(true)
  const { request: callApi } = useApi()
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)

  const fetchAppointments = useCallback(async () => {
    if (!token) {
      setAppointmentsLoading(false)
      return
    }
    try {
      setAppointmentsLoading(true)
      let url = "/api/appointments";
      if (user?.role === 'Medico') {
        url = "/api/appointments/medical";
      }
      const data = await callApi(url, { method: "GET" })
      setAllAppointments(data)
    } catch (err) {
      console.error("Failed to fetch appointments:", err)
      setAllAppointments([])
    } finally {
      setAppointmentsLoading(false)
    }
  }, [token, callApi, user?.role])

  const fetchChildren = useCallback(async () => {
    if (!token || user?.role !== "Tutor") {
      setChildrenLoading(false)
      return
    }
    try {
      setChildrenLoading(true)
      const data = await callApi("/api/children/tutor", { method: "GET" })
      setChildren(data)
    } catch (err) {
      console.error("Failed to fetch children:", err)
      setChildren([])
    } finally {
      setChildrenLoading(false)
    }
  }, [token, user?.role, callApi])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    } else if (user) {
      fetchAppointments()
      if (user.role === "Tutor") {
        fetchChildren()
      }
    }
  }, [user, authLoading, router, fetchAppointments, fetchChildren])

  const formatDate = useCallback((date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return "Fecha inválida";
    }
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
}, []);

const formatTime = useCallback((timeStr: string | null) => {
    if (!timeStr) return "N/A";
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return "Hora inválida";
    return new Intl.DateTimeFormat("es-ES", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}, []);

// A robust function to combine date and time for sorting purposes
const combineDateTimeForSort = useCallback((dateStr: string, timeStr: string | null): Date => {
    const date = new Date(dateStr);
    if (timeStr) {
        const time = new Date(timeStr);
        if (!isNaN(time.getTime())) {
            date.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
        }
    }
    return date;
}, []);

  const handleViewProfile = (child: Child) => {
    setSelectedChild(child)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedChild(null)
  }

  const handleViewAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsAppointmentModalOpen(true)
  }

  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false)
    setSelectedAppointment(null)
  }

  const upcomingAppointments = useMemo(() => {
    if (!allAppointments) return []
    return allAppointments
      .filter((appointment) => appointment.EstadoCita !== "Completada" && appointment.EstadoCita !== "Cancelada")
      .sort((a, b) => combineDateTimeForSort(a.Fecha, a.Hora).getTime() - combineDateTimeForSort(b.Fecha, b.Hora).getTime())
      .slice(0, 5)
  }, [allAppointments, combineDateTimeForSort])

  if (authLoading) {
    return (
      <div className="container flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl font-bold">Cargando...</div>
          <p className="text-muted-foreground">Por favor espere mientras cargamos su información</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Router will redirect
  }

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold">Bienvenido, {user.email}</h1>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="appointments">Citas</TabsTrigger>
          {user.role === "Tutor" && <TabsTrigger value="children">Niños</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Próximas Citas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                <p className="text-xs text-muted-foreground">
                  {upcomingAppointments.length === 0
                    ? "No tiene citas programadas"
                    : `Tiene ${upcomingAppointments.length} cita(s) pendiente(s)`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Estado</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Activo</div>
                <p className="text-xs text-muted-foreground">Su cuenta está activa y al día</p>
              </CardContent>
            </Card>

            {user.role === "Tutor" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Niños Registrados</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {childrenLoading ? "..." : children ? children.length : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Niños bajo su tutela</p>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Próximas Citas</CardTitle>
              <CardDescription>Visualice sus próximas citas de vacunación</CardDescription>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-muted-foreground">Cargando citas...</p>
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id_Cita} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <p className="font-medium">{appointment.NombreVacuna}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-4 w-4" />
                          {formatDate(new Date(appointment.Fecha))}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-4 w-4" />
                          {formatTime(appointment.Hora)}
                        </div>
                        <p className="text-sm text-muted-foreground">{appointment.NombreCentro}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {appointment.EstadoCita}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => handleViewAppointmentDetails(appointment)}>
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center space-y-3">
                  <p className="text-muted-foreground">No tiene citas programadas</p>
                  <Button asChild>
                    <Link href="/appointments/new">Agendar Cita</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Todas las Citas</CardTitle>
                <CardDescription>Gestione todas sus citas de vacunación</CardDescription>
              </div>
              <Button asChild>
                <Link href="/appointments/new">Nueva Cita</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="flex h-60 items-center justify-center">
                  <p className="text-muted-foreground">Cargando citas...</p>
                </div>
              ) : allAppointments && allAppointments.length > 0 ? (
                <div className="space-y-4">
                  {allAppointments.map((appointment) => (
                    <div key={appointment.id_Cita} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <p className="font-medium">{appointment.NombreVacuna}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-4 w-4" />
                          {formatDate(new Date(appointment.Fecha))}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-4 w-4" />
                          {formatTime(appointment.Hora)}
                        </div>
                        <p className="text-sm text-muted-foreground">{appointment.NombreCentro}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {appointment.EstadoCita}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => handleViewAppointmentDetails(appointment)}>
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-60 flex-col items-center justify-center space-y-3">
                  <p className="text-muted-foreground">No tiene citas registradas</p>
                  <Button asChild>
                    <Link href="/appointments/new">Agendar Cita</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {user.role === "Tutor" && (
          <TabsContent value="children">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Niños Registrados</CardTitle>
                  <CardDescription>Gestione los niños bajo su tutela</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/children/new">Registrar Niño</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {childrenLoading ? (
                  <div className="flex h-60 items-center justify-center">
                    <p className="text-muted-foreground">Cargando niños...</p>
                  </div>
                ) : children && children.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {children.map((child, index) => (
                      <div key={child.id_nino || index} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <User className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {child.Nombres} {child.Apellidos}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Nacimiento: {formatDate(new Date(child.FechaNacimiento))}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleViewProfile(child)}>
                            Ver Perfil
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-60 flex-col items-center justify-center space-y-3">
                    <p className="text-muted-foreground">No tiene niños registrados</p>
                    <Button asChild>
                      <Link href="/children/new">Registrar Niño</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
          </TabsContent>
        )}
      </Tabs>
      <ChildProfileModal child={selectedChild} isOpen={isModalOpen} onClose={handleCloseModal} />
      <AppointmentDetailsModal appointment={selectedAppointment} isOpen={isAppointmentModalOpen} onClose={handleCloseAppointmentModal} />
    </div>
  )
}
