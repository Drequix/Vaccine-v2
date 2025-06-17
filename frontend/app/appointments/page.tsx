"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useApi } from "@/hooks/use-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { AppointmentDetailsModal } from "@/components/appointment-details-modal"

interface Appointment {
  id_Cita: number
  Fecha: string
  Hora: string
  NombreVacuna: string
  NombreCentro: string
  EstadoCita: string
}

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [allAppointments, setAllAppointments] = useState<Appointment[] | null>(null)
  const { request: callApi, loading: appointmentsLoading } = useApi()
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchAppointments = useCallback(async () => {
    if (!user) return
    try {
      const data = await callApi("/api/appointments", { method: "GET" })
      setAllAppointments(data)
    } catch (err) {
      console.error("Failed to fetch appointments:", err)
      setAllAppointments([])
    }
  }, [user, callApi])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    } else if (user) {
      fetchAppointments()
    }
  }, [user, authLoading, router, fetchAppointments])

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

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAppointment(null)
  }

  if (authLoading || !user) {
    return (
      <div className="container flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl font-bold">Cargando...</div>
          <p className="text-muted-foreground">Por favor espere mientras cargamos su información</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold">Gestión de Citas</CardTitle>
            <CardDescription>Consulte y gestione todas sus citas de vacunación.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/appointments/new">Agendar Nueva Cita</Link>
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
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(appointment)}>
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-60 flex-col items-center justify-center space-y-3">
              <p className="text-muted-foreground">No tiene citas registradas.</p>
              <Button asChild>
                <Link href="/appointments/new">Agende su primera cita</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <AppointmentDetailsModal appointment={selectedAppointment} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  )
}
