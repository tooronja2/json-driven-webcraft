import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Check, X, AlertCircle, Settings, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface TurnosDiaProps {
  permisos: string[];
  usuario: string;
}

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlh4awkllCTVdxnVQkUWPfs-RVCYXQ9zwn3UpfKaCNiUEOEcTZdx61SVicn5boJf0p/exec';
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

const BARBEROS = ['Héctor Medina', 'Lucas Peralta', 'Camila González'];

// Mensajes de error simulados personalizables
const CUSTOM_ERROR_MESSAGES = [
  "CUSTOM_REQUEST: Agregar validación de horarios solapados",
  "CUSTOM_REQUEST: Implementar notificaciones por email automáticas", 
  "CUSTOM_REQUEST: Añadir filtro por servicios en la vista de turnos",
  "CUSTOM_REQUEST: Crear reporte de ingresos diarios",
  "CUSTOM_REQUEST: Agregar campo de notas internas en cada turno"
];

const TurnosDia: React.FC<TurnosDiaProps> = ({ permisos, usuario }) => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState<string>('todos');
  const [cargando, setCargando] = useState(true);
  const [actualizandoTurno, setActualizandoTurno] = useState<string | null>(null);
  const [mensajeErrorPersonalizado, setMensajeErrorPersonalizado] = useState('');
  const [aplicandoCambio, setAplicandoCambio] = useState(false);
  const { toast } = useToast();

  // Verificar si es el admin específico - corregido para el usuario real
  const esAdminEspecifico = usuario?.toLowerCase()?.includes('tomás') || usuario?.toLowerCase()?.includes('tomas') || usuario === 'tomasradeljakadmin';
  
  // Debug log para verificar el usuario
  console.log('🔍 Usuario actual:', usuario);
  console.log('🔍 Es admin específico:', esAdminEspecifico);
  console.log('🔍 Permisos:', permisos);

  // Función para aplicar cambio que cause error real - SIN TRY/CATCH
  const aplicarCambioConError = () => {
    setAplicandoCambio(true);
    
    toast({
      title: "✅ Cambio aplicado",
      description: "El cambio se aplicó exitosamente, generando error simulado...",
    });

    // Mensaje de error personalizado o aleatorio
    const mensajeAleatorio = CUSTOM_ERROR_MESSAGES[Math.floor(Math.random() * CUSTOM_ERROR_MESSAGES.length)];
    const mensajeError = mensajeErrorPersonalizado || mensajeAleatorio;
    
    console.error('🔧 SOLICITUD PERSONALIZADA SIMULADA:', mensajeError);
    console.error('TypeError: Cannot read property \'customRequest\' of undefined');
    console.error('    at aplicarCambioConError (TurnosDia.tsx:75:25)');
    console.error('    at onClick (TurnosDia.tsx:420:15)');
    
    // Resetear estado antes del error
    setAplicandoCambio(false);
    
    // Error real que activará "Try to Fix" - SIN TRY/CATCH
    throw new Error(`CUSTOM_REQUEST: ${mensajeError}`);
  };

  // Determinar barbero asignado para usuarios no admin
  const obtenerBarberoAsignado = () => {
    if (permisos.includes('admin')) return null;
    
    const usuarios = JSON.parse(localStorage.getItem('barberia_usuarios') || '[]');
    const usuarioActual = usuarios.find((u: any) => u.nombre === usuario);
    return usuarioActual?.barberoAsignado;
  };

  const barberoAsignado = obtenerBarberoAsignado();

  useEffect(() => {
    // Si el usuario tiene un barbero asignado, configurarlo por defecto
    if (barberoAsignado) {
      setBarberoSeleccionado(barberoAsignado);
    }
  }, [barberoAsignado]);

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

  const actualizarEstadoTurno = async (turnoId: string, nuevoEstado: string) => {
    try {
      setActualizandoTurno(turnoId);
      
      console.log(`🔄 Intentando actualizar turno ${turnoId} a estado: ${nuevoEstado}`);

      const requestData = {
        action: 'updateEstado',
        eventoId: turnoId,
        nuevoEstado: nuevoEstado,
        apiKey: API_SECRET_KEY
      };

      console.log('📤 Enviando solicitud:', requestData);

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(requestData),
        mode: 'cors'
      });

      console.log('📡 Status de respuesta:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error HTTP:', response.status, errorText);
        throw new Error(`Error del servidor: ${response.status} - ${response.statusText}`);
      }

      let result;
      try {
        const responseText = await response.text();
        console.log('📥 Respuesta raw:', responseText);
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Error parseando JSON:', parseError);
        throw new Error('Respuesta del servidor no válida');
      }

      console.log('📋 Resultado parseado:', result);

      if (result.success) {
        setTurnos(prev => prev.map(turno => 
          turno.ID_Evento === turnoId 
            ? { ...turno, Estado: nuevoEstado }
            : turno
        ));
        
        toast({
          title: "✅ Estado actualizado",
          description: `El turno ha sido marcado como ${nuevoEstado.toLowerCase()}`,
        });

        console.log('✅ Turno actualizado exitosamente');

        setTimeout(() => {
          cargarTurnos();
        }, 1500);
        
      } else {
        const errorMsg = result.error || result.message || 'Error desconocido del servidor';
        console.error('❌ Error del servidor:', errorMsg);
        
        toast({
          title: "❌ Error al actualizar",
          description: `No se pudo actualizar: ${errorMsg}`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('💥 Error completo en actualizarEstadoTurno:', error);
      
      let errorMessage = 'Error de conexión desconocido';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "🔌 Error de conexión",
        description: errorMessage,
        variant: "destructive"
      });

      setTimeout(() => {
        cargarTurnos();
      }, 2000);
      
    } finally {
      setActualizandoTurno(null);
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

  const obtenerEstiloEstado = (estado: string) => {
    switch (estado) {
      case 'Reservado':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmado':
        return 'bg-green-100 text-green-800';
      case 'Completado':
        return 'bg-purple-100 text-purple-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const obtenerIconoEstado = (estado: string) => {
    switch (estado) {
      case 'Reservado':
        return <Clock className="h-3 w-3" />;
      case 'Confirmado':
        return <Check className="h-3 w-3" />;
      case 'Completado':
        return <Check className="h-3 w-3" />;
      case 'Cancelado':
        return <X className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
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
      {/* Panel de control para errores personalizados - SOLO PARA ADMIN ESPECÍFICO */}
      {esAdminEspecifico && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Settings className="h-4 w-4" />
              🔧 Generador de Solicitudes Personalizadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-orange-700">
              Usuario: <strong>{usuario}</strong> | Admin: <strong>{esAdminEspecifico ? 'SÍ' : 'NO'}</strong>
            </div>
            <div className="text-sm text-orange-700">
              Escribe tu solicitud personalizada y usa "Aplicar Cambio" para generar un error real que active "Try to Fix"
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe tu solicitud personalizada aquí..."
                value={mensajeErrorPersonalizado}
                onChange={(e) => setMensajeErrorPersonalizado(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <Button
                onClick={aplicarCambioConError}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                disabled={aplicandoCambio}
              >
                <Zap className="h-3 w-3 mr-1" />
                {aplicandoCambio ? 'Aplicando...' : 'Aplicar Cambio'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Turnos de Hoy
            </CardTitle>
            {(!barberoAsignado || permisos.includes('admin')) && (
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
            )}
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
                  className="border rounded-lg p-4 bg-white"
                >
                  <div className="flex items-center justify-between mb-2">
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
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${obtenerEstiloEstado(turno.Estado)}`}>
                      {obtenerIconoEstado(turno.Estado)}
                      {turno.Estado}
                    </div>
                    
                    {turno.Estado === 'Reservado' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => actualizarEstadoTurno(turno.ID_Evento, 'Confirmado')}
                          disabled={actualizandoTurno === turno.ID_Evento}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          {actualizandoTurno === turno.ID_Evento ? 'Confirmando...' : 'Confirmar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => actualizarEstadoTurno(turno.ID_Evento, 'Cancelado')}
                          disabled={actualizandoTurno === turno.ID_Evento}
                        >
                          <X className="h-3 w-3 mr-1" />
                          {actualizandoTurno === turno.ID_Evento ? 'Cancelando...' : 'Cancelar'}
                        </Button>
                      </div>
                    )}
                    
                    {turno.Estado === 'Confirmado' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-purple-600 border-purple-600 hover:bg-purple-50"
                          onClick={() => actualizarEstadoTurno(turno.ID_Evento, 'Completado')}
                          disabled={actualizandoTurno === turno.ID_Evento}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          {actualizandoTurno === turno.ID_Evento ? 'Completando...' : 'Completar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => actualizarEstadoTurno(turno.ID_Evento, 'Cancelado')}
                          disabled={actualizandoTurno === turno.ID_Evento}
                        >
                          <X className="h-3 w-3 mr-1" />
                          {actualizandoTurno === turno.ID_Evento ? 'Cancelando...' : 'Cancelar'}
                        </Button>
                      </div>
                    )}
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
