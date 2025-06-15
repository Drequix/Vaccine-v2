import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface VaccinationRecord {
  id_Cita: number;
  NombreVacuna: string;
  FechaVacunacion: string;
  NombreCentroVacunacion: string;
  NombreMedico: string;
  Lote: string;
  Dosis: string;
}

interface HistoryDetailModalProps {
  record: VaccinationRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryDetailModal({ record, isOpen, onClose }: HistoryDetailModalProps) {
  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{record.NombreVacuna}</DialogTitle>
          <DialogDescription>
            Detalles del registro de vacunación
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="font-semibold">Fecha:</p>
            <p>{new Date(record.FechaVacunacion).toLocaleDateString()}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="font-semibold">Centro de Vacunación:</p>
            <p>{record.NombreCentroVacunacion}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="font-semibold">Médico:</p>
            <p>{record.NombreMedico}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="font-semibold">Lote:</p>
            <p>{record.Lote}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="font-semibold">Dosis:</p>
            <p>{record.Dosis}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
