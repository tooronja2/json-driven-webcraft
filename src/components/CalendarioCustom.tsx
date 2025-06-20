import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { useBusiness } from '@/context/BusinessContext';
import { useHorariosEspecialistas } from '@/hooks/useHorariosEspecialistas';

interface EventoReserva {
  ID_Evento: string;
  Titulo_Evento: string;
  Nombre_Cliente: string;
  Email_Cliente: string;
  Fecha: string; // "2025-06-23"
  "Hora Inicio": string | Date; // "11:15" o Date object
  "Hora Fin": string | Date; // "11:30" o Date object
  Descripcion: string;
  Estado: string;
  "Valor del turno": number;
  "Servicios incluidos": string;
  Responsable: string;
}

interface CalendarioCustomProps {
  servicioId: string;
  responsable: string;
  onReservaConfirmada: () => void;
}

// URL ACTUALIZADA de Google Apps Script
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlh4awkllCTVdxnVQkUWPfs-RVCYXQ9zwn3UpfKaCNiUEOEcTZdx61SVicn5boJf0p/exec';

// Función mejorada para extraer hora en formato HH:MM
const extraerHora = (horaInput: string | Date): string => {
  console.log('🕐 Extrayendo hora de:', horaInput, 'Tipo:', typeof horaInput);
  
  // Si es string directo (formato HH:MM)
  if (typeof horaInput === 'string') {
    const horaLimpia = horaInput.trim();
    if (horaLimpia.match(/^\d{1,2}:\d{2}$/)) {
      const [hora, minuto] = horaLimpia.split(':');
      const horaFinal = `${hora.padStart(2, '0')}:${minuto}`;
      console.log('✅ Hora extraída (string):', horaFinal);
      return horaFinal;
    }
    
    // Si es string pero viene como ISO (1899-12-30T15:31:48.000Z)
    if (horaLimpia.includes('T') && horaLimpia.includes('Z')) {
      const fecha = new Date(horaLimpia);
      const horas = fecha.getHours().toString().padStart(2, '0');
      const minutos = fecha.getMinutes().toString().padStart(2, '0');
      const horaFinal = `${horas}:${minutos}`;
      console.log('✅ Hora extraída (string ISO):', horaFinal);
      return horaFinal;
    }
  }
  
  // Si es Date object
  if (horaInput instanceof Date) {
    const horas = horaInput.getHours().toString().padStart(2, '0');
    const minutos = horaInput.getMinutes().toString().padStart(2, '0');
    const horaFinal = `${horas}:${minutos}`;
    console.log('✅ Hora extraída (Date):', horaFinal);
    return horaFinal;
  }
  
  // Si es object pero no Date, intentar convertir a Date
  if (typeof horaInput === 'object' && horaInput !== null) {
    try {
      const fecha = new Date(horaInput);
      if (!isNaN(fecha.getTime())) {
        const horas = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');
        const horaFinal = `${horas}:${minutos}`;
        console.log('✅ Hora extraída (object convertido):', horaFinal);
        return horaFinal;
      }
    } catch (e) {
      console.log('❌ Error convirtiendo object a Date:', e);
    }
  }
  
  console.log('⚠️ No se pudo extraer hora de:', horaInput);
  return '';
};

// Función para convertir HH:MM a minutos desde medianoche
const horaAMinutos = (hora: string): number => {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
};

// Función para convertir minutos desde medianoche a HH:MM
const minutosAHora = (minutos: number): string => {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Función para obtener la duración de un servicio por su nombre
const obtenerDuracionServicio = (nombreServicio: string, contenido: any[]): number => {
  const servicio = contenido?.find(s => s.nombre === nombreServicio);
  if (servicio?.detalles?.duracion) {
    return parseInt(servicio.detalles.duracion.replace('min', '')) || 30;
  }
  
  // Duraciones por defecto basadas en nombres comunes
  const nombreLower = nombreServicio.toLowerCase();
  if (nombreLower.includes('pelo') && nombreLower.includes('barba')) return 25;
  if (nombreLower.includes('barba')) return 15;
  if (nombreLower.includes('pelo')) return 15;
  if (nombreLower.includes('diseño')) return 15;
  
  return 30; // Duración por defecto
};

// Función para generar todos los intervalos ocupados por un turno
const generarIntervalosOcupados = (horaInicio: string, duracionMinutos: number): string[] => {
  const intervalos = [];
  const inicioMinutos = horaAMinutos(horaInicio);
  
  // Generar intervalos de 15 minutos (el slot mínimo) dentro de la duración del servicio
  for (let i = 0; i < duracionMinutos; i += 15) {
    const minutoActual = inicioMinutos + i;
    intervalos.push(minutosAHora(minutoActual));
  }
  
  return intervalos;
};

// 🔐 API KEY SECRETA - CAMBIAR ESTE VALOR POR UNO ÚNICO
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

const CalendarioCustom: React.FC<CalendarioCustomProps> = ({ 
  servicioId, 
  responsable, 
  onReservaConfirmada 
}) => {
  const { contenido, config } = useBusiness();
  const { obtenerHorariosDisponibles } = useHorariosEspecialistas();
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | undefined>();
  const [horaSeleccionada, setHoraSeleccionada] = useState<string>('');
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [datosCliente, setDatosCliente] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });
  const [cargando, setCargando] = useState(false);
  const [eventos, setEventos] = useState<EventoReserva[]>([]);

  const servicio = contenido?.find(s => s.id === servicioId);
  const duracionMinutos = parseInt(servicio?.detalles?.duracion?.replace('min', '') || '30');

  // Cargar eventos desde Google Sheets
  const cargarEventos = useCallback(async () => {
    try {
      console.log('🔄 Cargando eventos desde Google Sheets...');
      const url = `${GOOGLE_APPS_SCRIPT_URL}?action=getEventos&apiKey=${API_SECRET_KEY}&timestamp=${Date.now()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('📅 Eventos RAW recibidos:', data.eventos);
        
        // Procesar eventos para normalizar formato de fecha
        const eventosProcesados = data.eventos.map((evento: any) => {
          console.log('🔍 Procesando evento original:', evento);
          
          // Normalizar fecha - puede venir como Date object o string
          let fechaNormalizada = evento.Fecha;
          if (typeof evento.Fecha === 'object' && evento.Fecha instanceof Date) {
            fechaNormalizada = evento.Fecha.toISOString().split('T')[0];
          } else if (typeof evento.Fecha === 'string' && evento.Fecha.includes('T')) {
            fechaNormalizada = evento.Fecha.split('T')[0];
          }

          const eventoNormalizado = {
            ...evento,
            Fecha: fechaNormalizada
          };
          
          console.log('✅ Evento normalizado:', eventoNormalizado);
          return eventoNormalizado;
        });
        
        console.log('📋 Todos los eventos procesados:', eventosProcesados);
        setEventos(eventosProcesados);
      } else {
        console.error('❌ Error del servidor:', data.error);
        setEventos([]);
      }
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
      setEventos([]);
    }
  }, []);

  // Función para obtener la fecha de hoy sin hora (solo año, mes, día)
  const obtenerFechaHoySoloFecha = () => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  };

  // Función para obtener la hora actual en formato HH:MM
  const obtenerHoraActual = () => {
    const ahora = new Date();
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  };

  // Función para comparar si una hora ya pasó (solo para el día actual)
  const yaEsHoraPasada = (hora: string, fechaSeleccionada: Date): boolean => {
    const fechaHoy = obtenerFechaHoySoloFecha();
    const fechaComparar = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), fechaSeleccionada.getDate());
    
    // Solo verificar si es el día actual
    if (fechaComparar.getTime() === fechaHoy.getTime()) {
      const horaActual = obtenerHoraActual();
      console.log(`⏰ Comparando horarios - Actual: ${horaActual}, Disponible: ${hora}`);
      return hora <= horaActual;
    }
    
    return false; // Para días futuros, ninguna hora ha pasado
  };

  // 🔧 NUEVA FUNCIÓN CORREGIDA: Verificar si un slot específico está ocupado
  const verificarSlotOcupado = (horaInicio: string, duracionNueva: number, eventosOcupados: EventoReserva[]): boolean => {
    const inicioNuevoMinutos = horaAMinutos(horaInicio);
    const finNuevoMinutos = inicioNuevoMinutos + duracionNueva;

    console.log(`🔍 Verificando slot ${horaInicio} (${duracionNueva}min) -> ${minutosAHora(finNuevoMinutos)}`);

    for (const evento of eventosOcupados) {
      const horaInicioExistente = extraerHora(evento["Hora Inicio"]);
      if (!horaInicioExistente) continue;

      // Obtener duración del servicio existente
      const duracionExistente = obtenerDuracionServicio(evento.Titulo_Evento, contenido || []);
      
      const inicioExistenteMinutos = horaAMinutos(horaInicioExistente);
      const finExistenteMinutos = inicioExistenteMinutos + duracionExistente;

      // Verificar superposición
      const haySuperposicion = inicioNuevoMinutos < finExistenteMinutos && finNuevoMinutos > inicioExistenteMinutos;
      
      if (haySuperposicion) {
        console.log(`❌ SUPERPOSICIÓN detectada con turno existente:`, {
          turnoExistente: `${horaInicioExistente} -> ${minutosAHora(finExistenteMinutos)} (${evento.Titulo_Evento})`,
          nuevoSlot: `${horaInicio} -> ${minutosAHora(finNuevoMinutos)}`
        });
        return true;
      }
    }

    console.log(`✅ Slot ${horaInicio} está libre`);
    return false;
  };

  // 🔧 NUEVA FUNCIÓN: Generar slots basados en la duración del servicio actual
  const generarSlotsParaServicio = (horaInicio: string, horaFin: string, duracionServicio: number): string[] => {
    const slots = [];
    const [inicioHoras, inicioMinutos] = horaInicio.split(':').map(Number);
    const [finHoras, finMinutos] = horaFin.split(':').map(Number);
    
    const inicioTotalMinutos = inicioHoras * 60 + inicioMinutos;
    const finTotalMinutos = finHoras * 60 + finMinutos;
    
    // Generar slots cada X minutos (donde X = duración del servicio)
    for (let minutos = inicioTotalMinutos; minutos + duracionServicio <= finTotalMinutos; minutos += duracionServicio) {
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;
      const slot = `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      slots.push(slot);
    }
    
    console.log(`📋 Slots generados para servicio de ${duracionServicio}min: ${horaInicio}-${horaFin}:`, slots);
    return slots;
  };

  // 🔧 LÓGICA CORREGIDA: Usar duración del servicio actual para generar slots
  useEffect(() => {
    if (!fechaSeleccionada) {
      setHorasDisponibles([]);
      return;
    }

    console.log('🔍 === INICIO CÁLCULO DE DISPONIBILIDAD (SLOTS DINÁMICOS) ===');
    console.log(`📅 Fecha: ${fechaSeleccionada.toISOString().split('T')[0]}`);
    console.log(`👤 Responsable: ${responsable}`);
    console.log(`⏱️ Servicio: ${servicio?.nombre} (${duracionMinutos}min)`);
    
    // 1. Obtener rango de horarios laborales básico (para conocer inicio y fin)
    const horariosLaboralesBase = obtenerHorariosDisponibles(responsable, fechaSeleccionada, 15);
    
    if (horariosLaboralesBase.length === 0) {
      console.log('❌ No hay horarios laborales configurados');
      setHorasDisponibles([]);
      return;
    }

    // 2. Obtener hora de inicio y fin del día laboral
    const horaInicioLaboral = horariosLaboralesBase[0];
    const horaFinLaboral = horariosLaboralesBase[horariosLaboralesBase.length - 1];
    
    // Agregar la duración del último slot para obtener el fin real
    const [ultimaHora, ultimoMinuto] = horaFinLaboral.split(':').map(Number);
    const finRealMinutos = ultimaHora * 60 + ultimoMinuto + 15; // 15 min del último slot base
    const finRealHoras = Math.floor(finRealMinutos / 60);
    const finRealMins = finRealMinutos % 60;
    const horaFinReal = `${finRealHoras.toString().padStart(2, '0')}:${finRealMins.toString().padStart(2, '0')}`;

    console.log(`⏰ Rango laboral: ${horaInicioLaboral} - ${horaFinReal}`);

    // 3. Generar slots basados en la duración del servicio actual
    const slotsBasadosEnServicio = generarSlotsParaServicio(horaInicioLaboral, horaFinReal, duracionMinutos);

    // 4. Filtrar eventos ocupados para esta fecha y responsable
    const fechaSeleccionadaStr = fechaSeleccionada.toISOString().split('T')[0];
    const eventosOcupados = eventos.filter(evento => {
      const esConfirmado = evento.Estado === 'Confirmado';
      const esDelResponsable = evento.Responsable === responsable;
      const esMismaFecha = evento.Fecha === fechaSeleccionadaStr;
      
      return esConfirmado && esDelResponsable && esMismaFecha;
    });

    console.log('📋 Turnos ocupados en esta fecha:', eventosOcupados);

    // 5. Verificar disponibilidad de cada slot
    const slotsDisponibles = [];
    
    for (const slot of slotsBasadosEnServicio) {
      // Verificar si ya pasó la hora (solo para hoy)
      if (yaEsHoraPasada(slot, fechaSeleccionada)) {
        console.log(`⏰ Slot ${slot} ya pasó`);
        continue;
      }

      // Verificar si este slot se superpone con algún turno ocupado
      const estaOcupado = verificarSlotOcupado(slot, duracionMinutos, eventosOcupados);
      
      if (!estaOcupado) {
        slotsDisponibles.push(slot);
      }
    }
    
    console.log('✅ === SLOTS FINALES DISPONIBLES ===:', slotsDisponibles);
    console.log('🔍 === FIN CÁLCULO DE DISPONIBILIDAD ===');
    
    setHorasDisponibles(slotsDisponibles);
  }, [fechaSeleccionada, eventos, responsable, duracionMinutos, obtenerHorariosDisponibles, contenido, servicio?.nombre]);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  const crearReserva = async () => {
    if (!fechaSeleccionada || !horaSeleccionada || !datosCliente.nombre || !datosCliente.email) {
      alert('Por favor completa todos los campos obligatorios (nombre y email)');
      return;
    }

    setCargando(true);

    // Calcular hora de fin
    const [horas, minutos] = horaSeleccionada.split(':').map(Number);
    const fechaFin = new Date();
    fechaFin.setHours(horas, minutos + duracionMinutos);
    const horaFin = `${fechaFin.getHours().toString().padStart(2, '0')}:${fechaFin.getMinutes().toString().padStart(2, '0')}`;

    const reservaData = {
      ID_Evento: `evento_${Date.now()}`,
      Titulo_Evento: servicio?.nombre || '',
      Nombre_Cliente: datosCliente.nombre,
      Email_Cliente: datosCliente.email,
      Fecha: fechaSeleccionada.toISOString().split('T')[0],
      Hora_Inicio: horaSeleccionada,
      Hora_Fin: horaFin,
      Descripcion: `${servicio?.nombre} - Tel: ${datosCliente.telefono || 'No proporcionado'}`,
      Estado: 'Confirmado',
      "Valor del turno": servicio?.precio_oferta || servicio?.precio || 0,
      "Servicios incluidos": servicio?.nombre || '',
      Responsable: responsable
    };

    try {
      const datos = {
        action: "crearReserva",
        apiKey: API_SECRET_KEY,
        data: JSON.stringify(reservaData)
      };

      const formData = new URLSearchParams();
      for (const key in datos) {
        formData.append(key, datos[key]);
      }

      console.log('🚀 Enviando nueva reserva');
      console.log('📦 Datos de reserva:', reservaData);

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert('¡Reserva confirmada! Te enviamos un email de confirmación.');
        // Recargar eventos para actualizar la disponibilidad
        await cargarEventos();
        onReservaConfirmada();
      } else {
        alert('Error al crear la reserva: ' + (result.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('❌ Error completo:', error);
      alert('Error al procesar la reserva: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Selecciona la fecha</h3>
        <Calendar
          mode="single"
          selected={fechaSeleccionada}
          onSelect={setFechaSeleccionada}
          disabled={(date) => {
            const fechaHoy = obtenerFechaHoySoloFecha();
            const fechaComparar = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            
            // Solo bloquear días anteriores al día de hoy (no el día actual)
            // Y bloquear domingos (día 0)
            return fechaComparar < fechaHoy || date.getDay() === 0;
          }}
          className="rounded-md border"
        />
      </div>

      {fechaSeleccionada && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Horarios disponibles</h3>
          <div className="grid grid-cols-3 gap-2">
            {horasDisponibles.map((hora) => (
              <Button
                key={hora}
                variant={horaSeleccionada === hora ? "default" : "outline"}
                onClick={() => setHoraSeleccionada(hora)}
                className="text-sm"
              >
                {hora}
              </Button>
            ))}
          </div>
          {horasDisponibles.length === 0 && (
            <p className="text-gray-500 text-sm">No hay horarios disponibles para esta fecha</p>
          )}
        </div>
      )}

      {horaSeleccionada && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Datos del cliente</h3>
          
          <input
            type="text"
            placeholder="Nombre completo *"
            value={datosCliente.nombre}
            onChange={(e) => setDatosCliente({...datosCliente, nombre: e.target.value})}
            className="w-full p-2 border rounded-md"
            required
          />
          
          <input
            type="email"
            placeholder="Email *"
            value={datosCliente.email}
            onChange={(e) => setDatosCliente({...datosCliente, email: e.target.value})}
            className="w-full p-2 border rounded-md"
            required
          />
          
          <input
            type="tel"
            placeholder="Teléfono (opcional)"
            value={datosCliente.telefono}
            onChange={(e) => setDatosCliente({...datosCliente, telefono: e.target.value})}
            className="w-full p-2 border rounded-md"
          />

          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-semibold">Resumen de la reserva:</h4>
            <p><strong>Servicio:</strong> {servicio?.nombre}</p>
            <p><strong>Fecha:</strong> {fechaSeleccionada.toLocaleDateString()}</p>
            <p><strong>Hora:</strong> {horaSeleccionada}</p>
            <p><strong>Duración:</strong> {duracionMinutos} minutos</p>
            <p><strong>Especialista:</strong> {responsable}</p>
            <p><strong>Precio:</strong> {config?.moneda_simbolo}{servicio?.precio_oferta || servicio?.precio}</p>
          </div>

          <Button 
            onClick={crearReserva} 
            disabled={cargando || !datosCliente.nombre || !datosCliente.email}
            className="w-full"
          >
            {cargando ? 'Procesando...' : 'Confirmar Reserva'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CalendarioCustom;
