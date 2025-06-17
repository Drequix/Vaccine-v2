"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Clock, Shield, Building, Info } from "lucide-react"

interface Appointment {
  id_Cita: number
  Fecha: string
  Hora: string
  NombreVacuna: string
  NombreCentro: string
  EstadoCita: string
  NombrePaciente?: string
}

interface AppointmentDetailsModalProps {
  appointment: Appointment | null
  isOpen: boolean
  onClose: () => void
}

export function AppointmentDetailsModal({ appointment, isOpen, onClose }: AppointmentDetailsModalProps) {
  if (!appointment) {
    return null
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida";
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "N/A";
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return "Hora inválida";
    return new Intl.DateTimeFormat("es-ES", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Detalles de la Cita</DialogTitle>
          <DialogDescription>
            Información detallada de la cita de vacunación.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {appointment.NombrePaciente && (
            <div className="flex items-center gap-4">
              <User className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Paciente</p>
                <p className="font-medium">{appointment.NombrePaciente}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-4">
            <Shield className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Vacuna</p>
              <p className="font-medium">{appointment.NombreVacuna}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Calendar className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-medium">{formatDate(appointment.Fecha)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Hora</p>
              <p className="font-medium">{formatTime(appointment.Hora)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Building className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Centro de Vacunación</p>
              <p className="font-medium">{appointment.NombreCentro}</p>
            </div>
          </div>
           <div className="flex items-center gap-4">
            <Info className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <Badge>{appointment.EstadoCita}</Badge>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
