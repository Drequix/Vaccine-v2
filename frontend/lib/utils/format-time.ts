import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDateString(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'PPP', { locale: es }); // Formato: 17 de jun. de 2025
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Fecha inválida';
  }
}

export function formatTimeString(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'p', { locale: es }); // Formato: 9:38 a. m.
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Hora inválida';
  }
}
