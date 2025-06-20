
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useBusiness } from '@/context/BusinessContext';
import { useHorariosEspecialistas } from '@/hooks/useHorariosEspecialistas';
import { useToast } from '@/hooks/use-toast';

interface AgregarTurnoMejoradoProps {
  onClose: () => void;
  onTurnoAgregado: () => void;
  fechaSeleccionada?: Date;
}

interface TurnoExistente {
  id: string;
  nombre: string;
  servicio: string;
  hora: string;
}

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxa8EBhJ0Bjx1amjc7NzOXJWSMe88ExERPFuRqo5iz_OjWS0w9jMDjsN_7us0FKC9o2/exec';
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

const ESPECIALISTAS = [
  { nombre: "Héctor Medina" },
  { nombre: "Lucas Peralta" },
  { nombre: "Camila González" },
];

const AgregarTurnoMejorado: React.FC<AgregarTurnoMejoradoProps> = ({ 
  onClose, 
  onTurnoAgregado, 
  fechaSeleccionada 
}) => {
  const { contenido } = useBusiness();
  const { obtenerHorariosDisponibles } = useHorariosEspecialistas();
  const { toast } = useToast();

  const [fecha, setFecha] = useState<Date | undefined>(fechaSeleccionada || new Date());
  const [servicioId, setServicioId] = useState('');
  const [responsable, setResponsable] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [datosCliente, setDatosCliente] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });
  const [cargando, setCargando] = useState(false);
  
  // Estados para manejo de conflictos
  const [mostrarDialogoConflicto, setMostrarDialogoConflicto] = useState(false);
  const [turnoConflicto, setTurnoConflicto] = useState<TurnoExistente | null>(null);
  const [accionConflicto, setAccionConflicto] = useState<'reemplazar' | 'reprogramar' | 'cambiar' | null>(null);

  const servicio = contenido?.find(s => s.id === servicioId);
  const duracionMinutos = parseInt(servicio?.detalles?.duracion?.replace('min', '') || '30');

  // Verificar si hay turno existente en el horario seleccionado
  const verificarConflictoHorario = async (fecha: Date, hora: string, responsable: string): Promise<TurnoExistente | null> => {
    try {
      const fechaStr = fecha.toISOString().split('T')[0];
      const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getEventos&apiKey=${API_SECRET_KEY}&timestamp=${Date.now()}`);
      const data = await response.json();
      
      if (data.success) {
        const turnoExistente = data.eventos.find((evento: any) => {
          const fechaEvento = new Date(evento.Fecha).toISOString().split('T')[0];
          const horaEvento = new Date(evento['Hora Inicio']).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
          
          return fechaEvento === fechaStr && 
                 horaEvento === hora && 
                 evento.Responsable === responsable &&
                 evento.Estado === 'Confirmado';
        });

        if (turnoExistente) {
          return {
            id: turnoExistente.ID_Evento,
            nombre: turnoExistente.Nombre_Cliente,
            servicio: turnoExistente.Titulo_Evento,
            hora: hora
          };
        }
      }
    } catch (error) {
      console.error('Error verificando conflicto:', error);
    }
    return null;
  };

  // Obtener horarios disponibles cuando cambian fecha o responsable
  useEffect(() => {
    if (fecha && responsable) {
      const horarios = obtenerHorariosDisponibles(responsable, fecha, duracionMinutos);
      
      // Filtrar horarios que ya pasaron si es el día actual
      const ahora = new Date();
      const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
      const fechaHoy = new Date().toDateString();
      
      const horariosDisponibles = horarios.filter(hora => {
        if (fecha.toDateString() === fechaHoy) {
          return hora > horaActual;
        }
        return true;
      });
      
      setHorasDisponibles(horariosDisponibles);
    }
  }, [fecha, responsable, duracionMinutos, obtenerHorariosDisponibles]);

  const manejarSeleccionHora = async (hora: string) => {
    if (!fecha || !responsable) return;

    const conflicto = await verificarConflictoHorario(fecha, hora, responsable);
    
    if (conflicto) {
      setTurnoConflicto(conflicto);
      setHoraSeleccionada(hora);
      setMostrarDialogoConflicto(true);
    } else {
      setHoraSeleccionada(hora);
    }
  };

  const confirmarAccionConflicto = (accion: 'reemplazar' | 'reprogramar' | 'cambiar') => {
    setAccionConflicto(accion);
    setMostrarDialogoConflicto(false);
    
    if (accion === 'reemplazar') {
      // Proceder con la creación del turno (el turno anterior se cancelará automáticamente)
      crearTurno();
    } else if (accion === 'cambiar') {
      // Resetear selección para que el usuario elija otra hora
      setHoraSeleccionada('');
      setTurnoConflicto(null);
      toast({
        title: "Selecciona otra hora",
        description: "Elige un horario diferente para el nuevo turno.",
      });
    } else if (accion === 'reprogramar') {
      // Aquí se implementaría la lógica de reprogramación
      toast({
        title: "Función en desarrollo",
        description: "La reprogramación automática estará disponible próximamente.",
        variant: "destructive"
      });
    }
  };

  const crearTurno = async () => {
    if (!fecha || !horaSeleccionada || !servicioId || !responsable || !datosCliente.nombre || !datosCliente.email) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }

    setCargando(true);

    try {
      // Si hay conflicto y se eligió reemplazar, primero cancelar el turno existente
      if (turnoConflicto && accionConflicto === 'reemplazar') {
        await fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'updateEstado',
            id: turnoConflicto.id,
            estado: 'Cancelado',
            origen_panel: true,
            apiKey: API_SECRET_KEY
          })
        });
      }

      // Calcular hora de fin
      const [horas, minutos] = horaSeleccionada.split(':').map(Number);
      const fechaFin = new Date();
      fechaFin.setHours(horas, minutos + duracionMinutos);
      const horaFin = `${fechaFin.getHours().toString().padStart(2, '0')}:${fechaFin.getMinutes().toString().padStart(2, '0')}`;

      const turnoData = {
        ID_Evento: `evento_${Date.now()}_manual`,
        Titulo_Evento: servicio?.nombre || '',
        Nombre_Cliente: datosCliente.nombre,
        Email_Cliente: datosCliente.email,
        Fecha: fecha.toISOString().split('T')[0],
        Hora_Inicio: horaSeleccionada,
        Hora_Fin: horaFin,
        Descripcion: `${servicio?.nombre} - Tel: ${datosCliente.telefono || 'No proporcionado'} - Agregado manualmente`,
        Estado: 'Confirmado',
        "Valor del turno": servicio?.precio_oferta || servicio?.precio || 0,
        "Servicios incluidos": servicio?.nombre || '',
        Responsable: responsable,
        origen_panel: true
      };

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'crearReserva',
          data: JSON.stringify(turnoData),
          apiKey: API_SECRET_KEY
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Turno agregado exitosamente",
          description: `Turno para ${datosCliente.nombre} creado correctamente.`,
        });
        onTurnoAgregado();
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error creando turno:', error);
      toast({
        title: "Error al crear turno",
        description: "Hubo un problema al crear el turno. Inténtalo nuevamente.",
        variant: "destructive"
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Turno Manualmente</DialogTitle>
            <DialogDescription>
              Completa la información para agregar un nuevo turno
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Selección de fecha */}
            <div>
              <label className="text-sm font-medium">Fecha</label>
              <Calendar
                mode="single"
                selected={fecha}
                onSelect={setFecha}
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                className="rounded-md border"
              />
            </div>

            {/* Selección de servicio */}
            <div>
              <label className="text-sm font-medium">Servicio</label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {contenido?.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setServicioId(item.id)}
                    className={`p-3 text-left border rounded-lg transition ${
                      servicioId === item.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{item.nombre}</div>
                    <div className="text-sm text-gray-500">
                      {item.detalles?.duracion} - ${item.precio_oferta || item.precio}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selección de especialista */}
            <div>
              <label className="text-sm font-medium">Especialista</label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {ESPECIALISTAS.map((esp) => (
                  <button
                    key={esp.nombre}
                    onClick={() => setResponsable(esp.nombre)}
                    className={`p-3 text-left border rounded-lg transition ${
                      responsable === esp.nombre 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {esp.nombre}
                  </button>
                ))}
              </div>
            </div>

            {/* Selección de horario */}
            {fecha && responsable && (
              <div>
                <label className="text-sm font-medium">Horario disponible</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {horasDisponibles.map((hora) => (
                    <Button
                      key={hora}
                      variant={horaSeleccionada === hora ? "default" : "outline"}
                      onClick={() => manejarSeleccionHora(hora)}
                      className="text-sm"
                    >
                      {hora}
                    </Button>
                  ))}
                </div>
                {horasDisponibles.length === 0 && (
                  <p className="text-gray-500 text-sm mt-2">No hay horarios disponibles</p>
                )}
              </div>
            )}

            {/* Datos del cliente */}
            {horaSeleccionada && (
              <div className="space-y-4">
                <h4 className="font-medium">Datos del cliente</h4>
                
                <input
                  type="text"
                  placeholder="Nombre completo *"
                  value={datosCliente.nombre}
                  onChange={(e) => setDatosCliente({...datosCliente, nombre: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
                
                <input
                  type="email"
                  placeholder="Email *"
                  value={datosCliente.email}
                  onChange={(e) => setDatosCliente({...datosCliente, email: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
                
                <input
                  type="tel"
                  placeholder="Teléfono (opcional)"
                  value={datosCliente.telefono}
                  onChange={(e) => setDatosCliente({...datosCliente, telefono: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />

                <div className="flex gap-2">
                  <Button onClick={onClose} variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                  <Button 
                    onClick={crearTurno} 
                    disabled={cargando || !datosCliente.nombre || !datosCliente.email}
                    className="flex-1"
                  >
                    {cargando ? 'Creando...' : 'Crear Turno'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de conflicto de horario */}
      <AlertDialog open={mostrarDialogoConflicto} onOpenChange={setMostrarDialogoConflicto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conflicto de horario detectado</AlertDialogTitle>
            <AlertDialogDescription>
              Ya existe un turno en el horario {horaSeleccionada} con:
              <br />
              <strong>Cliente:</strong> {turnoConflicto?.nombre}
              <br />
              <strong>Servicio:</strong> {turnoConflicto?.servicio}
              <br /><br />
              ¿Qué deseas hacer?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2">
            <AlertDialogAction
              onClick={() => confirmarAccionConflicto('reemplazar')}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Reemplazar turno y cancelar el anterior
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => confirmarAccionConflicto('reprogramar')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Agregar nuevo turno y reprogramar el segundo
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => confirmarAccionConflicto('cambiar')}
              className="w-full"
            >
              Cambiar el horario del turno
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AgregarTurnoMejorado;
