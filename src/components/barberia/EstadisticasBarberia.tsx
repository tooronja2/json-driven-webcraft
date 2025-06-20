import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Calendar, XCircle, BarChart, CheckCircle, Clock } from 'lucide-react';

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
  origen?: 'web' | 'manual'; // Nuevo campo para distinguir origen
}

interface ServicioStats {
  nombre: string;
  ingresos: number;
  porcentaje: number;
  cantidad: number;
}

// URL ACTUALIZADA de Google Apps Script
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbylrQ6YaI9vPFZH9XhQjdKGFJCgJvHtQqBZABYkm3BSU14yXbMsdpKEf_Fmjl937k8J/exec';
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

const EstadisticasBarberia: React.FC = () => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
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

  // Funciones de filtrado por fecha
  const normalizarFecha = (fecha: any): string => {
    if (typeof fecha === 'object' && fecha instanceof Date) {
      return fecha.toISOString().split('T')[0];
    } else if (typeof fecha === 'string' && fecha.includes('T')) {
      return fecha.split('T')[0];
    }
    return fecha;
  };

  const hoy = new Date().toISOString().split('T')[0];
  const fechaActual = new Date();
  const añoActual = fechaActual.getFullYear();
  const mesActual = fechaActual.getMonth() + 1;

  // Clasificación corregida de turnos
  const turnosReservados = turnos.filter(t => t.Estado === 'Reservado');
  const turnosConfirmados = turnos.filter(t => t.Estado === 'Confirmado');
  const turnosCompletados = turnos.filter(t => t.Estado === 'Completado');
  
  // Filtros por fecha para hoy
  const turnosReservadosHoy = turnosReservados.filter(t => normalizarFecha(t.Fecha) === hoy);
  const turnosConfirmadosHoy = turnosConfirmados.filter(t => normalizarFecha(t.Fecha) === hoy);
  const turnosCompletadosHoy = turnosCompletados.filter(t => normalizarFecha(t.Fecha) === hoy);
  
  // Filtros por mes
  const turnosMesActual = (filtro: Turno[]) => filtro.filter(t => {
    const fechaNorm = normalizarFecha(t.Fecha);
    const [año, mes] = fechaNorm.split('-').map(Number);
    return año === añoActual && mes === mesActual;
  });

  const turnosReservadosMes = turnosMesActual(turnosReservados);
  const turnosConfirmadosMes = turnosMesActual(turnosConfirmados);
  const turnosCompletadosMes = turnosMesActual(turnosCompletados);

  const cancelacionesMes = turnos.filter(t => {
    const fechaNorm = normalizarFecha(t.Fecha);
    const [año, mes] = fechaNorm.split('-').map(Number);
    return año === añoActual && mes === mesActual && t.Estado === 'Cancelado';
  });

  // Cálculos de ingresos
  const calcularIngresos = (listaTurnos: Turno[]) => 
    listaTurnos.reduce((sum, t) => sum + (t["Valor del turno"] || 0), 0);

  const ingresosCompletadosHoy = calcularIngresos(turnosCompletadosHoy);
  const ingresosCompletadosMes = calcularIngresos(turnosCompletadosMes);

  // Estadísticas por servicio (solo turnos completados)
  const serviciosStats: ServicioStats[] = [];
  const serviciosMap = new Map<string, { ingresos: number; cantidad: number }>();

  turnosCompletadosMes.forEach(turno => {
    const servicio = turno["Servicios incluidos"] || 'Sin especificar';
    const valor = turno["Valor del turno"] || 0;
    
    if (!serviciosMap.has(servicio)) {
      serviciosMap.set(servicio, { ingresos: 0, cantidad: 0 });
    }
    
    const stats = serviciosMap.get(servicio)!;
    stats.ingresos += valor;
    stats.cantidad += 1;
  });

  serviciosMap.forEach((stats, nombre) => {
    const porcentaje = ingresosCompletadosMes > 0 ? (stats.ingresos / ingresosCompletadosMes) * 100 : 0;
    serviciosStats.push({
      nombre,
      ingresos: stats.ingresos,
      porcentaje,
      cantidad: stats.cantidad
    });
  });

  serviciosStats.sort((a, b) => b.porcentaje - a.porcentaje);

  if (cargando) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando estadísticas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de estado de turnos para HOY */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Estado de Turnos - Hoy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Turnos Reservados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{turnosReservadosHoy.length}</div>
              <p className="text-xs text-gray-600">Desde formulario web</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Turnos Confirmados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{turnosConfirmadosHoy.length}</div>
              <p className="text-xs text-gray-600">Confirmados por la barbería</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-purple-600" />
                Turnos Completados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{turnosCompletadosHoy.length}</div>
              <p className="text-xs text-gray-600">${ingresosCompletadosHoy.toLocaleString()} facturados</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cards de estado de turnos para EL MES */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Estado de Turnos - Mes Actual</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Reservados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{turnosReservadosMes.length}</div>
              <p className="text-xs text-gray-600">Turnos desde web</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Confirmados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{turnosConfirmadosMes.length}</div>
              <p className="text-xs text-gray-600">Confirmados por la barbería</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Ingresos del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">${ingresosCompletadosMes.toLocaleString()}</div>
              <p className="text-xs text-gray-600">{turnosCompletadosMes.length} turnos completados</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cancelaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Cancelaciones del Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{cancelacionesMes.length}</div>
            <p className="text-sm text-gray-600">Turnos cancelados en {mesActual}/{añoActual}</p>
          </CardContent>
        </Card>

        {/* Rendimiento de servicios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Servicios más Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            {serviciosStats.length === 0 ? (
              <p className="text-gray-500">No hay datos de servicios</p>
            ) : (
              <div className="space-y-3">
                {serviciosStats.map((servicio, index) => (
                  <div key={servicio.nombre} className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{servicio.nombre}</div>
                      <div className="text-xs text-gray-600">{servicio.cantidad} servicios</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${servicio.ingresos.toLocaleString()}</div>
                      <div className="text-sm text-blue-600">{servicio.porcentaje.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EstadisticasBarberia;
