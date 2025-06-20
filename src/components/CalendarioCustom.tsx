
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useBusiness } from '@/context/BusinessContext';
import { useHorariosEspecialistas } from '@/hooks/useHorariosEspecialistas';
import { useToast } from '@/hooks/use-toast';

interface CalendarioCustomProps {
  servicioId: string;
  responsable: string;
  onReservaConfirmada: () => void;
}

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlh4awkllCTVdxnVQkUWPfs-RVCYXQ9zwn3UpfKaCNiUEOEcTZdx61SVicn5boJf0p/exec';
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

const CalendarioCustom: React.FC<CalendarioCustomProps> = ({ servicioId, responsable, onReservaConfirmada }) => {
  const { contenido } = useBusiness();
  const { obtenerHorariosDisponibles } = useHorariosEspecialistas();
  const { toast } = useToast();

  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedHour, setSelectedHour] = useState<string>('');
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });
  const [enviando, setEnviando] = useState(false);

  const servicio = contenido?.find(s => s.id === servicioId);

  const realizarFetchConReintentos = async (url: string, options?: RequestInit, maxReintentos = 3) => {
    let ultimoError;
    
    for (let intento = 1; intento <= maxReintentos; intento++) {
      try {
        console.log(`🔄 Intento ${intento} de ${maxReintentos} para crear reserva`);
        console.log('🔗 URL:', url);
        console.log('⚙️ Options:', options);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 segundos para creación (incluye emails)
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        ultimoError = error;
        console.error(`❌ Error en intento ${intento}:`, error);
        
        if (intento < maxReintentos) {
          const delay = intento * 3000; // Mayor delay para creación
          console.log(`⏳ Reintentando en ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw ultimoError;
  };

  const generarId = (): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `evento_${timestamp}`;
  };

  const calcularHoraFin = (horaInicio: string, duracionMinutos: number): string => {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    let nuevaHora = horas;
    let nuevoMinuto = minutos + duracionMinutos;

    if (nuevoMinuto >= 60) {
      nuevaHora += Math.floor(nuevoMinuto / 60);
      nuevoMinuto %= 60;
    }

    nuevaHora %= 24;
    return `${String(nuevaHora).padStart(2, '0')}:${String(nuevoMinuto).padStart(2, '0')}`;
  };

  const filtrarHorariosPasados = (horarios: string[]): string[] => {
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutoActual = ahora.getMinutes();
    
    const esHoy = date && date.toDateString() === ahora.toDateString();
    
    if (!esHoy) {
      return horarios;
    }
    
    return horarios.filter(horario => {
      const [hora, minuto] = horario.split(':').map(Number);
      const horarioEnMinutos = hora * 60 + minuto;
      const ahoraEnMinutos = horaActual * 60 + minutoActual;
      
      return horarioEnMinutos > ahoraEnMinutos;
    });
  };

  const actualizarHorarios = () => {
    if (date && servicio) {
      const duracion = servicio.detalles?.duracion ? parseInt(servicio.detalles.duracion.replace('min', '')) : 15;
      const horariosCompletos = obtenerHorariosDisponibles(responsable, date, duracion);
      const horariosFiltrados = filtrarHorariosPasados(horariosCompletos);
      
      setHorariosDisponibles(horariosFiltrados);
      
      if (selectedHour && !horariosFiltrados.includes(selectedHour)) {
        setSelectedHour('');
      }
    } else {
      setHorariosDisponibles([]);
    }
  };

  useEffect(() => {
    actualizarHorarios();
  }, [date, servicio, responsable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !selectedHour || !formData.nombre || !formData.email || !formData.telefono) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    if (!servicio) {
      toast({
        title: "Error",
        description: "Servicio no encontrado",
        variant: "destructive",
      });
      return;
    }

    setEnviando(true);

    try {
      const fechaISO = date.toISOString().split('T')[0];
      const duracion = servicio.detalles?.duracion ? parseInt(servicio.detalles.duracion.replace('min', '')) : 15;
      const horaFin = calcularHoraFin(selectedHour, duracion);

      const reservaData = {
        action: 'crearReserva',
        apiKey: API_SECRET_KEY,
        ID_Evento: generarId(),
        Titulo_Evento: servicio.nombre,
        Nombre_Cliente: formData.nombre,
        Email_Cliente: formData.email,
        Fecha: fechaISO,
        Hora_Inicio: selectedHour,
        Hora_Fin: horaFin,
        Descripcion: `${servicio.nombre} - Tel: ${formData.telefono}`,
        'Valor del turno': servicio.precio_oferta ?? servicio.precio,
        'Servicios incluidos': servicio.nombre,
        Responsable: responsable
      };

      console.log('📤 Enviando reserva:', reservaData);

      const response = await realizarFetchConReintentos(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservaData)
      });

      const result = await response.json();
      console.log('✅ Respuesta del servidor:', result);

      if (result.success) {
        toast({
          title: "¡Reserva confirmada!",
          description: "Te enviaremos un email de confirmación a tu casilla.",
        });
        
        setTimeout(() => {
          onReservaConfirmada();
        }, 2000);
      } else {
        throw new Error(result.error || 'Error desconocido del servidor');
      }

    } catch (error) {
      console.error('❌ Error completo al crear la reserva:', error);
      
      let errorMessage = 'Error de conexión al procesar la reserva';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Tiempo de espera agotado. La reserva puede haberse procesado, verifica tu email.';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Error de red. Verifica tu conexión a internet.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      toast({
        title: "Error al procesar la reserva",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setEnviando(false);
    }
  };

  if (!servicio) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Servicio no encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold mb-2">{servicio.nombre}</h3>
        <p className="text-gray-600">
          Duración: {servicio.detalles?.duracion || '15min'} | 
          Precio: ${(servicio.precio_oferta ?? servicio.precio).toLocaleString()}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="fecha">Fecha</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                📅 {date ? format(date, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[9999] bg-white shadow-lg border rounded-md" align="start">
              <Calendar
                mode="single"
                locale={es}
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                initialFocus
                className="rounded-md"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="hora">Hora</Label>
          {horariosDisponibles.length > 0 ? (
            <Select onValueChange={setSelectedHour} value={selectedHour}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un horario" />
              </SelectTrigger>
              <SelectContent>
                {horariosDisponibles.map((horario) => (
                  <SelectItem key={horario} value={horario}>
                    {horario} - {calcularHoraFin(horario, servicio.detalles?.duracion ? parseInt(servicio.detalles.duracion.replace('min', '')) : 15)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm text-gray-500 p-2 border rounded">
              {date ? 'No hay horarios disponibles para esta fecha' : 'Selecciona una fecha primero'}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="nombre">Nombre completo</Label>
          <Input
            id="nombre"
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            placeholder="Tu nombre completo"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="tu.email@ejemplo.com"
            required
          />
        </div>

        <div>
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            type="tel"
            value={formData.telefono}
            onChange={(e) => setFormData({...formData, telefono: e.target.value})}
            placeholder="Tu número de teléfono"
            required
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[#693f29] hover:bg-[#5a3322]" 
          disabled={enviando || !date || !selectedHour || horariosDisponibles.length === 0}
        >
          {enviando ? 'Procesando reserva...' : 'Confirmar Reserva'}
        </Button>
      </form>
    </div>
  );
};

export default CalendarioCustom;
