import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface VaccinationRecord {
  id_Historico: number;
  VacunaNombre: string;
  FechaAplicacion: string;
  DosisAplicada: string;
  LoteNumero: string;
  PersonalSaludNombre: string;
  FabricanteNombre: string;
  EdadAlMomento: string;
  NotasAdicionales: string;
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
          <DialogTitle>{record.VacunaNombre}</DialogTitle>
          <DialogDescription>
            Detalles del registro de vacunación
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="font-semibold">Fecha:</p>
            <p>{new Date(record.FechaAplicacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="font-semibold">Dosis:</p>
            <p>{record.DosisAplicada}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="font-semibold">Edad en ese momento:</p>
            <p>{record.EdadAlMomento || 'No disponible'}</p>
          </div>
           <div className="grid grid-cols-2 items-center gap-4">
            <p className="font-semibold">Personal de Salud:</p>
            <p>{record.PersonalSaludNombre || 'No disponible'}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="font-semibold">Fabricante:</p>
            <p>{record.FabricanteNombre || 'No disponible'}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="font-semibold">Lote:</p>
            <p>{record.LoteNumero || 'No disponible'}</p>
          </div>
           <div className="grid grid-cols-2 items-center gap-4">
            <p className="font-semibold">Notas Adicionales:</p>
            <p>{record.NotasAdicionales || 'Ninguna'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
