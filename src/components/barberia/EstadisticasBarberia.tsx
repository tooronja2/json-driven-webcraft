
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Calendar, XCircle, BarChart } from 'lucide-react';

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

interface ServicioStats {
  nombre: string;
  ingresos: number;
  porcentaje: number;
  cantidad: number;
}

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlh4awkllCTVdxnVQkUWPfs-RVCYXQ9zwn3UpfKaCNiUEOEcTZdx61SVicn5boJf0p/exec';
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

  // Filtros de turnos
  const turnosCompletados = turnos.filter(t => t.Estado === 'Completado');
  
  const turnosHoy = turnosCompletados.filter(t => normalizarFecha(t.Fecha) === hoy);
  
  const turnosMesActual = turnosCompletados.filter(t => {
    const fechaNorm = normalizarFecha(t.Fecha);
    const [año, mes] = fechaNorm.split('-').map(Number);
    return año === añoActual && mes === mesActual;
  });

  const turnosPrimeraQuincena = turnosMesActual.filter(t => {
    const fechaNorm = normalizarFecha(t.Fecha);
    const dia = parseInt(fechaNorm.split('-')[2]);
    return dia <= 15;
  });

  const turnosSegundaQuincena = turnosMesActual.filter(t => {
    const fechaNorm = normalizarFecha(t.Fecha);
    const dia = parseInt(fechaNorm.split('-')[2]);
    return dia > 15;
  });

  const cancelacionesMes = turnos.filter(t => {
    const fechaNorm = normalizarFecha(t.Fecha);
    const [año, mes] = fechaNorm.split('-').map(Number);
    return año === añoActual && mes === mesActual && t.Estado === 'Cancelado';
  });

  // Cálculos de ingresos
  const ingresosDia = turnosHoy.reduce((sum, t) => sum + (t["Valor del turno"] || 0), 0);
  const ingresosPrimeraQuincena = turnosPrimeraQuincena.reduce((sum, t) => sum + (t["Valor del turno"] || 0), 0);
  const ingresosSegundaQuincena = turnosSegundaQuincena.reduce((sum, t) => sum + (t["Valor del turno"] || 0), 0);
  const ingresosMes = turnosMesActual.reduce((sum, t) => sum + (t["Valor del turno"] || 0), 0);

  // Estadísticas por servicio
  const serviciosStats: ServicioStats[] = [];
  const serviciosMap = new Map<string, { ingresos: number; cantidad: number }>();

  turnosMesActual.forEach(turno => {
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
    const porcentaje = ingresosMes > 0 ? (stats.ingresos / ingresosMes) * 100 : 0;
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
      {/* Cards de facturación */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${ingresosDia.toLocaleString()}</div>
            <p className="text-xs text-gray-600">{turnosHoy.length} turnos completados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              1ª Quincena
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${ingresosPrimeraQuincena.toLocaleString()}</div>
            <p className="text-xs text-gray-600">{turnosPrimeraQuincena.length} turnos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              2ª Quincena
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${ingresosSegundaQuincena.toLocaleString()}</div>
            <p className="text-xs text-gray-600">{turnosSegundaQuincena.length} turnos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Mes Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${ingresosMes.toLocaleString()}</div>
            <p className="text-xs text-gray-600">{turnosMesActual.length} turnos completados</p>
          </CardContent>
        </Card>
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
