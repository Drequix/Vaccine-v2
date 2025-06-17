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
import { User, Calendar, Shield } from "lucide-react"

interface Child {
  id_nino: number
  Nombres: string
  Apellidos: string
  FechaNacimiento: string
}

interface ChildProfileModalProps {
  child: Child | null
  isOpen: boolean
  onClose: () => void
}

export function ChildProfileModal({ child, isOpen, onClose }: ChildProfileModalProps) {
  if (!child) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Perfil del Niño</DialogTitle>
          <DialogDescription>
            Información detallada del niño.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <User className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Nombre Completo</p>
              <p className="font-medium">{child.Nombres} {child.Apellidos}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Calendar className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
              <p className="font-medium">{formatDate(child.FechaNacimiento)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Shield className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Próxima Vacuna</p>
              <p className="font-medium">BCG (Próximamente)</p>
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
