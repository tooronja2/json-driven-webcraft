
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, addMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast"

interface CalendarioCustomProps {
  servicioId?: string;
  responsable?: string;
  onReservaConfirmada?: () => void;
  onReservaExitosa?: () => void;
}

interface Servicio {
  nombre: string;
  precio: number;
  duracion: number;
}

interface TurnoExistente {
  Fecha: string;
  Hora_Inicio: string;
  Hora_Fin: string;
  Responsable: string;
}

// 🔐 API KEY SECRETA - DEBE SER LA MISMA QUE EN CalendarioCustom
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

// URL ACTUALIZADA de Google Apps Script
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbylrQ6YaI9vPFZH9XhQjdKGFJCgJvHtQqBZABYkm3BSU14yXbMsdpKEf_Fmjl937k8J/exec';

const SERVICIOS: Servicio[] = [
  { nombre: 'Corte de barba', precio: 6500, duracion: 15 },
  { nombre: 'Corte de pelo', precio: 8500, duracion: 15 },
  { nombre: 'Corte todo maquina', precio: 8000, duracion: 15 },
  { nombre: 'Corte de pelo y barba', precio: 9500, duracion: 25 },
  { nombre: 'Diseños y dibujos', precio: 6500, duracion: 15 }
];

const ESPECIALISTAS = ['Héctor Medina', 'Lucas Peralta', 'Camila González'];

const extraerHora = (fecha: Date): string => {
  return format(fecha, 'HH:mm');
};

const CalendarioCustom: React.FC<CalendarioCustomProps> = ({ 
  servicioId, 
  responsable, 
  onReservaConfirmada, 
  onReservaExitosa 
}) => {
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | null>(() => {
    // Si viene servicioId predefinido, buscar el servicio correspondiente
    if (servicioId) {
      const servicioMap: { [key: string]: string } = {
        'corte-barba': 'Corte de barba',
        'corte-pelo': 'Corte de pelo',
        'corte-todo-maquina': 'Corte todo maquina',
        'corte-pelo-barba': 'Corte de pelo y barba',
        'disenos-dibujos': 'Diseños y dibujos'
      };
      const nombreServicio = servicioMap[servicioId];
      return SERVICIOS.find(s => s.nombre === nombreServicio) || null;
    }
    return null;
  });
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '' });
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [turnosExistentes, setTurnosExistentes] = useState<TurnoExistente[]>([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [responsableSeleccionado, setResponsableSeleccionado] = useState(responsable || '');
  const { toast } = useToast()

  const calcularHoraFin = (horaInicio: string, duracion: number): string => {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const fechaInicio = new Date();
    fechaInicio.setHours(horas, minutos, 0, 0);
    const fechaFin = addMinutes(fechaInicio, duracion);
    return format(fechaFin, 'HH:mm');
  };

  const cargarTurnosExistentes = useCallback(async () => {
    try {
      const fechaISO = fechaSeleccionada.toISOString().split('T')[0];
      const url = `${GOOGLE_APPS_SCRIPT_URL}?action=getEventos&apiKey=${API_SECRET_KEY}&fecha=${fechaISO}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.eventos) {
        // Filtrar los turnos por el responsable seleccionado
        const turnosFiltrados = data.eventos.filter((turno: any) => turno.Responsable === responsableSeleccionado);
        setTurnosExistentes(turnosFiltrados);
      } else {
        console.error('Error al cargar turnos existentes:', data.error);
        setTurnosExistentes([]);
      }
    } catch (error) {
      console.error('Error al cargar turnos existentes:', error);
      setTurnosExistentes([]);
    }
  }, [fechaSeleccionada, responsableSeleccionado]);

  const cargarHorarios = useCallback(() => {
    if (!servicioSeleccionado || !responsableSeleccionado) {
      setHorariosDisponibles([]);
      return;
    }

    const duracion = servicioSeleccionado.duracion;
    const horarios: string[] = [];
    let horaInicio = 9;
    let minutoInicio = 0;
    const horaFin = 18;

    while (horaInicio < horaFin) {
      const horario = `${String(horaInicio).padStart(2, '0')}:${String(minutoInicio).padStart(2, '0')}`;
      horarios.push(horario);

      minutoInicio += duracion;
      if (minutoInicio >= 60) {
        horaInicio++;
        minutoInicio -= 60;
      }
    }

    // Filtrar horarios ocupados
    const horariosOcupados = turnosExistentes.map(turno => turno.Hora_Inicio);
    const horariosDisponiblesFiltrados = horarios.filter(horario => !horariosOcupados.includes(horario));
    setHorariosDisponibles(horariosDisponiblesFiltrados);
  }, [servicioSeleccionado, turnosExistentes, responsableSeleccionado]);

  useEffect(() => {
    cargarTurnosExistentes();
  }, [cargarTurnosExistentes]);

  useEffect(() => {
    cargarHorarios();
  }, [cargarHorarios]);

  const enviarReserva = async () => {
    if (!formData.nombre || !formData.email || !formData.telefono || !horaSeleccionada || !servicioSeleccionado || !responsableSeleccionado) {
      setError('Por favor completa todos los campos');
      return;
    }

    setEnviando(true);
    setError('');

    try {
      const fechaISO = fechaSeleccionada.toISOString().split('T')[0];
      const horaFin = calcularHoraFin(horaSeleccionada, servicioSeleccionado.duracion);
      
      // Datos adaptados al nuevo formato del Google Apps Script
      const reservaData = {
        action: 'crearReserva',
        apiKey: API_SECRET_KEY,
        data: JSON.stringify({
          ID_Evento: `evento_${Date.now()}`,
          Titulo_Evento: servicioSeleccionado.nombre,
          Nombre_Cliente: formData.nombre,
          Email_Cliente: formData.email,
          Fecha: fechaISO,
          Hora_Inicio: horaSeleccionada,
          Hora_Fin: horaFin,
          Descripcion: `${servicioSeleccionado.nombre} - Tel: ${formData.telefono}`,
          'Valor del turno': servicioSeleccionado.precio,
          'Servicios incluidos': servicioSeleccionado.nombre,
          Responsable: responsableSeleccionado
        })
      };

      console.log('📤 Enviando reserva:', reservaData);

      const formDataToSend = new URLSearchParams();
      Object.entries(reservaData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataToSend
      });

      const result = await response.json();
      console.log('📥 Respuesta del servidor:', result);

      if (result.success) {
        setMensajeExito('¡Reserva enviada exitosamente! Te enviaremos un email de confirmación.');
        
        // Limpiar formulario
        setFormData({ nombre: '', email: '', telefono: '' });
        setHoraSeleccionada('');
        if (!servicioId) setServicioSeleccionado(null);
        if (!responsable) setResponsableSeleccionado('');
        
        // Llamar al callback apropiado
        if (onReservaConfirmada) {
          onReservaConfirmada();
        } else if (onReservaExitosa) {
          onReservaExitosa();
        }
        
        setTimeout(() => {
          setMensajeExito('');
          setMostrarCalendario(false);
        }, 3000);
      } else {
        setError(result.error || 'Error al procesar la reserva');
      }
    } catch (error) {
      console.error('❌ Error completo:', error);
      setError('Error de conexión. Por favor, inténtalo nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reserva tu turno
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¡Agendá tu cita de forma rápida y sencilla!
          </p>
        </div>
        <div className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md bg-red-100 p-4">
              <div className="text-sm leading-5 text-red-700">{error}</div>
            </div>
          )}
          {mensajeExito && (
            <div className="rounded-md bg-green-100 p-4">
              <div className="text-sm leading-5 text-green-700">{mensajeExito}</div>
            </div>
          )}
          {!mostrarCalendario ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="11-2345-6789"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                />
              </div>
              {!servicioId && (
                <div>
                  <Label htmlFor="servicio">Servicio</Label>
                  <Select onValueChange={(value) => setServicioSeleccionado(SERVICIOS.find(s => s.nombre === value) || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICIOS.map((servicio) => (
                        <SelectItem key={servicio.nombre} value={servicio.nombre}>
                          {servicio.nombre} (${servicio.precio})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {servicioId && servicioSeleccionado && (
                <div className="bg-gray-100 p-3 rounded">
                  <Label>Servicio seleccionado:</Label>
                  <div className="font-semibold">{servicioSeleccionado.nombre} (${servicioSeleccionado.precio})</div>
                </div>
              )}
              {!responsable && (
                <div>
                  <Label htmlFor="responsable">Barbero</Label>
                  <Select onValueChange={setResponsableSeleccionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un barbero" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESPECIALISTAS.map((barbero) => (
                        <SelectItem key={barbero} value={barbero}>{barbero}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {responsable && (
                <div className="bg-gray-100 p-3 rounded">
                  <Label>Barbero seleccionado:</Label>
                  <div className="font-semibold">{responsable}</div>
                </div>
              )}
              <Button
                onClick={() => {
                  if (!formData.nombre || !formData.email || !formData.telefono || !servicioSeleccionado || !responsableSeleccionado) {
                    setError('Por favor completa todos los campos antes de seleccionar la fecha');
                    return;
                  }
                  setError('');
                  setMostrarCalendario(true);
                }}
                className="w-full"
              >
                Seleccionar Fecha y Hora
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={
                      "w-full justify-start text-left font-normal" +
                      (fechaSeleccionada ? " pl-3.5" : "")
                    }
                  >
                    {fechaSeleccionada ? (
                      format(fechaSeleccionada, "PPP", { locale: es })
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <Calendar
                    mode="single"
                    selected={fechaSeleccionada}
                    onSelect={setFechaSeleccionada}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div>
                <Label htmlFor="hora">Hora</Label>
                <Select onValueChange={setHoraSeleccionada} disabled={horariosDisponibles.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {horariosDisponibles.map((hora) => (
                      <SelectItem key={hora} value={hora}>{hora} - {calcularHoraFin(hora, servicioSeleccionado?.duracion || 15)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {horariosDisponibles.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">No hay horarios disponibles para este día y servicio.</p>
                )}
              </div>
              <Button
                onClick={enviarReserva}
                className="w-full"
                disabled={enviando}
              >
                {enviando ? 'Enviando...' : 'Reservar'}
              </Button>
              <Button
                onClick={() => setMostrarCalendario(false)}
                className="w-full"
                variant="secondary"
              >
                Volver
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarioCustom;
