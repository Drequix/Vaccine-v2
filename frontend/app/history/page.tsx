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
  id_Cita: number;
  NombreVacuna: string;
  FechaVacunacion: string;
  NombreCentroVacunacion: string;
  NombreMedico: string;
  Lote: string;
  Dosis: string;
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
    fetchHistory(`/history/vaccinations?personType=${personType}&personId=${personId}`);
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

      {history.length > 0 && (
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
                  {history.map((record) => (
                    <TableRow key={record.id_Cita} onClick={() => handleRowClick(record)} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>{record.NombreVacuna}</TableCell>
                      <TableCell>{new Date(record.FechaVacunacion).toLocaleDateString()}</TableCell>
                      <TableCell>{record.NombreCentroVacunacion}</TableCell>
                    </TableRow>
                  ))}
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
