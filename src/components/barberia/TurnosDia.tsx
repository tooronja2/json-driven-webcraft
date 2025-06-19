
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User } from 'lucide-react';

interface Turno {
  ID_Evento: string;
  Titulo_Evento: string;
  Nombre_Cliente: string;
  Email_Cliente: string;
  Fecha: string;
  "Hora Inicio": string;
  "Hora Fin": string;
  Descripcion: string;
  Estado: string;
  "Valor del turno": number;
  "Servicios incluidos": string;
  Responsable: string;
}

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlh4awkllCTVdxnVQkUWPfs-RVCYXQ9zwn3UpfKaCNiUEOEcTZdx61SVicn5boJf0p/exec';
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

const BARBEROS = ['Héctor Medina', 'Lucas Peralta', 'Camila González'];

const TurnosDia: React.FC = () => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState<string>('todos');
  const [cargando, setCargando] = useState(true);

  const cargarTurnos = async () => {
    try {
      setCargando(true);
      const url = `${GOOGLE_APPS_SCRIPT_URL}?action=getEventos&apiKey=${API_SECRET_KEY}&timestamp=${Date.now()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setTurnos(data.eventos || []);
      } else {
        console.error('Error del servidor:', data.error);
        setTurnos([]);
      }
    } catch (error) {
      console.error('Error cargando turnos:', error);
      setTurnos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTurnos();
  }, []);

  // Filtrar turnos para hoy
  const hoy = new Date().toISOString().split('T')[0];
  const turnosHoy = turnos.filter(turno => {
    const fechaTurno = turno.Fecha;
    
    // Verificar que fechaTurno no sea null, undefined o vacío
    if (!fechaTurno || typeof fechaTurno !== 'string') {
      return false;
    }
    
    let fechaNormalizada = fechaTurno;
    
    // Si incluye 'T', es una fecha ISO completa
    if (fechaTurno.includes('T')) {
      fechaNormalizada = fechaTurno.split('T')[0];
    }
    
    return fechaNormalizada === hoy;
  });

  // Filtrar por barbero si está seleccionado
  const turnosFiltrados = barberoSeleccionado === 'todos' 
    ? turnosHoy 
    : turnosHoy.filter(turno => turno.Responsable === barberoSeleccionado);

  const extraerHora = (horaInput: string | Date): string => {
    if (typeof horaInput === 'string') {
      const horaLimpia = horaInput.trim();
      if (horaLimpia.match(/^\d{1,2}:\d{2}$/)) {
        const [hora, minuto] = horaLimpia.split(':');
        return `${hora.padStart(2, '0')}:${minuto}`;
      }
      if (horaLimpia.includes('T') && horaLimpia.includes('Z')) {
        const fecha = new Date(horaLimpia);
        const horas = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');
        return `${horas}:${minutos}`;
      }
    }
    if (horaInput instanceof Date) {
      const horas = horaInput.getHours().toString().padStart(2, '0');
      const minutos = horaInput.getMinutes().toString().padStart(2, '0');
      return `${horas}:${minutos}`;
    }
    return '';
  };

  if (cargando) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando turnos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Turnos de Hoy
            </CardTitle>
            <Select value={barberoSeleccionado} onValueChange={setBarberoSeleccionado}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por barbero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los barberos</SelectItem>
                {BARBEROS.map(barbero => (
                  <SelectItem key={barbero} value={barbero}>{barbero}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-gray-600">
            Total: {turnosFiltrados.length} turnos
            {barberoSeleccionado !== 'todos' && ` de ${barberoSeleccionado}`}
          </p>
        </CardHeader>
        <CardContent>
          {turnosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay turnos programados para hoy
              {barberoSeleccionado !== 'todos' && ` para ${barberoSeleccionado}`}
            </div>
          ) : (
            <div className="space-y-3">
              {turnosFiltrados
                .sort((a, b) => extraerHora(a["Hora Inicio"]).localeCompare(extraerHora(b["Hora Inicio"])))
                .map(turno => (
                <div 
                  key={turno.ID_Evento} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-mono font-semibold text-blue-600">
                      {extraerHora(turno["Hora Inicio"])}
                    </div>
                    <div>
                      <div className="font-medium">{turno.Nombre_Cliente}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {turno.Responsable}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${turno["Valor del turno"]}</div>
                    <div className="text-sm text-gray-600">{turno["Servicios incluidos"]}</div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      turno.Estado === 'Confirmado' ? 'bg-green-100 text-green-800' :
                      turno.Estado === 'Completado' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {turno.Estado}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TurnosDia;
