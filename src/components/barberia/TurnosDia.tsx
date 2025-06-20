
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AgregarTurnoMejorado from './AgregarTurnoMejorado';
import { useToast } from '@/hooks/use-toast';

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

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxa8EBhJ0Bjx1amjc7NzOXJWSMe88ExERPFuRqo5iz_OjWS0w9jMDjsN_7us0FKC9o2/exec';
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

const TurnosDia: React.FC<TurnosDiaProps> = ({ permisos, usuario }) => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [mostrarAgregarTurno, setMostrarAgregarTurno] = useState(false);
  const { toast } = useToast();

  const realizarFetchConReintentos = async (url: string, options?: RequestInit, maxReintentos = 3) => {
    let ultimoError;
    
    for (let intento = 1; intento <= maxReintentos; intento++) {
      try {
        console.log(`🔄 Intento ${intento} de ${maxReintentos} para fetch`);
        console.log('🔗 URL:', url);
        console.log('⚙️ Options:', options);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        ultimoError = error;
        console.error(`❌ Error en intento ${intento}:`, error);
        
        if (intento < maxReintentos) {
          const delay = intento * 1000;
          console.log(`⏳ Reintentando en ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw ultimoError;
  };

  const obtenerTurnos = async () => {
    setCargando(true);
    setError('');
    try {
      console.log('🔄 Iniciando obtención de turnos...');
      const response = await realizarFetchConReintentos(
        `${GOOGLE_APPS_SCRIPT_URL}?action=getEventos&apiKey=${API_SECRET_KEY}&timestamp=${Date.now()}`
      );
      
      const data = await response.json();
      console.log('📄 Datos recibidos:', data);

      if (data.success) {
        const turnosConvertidos = data.eventos.map((evento: any) => {
          let fechaEvento, horaInicio, horaFin;
          
          try {
            if (typeof evento.Fecha === 'string' && evento.Fecha.includes('T')) {
              fechaEvento = new Date(evento.Fecha);
            } else {
              fechaEvento = new Date(evento.Fecha);
            }

            if (typeof evento['Hora Inicio'] === 'string' && evento['Hora Inicio'].includes('T')) {
              horaInicio = new Date(evento['Hora Inicio']);
            } else {
              horaInicio = new Date(evento['Hora Inicio']);
            }

            if (typeof evento['Hora Fin'] === 'string' && evento['Hora Fin'].includes('T')) {
              horaFin = new Date(evento['Hora Fin']);
            } else {
              horaFin = new Date(evento['Hora Fin']);
            }
          } catch (e) {
            console.error('Error parsing dates for event:', evento, e);
            fechaEvento = new Date();
            horaInicio = new Date();
            horaFin = new Date();
          }
          
          let estadoMapeado = evento.Estado;
          let origenMapeado = 'reserva';
          
          if (evento.origen_panel) {
            origenMapeado = 'manual';
          }
          
          return {
            id: evento.ID_Evento,
            nombre: evento.Nombre_Cliente,
            email: evento.Email_Cliente,
            fecha: fechaEvento.toISOString().split('T')[0],
            horaInicio: horaInicio.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }),
            horaFin: horaFin.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }),
            servicio: evento.Titulo_Evento || evento['Servicios incluidos'],
            valor: evento['Valor del turno'] || 0,
            responsable: evento.Responsable,
            estado: estadoMapeado,
            origen: origenMapeado,
            descripcion: evento.Descripcion
          };
        });

        const fechaSeleccionada = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
        const turnosFiltrados = turnosConvertidos.filter((turno: Turno) => turno.fecha === fechaSeleccionada);
        
        turnosFiltrados.sort((a: Turno, b: Turno) => a.horaInicio.localeCompare(b.horaInicio));
        
        setTurnos(turnosFiltrados);
        console.log('✅ Turnos cargados exitosamente:', turnosFiltrados.length);
      } else {
        const errorMsg = data.error || 'Error desconocido al cargar los turnos';
        console.error('❌ Error de API:', errorMsg);
        setError(errorMsg);
        
        toast({
          title: "Error al cargar turnos",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("❌ Error completo al obtener los turnos:", e);
      let errorMessage = 'Error de conexión al cargar los turnos';
      
      if (e instanceof Error) {
        if (e.name === 'AbortError') {
          errorMessage = 'Tiempo de espera agotado. Verifique su conexión a internet.';
        } else if (e.message.includes('fetch')) {
          errorMessage = 'Error de red. Verifique su conexión a internet y que el servidor esté disponible.';
        } else {
          errorMessage = `Error de conexión: ${e.message}`;
        }
      }
      
      setError(errorMessage);
      toast({
        title: "Error de conexión",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCargando(false);
    }
  };

  const actualizarEstadoTurno = async (turnoId: string, nuevoEstado: string) => {
    try {
      console.log('🔄 Actualizando turno:', { turnoId, nuevoEstado });
      
      const requestBodyJSON = {
        action: 'updateEstado',
        id: turnoId,
        estado: nuevoEstado,
        origen_panel: true,
        apiKey: API_SECRET_KEY
      };

      console.log('📤 Request body JSON:', requestBodyJSON);

      try {
        console.log('🔄 Intentando método POST con JSON body...');
        
        const response = await realizarFetchConReintentos(GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBodyJSON)
        });

        const result = await response.json();
        console.log('✅ Response result (POST JSON):', result);

        if (result.success) {
          setTurnos(prevTurnos =>
            prevTurnos.map(turno =>
              turno.id === turnoId ? { ...turno, estado: nuevoEstado } : turno
            )
          );
          
          toast({
            title: "Estado actualizado",
            description: `El turno se ha ${nuevoEstado.toLowerCase()} correctamente.`,
          });
          return;
        } else {
          throw new Error(result.error || 'Error desconocido del servidor');
        }
      } catch (postError) {
        console.warn('⚠️ Método POST falló, intentando GET como fallback:', postError);
        
        const params = new URLSearchParams({
          action: 'updateEstado',
          id: turnoId,
          estado: nuevoEstado,
          origen_panel: 'true',
          apiKey: API_SECRET_KEY,
          timestamp: Date.now().toString()
        });

        const getUrl = `${GOOGLE_APPS_SCRIPT_URL}?${params.toString()}`;
        console.log('🔄 Intentando método GET como fallback:', getUrl);

        const response = await realizarFetchConReintentos(getUrl);
        const result = await response.json();
        console.log('✅ Response result (GET fallback):', result);

        if (result.success) {
          setTurnos(prevTurnos =>
            prevTurnos.map(turno =>
              turno.id === turnoId ? { ...turno, estado: nuevoEstado } : turno
            )
          );
          
          toast({
            title: "Estado actualizado",
            description: `El turno se ha ${nuevoEstado.toLowerCase()} correctamente.`,
          });
        } else {
          throw new Error(result.error || 'Error desconocido del servidor');
        }
      }

    } catch (error) {
      console.error('❌ Error completo al actualizar el estado del turno:', error);
      
      let errorMessage = 'Error de conexión al actualizar el turno';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Tiempo de espera agotado al actualizar el turno';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Error de red al actualizar el turno. Verifique su conexión.';
        } else {
          errorMessage = `Error al actualizar: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: "Error de conexión",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const calcularEstadisticas = () => {
    const fechaSeleccionada = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    const turnosDelDia = turnos.filter(turno => turno.fecha === fechaSeleccionada);

    const confirmados = turnosDelDia.filter(t => t.estado === 'Confirmado').length;
    const completados = turnosDelDia.filter(t => t.estado === 'Completado').length;
    const cancelados = turnosDelDia.filter(t => t.estado === 'Cancelado').length;
    const clientesAusentes = turnosDelDia.filter(t => t.estado === 'Cliente Ausente').length;

    const totalIngresosDia = turnosDelDia
      .filter(t => t.estado === 'Completado')
      .reduce((sum, t) => sum + (t.valor || 0), 0);

    return {
      totalTurnos: turnosDelDia.length,
      confirmados,
      completados,
      cancelados,
      clientesAusentes,
      ingresosDia: totalIngresosDia
    };
  };

  const renderEstadisticasAdmin = () => {
    const stats = calcularEstadisticas();

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-800">Confirmados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{stats.confirmados}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-800">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.completados}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-800">Cancelados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.cancelados}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-800">Cliente Ausente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{stats.clientesAusentes}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-800">Total Turnos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">{stats.totalTurnos}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-indigo-800">Ingresos del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-indigo-600">${stats.ingresosDia.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const getEstadoBadge = (estado: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    
    if (estado === 'Confirmado') {
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    } else if (estado === 'Completado') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (estado === 'Cancelado') {
      return `${baseClasses} bg-red-100 text-red-800`;
    } else if (estado === 'Cliente Ausente') {
      return `${baseClasses} bg-orange-100 text-orange-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  useEffect(() => {
    obtenerTurnos();
  }, [date]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Cargando turnos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Error: {error}</div>
        <Button 
          onClick={obtenerTurnos} 
          className="mt-2" 
          size="sm"
          variant="outline"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {permisos.includes('admin') && renderEstadisticasAdmin()}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Turnos del Día</h2>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                📅 {date ? format(date, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[9999] bg-white shadow-lg border rounded-md" align="end">
              <Calendar
                mode="single"
                locale={es}
                selected={date}
                onSelect={setDate}
                initialFocus
                className="rounded-md"
              />
            </PopoverContent>
          </Popover>
          
          <Button 
            onClick={() => setMostrarAgregarTurno(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            + Turno
          </Button>
        </div>
      </div>

      {turnos.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-gray-500">No hay turnos para esta fecha</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {turnos.map((turno) => (
            <Card key={turno.id} className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                  <div>
                    <p className="text-sm text-gray-500">Hora</p>
                    <p className="font-mono text-lg">{turno.horaInicio} - {turno.horaFin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cliente</p>
                    <p className="font-medium">{turno.nombre}</p>
                    <p className="text-sm text-green-600 font-medium">${turno.valor.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Servicio</p>
                    <p className="font-medium">{turno.servicio}</p>
                    <p className="text-sm text-gray-600">{turno.responsable}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <span className={getEstadoBadge(turno.estado)}>
                      {turno.estado}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 md:flex-col lg:flex-row">
                  {/* MOSTRAR BOTONES SOLO PARA TURNOS "Confirmado" */}
                  {turno.estado === 'Confirmado' && (
                    <>
                      <Button
                        onClick={() => actualizarEstadoTurno(turno.id, 'Completado')}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white flex-1 md:flex-none"
                      >
                        Completar
                      </Button>
                      <Button
                        onClick={() => actualizarEstadoTurno(turno.id, 'Cliente Ausente')}
                        size="sm"
                        variant="outline"
                        className="text-orange-600 border-orange-600 hover:bg-orange-50 flex-1 md:flex-none"
                      >
                        Cliente Ausente
                      </Button>
                      <Button
                        onClick={() => actualizarEstadoTurno(turno.id, 'Cancelado')}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50 flex-1 md:flex-none"
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {mostrarAgregarTurno && (
        <AgregarTurnoMejorado
          onClose={() => setMostrarAgregarTurno(false)}
          onTurnoAgregado={() => {
            obtenerTurnos();
            setMostrarAgregarTurno(false);
          }}
          fechaSeleccionada={date}
        />
      )}
    </div>
  );
};

export default TurnosDia;
