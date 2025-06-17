'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import HistoryDetailModal from '@/components/history/HistoryDetailModal'
import '../print.css'

interface Person {
  PersonId: number;
  Name: string;
  Type: 'Tutor' | 'Nino';
}

interface VaccinationRecord {
  id_Historico: number;
  id_Nino: number;
  FechaAplicacion: string;
  DosisAplicada: string;
  EdadAlMomento: string;
  VacunaNombre: string;
  FabricanteNombre: string;
  LoteNumero: string;
  PersonalSaludNombre: string;
  NotasAdicionales: string;
}

export default function HistoryPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [history, setHistory] = useState<VaccinationRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<VaccinationRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: peopleData, loading: peopleLoading, error: peopleError, request: fetchPeople } = useApi<Person[]>();
  const { data: historyData, loading: historyLoading, error: historyError, request: fetchHistory } = useApi<VaccinationRecord[]>();

  useEffect(() => {
    fetchPeople('/api/history/people');
  }, [fetchPeople]);

  useEffect(() => {
    if (peopleData) {
      setPeople(peopleData);
    }
  }, [peopleData]);

  useEffect(() => {
    if (historyData) {
      setHistory(historyData);
    }
  }, [historyData]);

  const handleShowHistory = () => {
    if (!selectedPerson) return;

    const [personType, personId] = selectedPerson.split('-');
    fetchHistory(`/api/history/vaccinations?personType=${personType}&personId=${personId}`);
  };

  const handleRowClick = (record: VaccinationRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const getSelectedPersonName = () => {
    if (!selectedPerson) return '';
    const person = people.find(p => `${p.Type}-${p.PersonId}` === selectedPerson);
    return person ? person.Name : '';
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="no-print">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Historial de Vacunación</CardTitle>
            <CardDescription>
              Selecciona una persona para ver su historial de vacunación completo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Select onValueChange={setSelectedPerson} value={selectedPerson}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Selecciona una persona..." />
                </SelectTrigger>
                <SelectContent>
                  {peopleLoading && <SelectItem value="loading" disabled>Cargando...</SelectItem>}
                  {peopleError && <SelectItem value="error" disabled>Error al cargar</SelectItem>}
                  {people.map((person) => (
                    <SelectItem key={`${person.Type}-${person.PersonId}`} value={`${person.Type}-${person.PersonId}`}>
                      {person.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleShowHistory} disabled={!selectedPerson || historyLoading}>
                {historyLoading ? 'Cargando...' : 'Mostrar Histórico'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedPerson && (
        <div className="printable-area mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                              <h2 className="text-xl font-bold">Historial de: {selectedPerson ? people.find(p => `${p.Type}-${p.PersonId}` === selectedPerson)?.Name : ''}</h2>
                <Button onClick={handlePrint} className="no-print">Imprimir Historial</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vacuna</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Centro de Vacunación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        Cargando historial...
                      </TableCell>
                    </TableRow>
                  ) : history.length > 0 ? (
                    history.map((record) => (
                      <TableRow key={record.id_Historico} onClick={() => handleRowClick(record)} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>{record.VacunaNombre}</TableCell>
                        <TableCell>{formatDate(record.FechaAplicacion)}</TableCell>
                        <TableCell>{record.PersonalSaludNombre || 'No disponible'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No se encontraron registros para esta persona.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      <HistoryDetailModal record={selectedRecord} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  )
}
