
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCheck, ChevronsUpDown, UserRoundCheck, UserRoundX } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import AgregarTurno from './AgregarTurno';

interface Turno {
  id: string;
  nombre: string;
  email: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  servicio: string;
  valor: number;
  responsable: string;
  estado: string;
  origen: string;
  descripcion?: string;
}

interface TurnosDiaProps {
  permisos: string[];
  usuario: string;
}

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlh4awkllCTVdxnVQkUWPfs-RVCYXQ9zwn3UpfKaCNiUEOEcTZdx61SVicn5boJf0p/exec';
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

const TurnosDia: React.FC<TurnosDiaProps> = ({ permisos, usuario }) => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [mostrarAgregarTurno, setMostrarAgregarTurno] = useState(false);

  const obtenerTurnos = async () => {
    setCargando(true);
    setError('');
    try {
      const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getEventos&apiKey=${API_SECRET_KEY}&timestamp=${Date.now()}`);
      const data = await response.json();

      if (data.success) {
        // Convertir los datos de Google Sheets al formato que esperamos
        const turnosConvertidos = data.eventos.map((evento: any) => {
          // Convertir las fechas de Google Sheets
          const fechaEvento = new Date(evento.Fecha);
          const horaInicio = new Date(evento['Hora Inicio']);
          const horaFin = new Date(evento['Hora Fin']);
          
          return {
            id: evento.ID_Evento,
            nombre: evento.Nombre_Cliente,
            email: evento.Email_Cliente,
            fecha: fechaEvento.toISOString().split('T')[0], // formato YYYY-MM-DD
            horaInicio: horaInicio.toTimeString().slice(0, 5), // formato HH:MM
            horaFin: horaFin.toTimeString().slice(0, 5), // formato HH:MM
            servicio: evento.Titulo_Evento || evento['Servicios incluidos'],
            valor: evento['Valor del turno'] || 0,
            responsable: evento.Responsable,
            estado: evento.Estado,
            origen: evento.Estado === 'Completado' && evento.Nombre_Cliente === 'Atención directa en local' ? 'manual' : 'reserva',
            descripcion: evento.Descripcion
          };
        });

        // Filtrar por la fecha seleccionada
        const fechaSeleccionada = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
        const turnosFiltrados = turnosConvertidos.filter((turno: Turno) => turno.fecha === fechaSeleccionada);
        
        setTurnos(turnosFiltrados);
      } else {
        setError(data.error || 'Error al cargar los turnos');
      }
    } catch (e) {
      console.error("Error al obtener los turnos:", e);
      setError('Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const actualizarEstadoTurno = async (turnoId: string, nuevoEstado: string) => {
    try {
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: turnoId,
          estado: nuevoEstado,
          apiKey: API_SECRET_KEY
        })
      });

      const result = await response.json();

      if (result.success) {
        // Actualizar el estado localmente
        setTurnos(prevTurnos =>
          prevTurnos.map(turno =>
            turno.id === turnoId ? { ...turno, estado: nuevoEstado } : turno
          )
        );
      } else {
        setError(result.error || 'Error al actualizar el estado del turno');
      }
    } catch (error) {
      console.error('Error al actualizar el estado del turno:', error);
      setError('Error de conexión al actualizar el turno.');
    }
  };

  const calcularEstadisticas = () => {
    const turnosHoy = turnos.filter(turno => {
      const fechaTurno = new Date(turno.fecha);
      const fechaHoy = new Date();
      
      // Normalizar fechas para comparación
      fechaTurno.setHours(0, 0, 0, 0);
      fechaHoy.setHours(0, 0, 0, 0);
      
      return fechaTurno.getTime() === fechaHoy.getTime();
    });

    // Nuevas categorías según tu solicitud
    const reservados = turnosHoy.filter(t => t.estado === 'Confirmado' && t.origen === 'reserva').length;
    const completadosConReserva = turnosHoy.filter(t => t.estado === 'Completado' && t.origen === 'reserva').length;
    const completadosSinReserva = turnosHoy.filter(t => t.estado === 'Completado' && t.origen === 'manual').length;
    const cancelados = turnosHoy.filter(t => t.estado === 'Cancelado').length;

    const totalIngresosDia = turnosHoy
      .filter(t => t.estado === 'Completado')
      .reduce((sum, t) => sum + (t.valor || 0), 0);

    return {
      totalTurnos: turnosHoy.length,
      reservados,
      completadosConReserva,
      completadosSinReserva,
      cancelados,
      ingresosDia: totalIngresosDia
    };
  };

  const renderEstadisticasAdmin = () => {
    const stats = calcularEstadisticas();

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Turnos Reservados</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.reservados}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Completados con Reserva</h3>
          <p className="text-2xl font-bold text-green-600">{stats.completadosConReserva}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Completados sin Reserva</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.completadosSinReserva}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800">Turnos Cancelados</h3>
          <p className="text-2xl font-bold text-red-600">{stats.cancelados}</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Total Turnos Hoy</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.totalTurnos}</p>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="font-semibold text-indigo-800">Ingresos del Día</h3>
          <p className="text-2xl font-bold text-indigo-600">${stats.ingresosDia.toLocaleString()}</p>
        </div>
      </div>
    );
  };

  useEffect(() => {
    obtenerTurnos();
  }, [date]);

  if (cargando) {
    return <div className="text-center">Cargando turnos...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {permisos.includes('admin') && renderEstadisticasAdmin()}
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Turnos del Día</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={format(date || new Date(), 'PPP', { locale: es }) ? "justify-start text-left font-normal" : "justify-start text-left font-normal text-muted-foreground"}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              locale={es}
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Servicio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Responsable
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {turnos.map((turno) => (
              <tr key={turno.id}>
                <td className="px-6 py-4 whitespace-nowrap">{turno.horaInicio} - {turno.horaFin}</td>
                <td className="px-6 py-4 whitespace-nowrap">{turno.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap">{turno.servicio}</td>
                <td className="px-6 py-4 whitespace-nowrap">{turno.responsable}</td>
                <td className="px-6 py-4 whitespace-nowrap">{turno.estado}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {turno.estado === 'Confirmado' && (
                    <Button
                      onClick={() => actualizarEstadoTurno(turno.id, 'Completado')}
                      size="icon"
                      variant="ghost"
                    >
                      <UserRoundCheck className="h-5 w-5" />
                    </Button>
                  )}
                  {turno.estado === 'Confirmado' && (
                    <Button
                      onClick={() => actualizarEstadoTurno(turno.id, 'Cancelado')}
                      size="icon"
                      variant="ghost"
                    >
                      <UserRoundX className="h-5 w-5 text-red-500" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mostrarAgregarTurno && (
        <AgregarTurno
          onClose={() => setMostrarAgregarTurno(false)}
          onTurnoAgregado={() => {
            obtenerTurnos();
            setMostrarAgregarTurno(false);
          }}
        />
      )}
      <Button onClick={() => setMostrarAgregarTurno(true)}>Agregar Turno</Button>
    </div>
  );
};

export default TurnosDia;
