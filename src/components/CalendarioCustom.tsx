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
  // Nueva prop para forzar recarga externa
  forceReload?: number;
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

// Función para convertir hora "HH:MM" a minutos desde las 00:00
const horaAMinutos = (hora: string): number => {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
};

// Función para verificar si un horario se solapa con un turno existente
const verificarSolapamiento = (
  horaInicioNueva: string,
  duracionNueva: number,
  horaInicioExistente: string,
  horaFinExistente: string
): boolean => {
  const inicioNuevaMin = horaAMinutos(horaInicioNueva);
  const finNuevaMin = inicioNuevaMin + duracionNueva;
  const inicioExistenteMin = horaAMinutos(horaInicioExistente);
  const finExistenteMin = horaAMinutos(horaFinExistente);

  // Verificar si hay solapamiento
  const haySolapamiento = !(finNuevaMin <= inicioExistenteMin || inicioNuevaMin >= finExistenteMin);
  
  console.log(`🔍 Verificando solapamiento:
    Nueva: ${horaInicioNueva} - ${inicioNuevaMin + duracionNueva} min (${duracionNueva} min)
    Existente: ${horaInicioExistente} - ${horaFinExistente} (${inicioExistenteMin}-${finExistenteMin} min)
    Solapamiento: ${haySolapamiento}`);
  
  return haySolapamiento;
};

// 🔐 API KEY SECRETA - CAMBIAR ESTE VALOR POR UNO ÚNICO
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

const CalendarioCustom: React.FC<CalendarioCustomProps> = ({ 
  servicioId, 
  responsable, 
  onReservaConfirmada,
  forceReload = 0
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
  // Nuevo estado para forzar recargas
  const [ultimaRecarga, setUltimaRecarga] = useState(0);

  const servicio = contenido?.find(s => s.id === servicioId);
  const duracionMinutos = parseInt(servicio?.detalles?.duracion?.replace('min', '') || '30');

  // Cargar eventos desde Google Sheets con FORZAR RELOAD MEJORADO
  const cargarEventos = useCallback(async (forzarReload = false) => {
    try {
      console.log('🔄 === CARGANDO EVENTOS DESDE GOOGLE SHEETS ===');
      console.log('🔄 Forzar reload:', forzarReload);
      
      // Agregar múltiples parámetros únicos para evitar cache
      const timestamp = Date.now();
      const randomParam = Math.random().toString(36).substring(7);
      const reloadParam = forzarReload ? '&force=true' : '';
      const ultimaRecargaParam = `&lastReload=${ultimaRecarga}`;
      
      const url = `${GOOGLE_APPS_SCRIPT_URL}?action=getEventos&apiKey=${API_SECRET_KEY}&timestamp=${timestamp}&rand=${randomParam}${reloadParam}${ultimaRecargaParam}`;
      
      console.log('📡 URL de carga:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('📅 Eventos RAW recibidos:', data.eventos?.length || 0);
        
        // Procesar eventos para normalizar formato de fecha
        const eventosProcesados = (data.eventos || []).map((evento: any) => {
          console.log('🔍 Procesando evento:', evento.Nombre_Cliente, evento.Estado, evento.Responsable);
          
          // Normalizar fecha - puede venir como Date object o string
          let fechaNormalizada = evento.Fecha;
          if (typeof evento.Fecha === 'object' && evento.Fecha instanceof Date) {
            fechaNormalizada = evento.Fecha.toISOString().split('T')[0];
          } else if (typeof evento.Fecha === 'string' && evento.Fecha.includes('T')) {
            fechaNormalizada = evento.Fecha.split('T')[0];
          }

          return {
            ...evento,
            Fecha: fechaNormalizada
          };
        });
        
        console.log('✅ Total eventos procesados:', eventosProcesados.length);
        setEventos(eventosProcesados);
        setUltimaRecarga(Date.now());
      } else {
        console.error('❌ Error del servidor:', data.error);
        setEventos([]);
      }
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
      setEventos([]);
    }
  }, [ultimaRecarga]);

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

  // Filtrado de horarios MEJORADO con LOGS DETALLADOS
  useEffect(() => {
    if (!fechaSeleccionada) {
      setHorasDisponibles([]);
      return;
    }

    console.log('🔍 === INICIO FILTRADO DE HORARIOS DETALLADO ===');
    console.log('🎯 Responsable buscado:', responsable);
    console.log('📅 Fecha seleccionada:', fechaSeleccionada.toISOString().split('T')[0]);
    console.log('⏱️ Duración nuevo servicio:', duracionMinutos, 'minutos');
    console.log('📊 Total eventos cargados:', eventos.length);
    
    // 1. Obtener horarios laborales del especialista para esta fecha
    const horariosLaborales = obtenerHorariosDisponibles(responsable, fechaSeleccionada, duracionMinutos);
    
    if (horariosLaborales.length === 0) {
      console.log('❌ No hay horarios laborales configurados');
      setHorasDisponibles([]);
      return;
    }

    console.log('⏰ Horarios laborales base:', horariosLaborales);

    // 2. Filtrar eventos ocupados para esta fecha y responsable - SOLO EXCLUIR CANCELADOS
    const fechaSeleccionadaStr = fechaSeleccionada.toISOString().split('T')[0];
    
    console.log('🔍 === FILTRANDO EVENTOS PARA LA FECHA ===');
    const eventosRelevantes = eventos.filter(evento => {
      const esDelResponsable = evento.Responsable === responsable;
      const esMismaFecha = evento.Fecha === fechaSeleccionadaStr;
      const noEstaCancelado = evento.Estado !== 'Cancelado';
      
      console.log(`📋 Evaluando evento: ${evento.Nombre_Cliente}`, {
        responsable: evento.Responsable,
        fecha: evento.Fecha,
        estado: evento.Estado,
        esDelResponsable,
        esMismaFecha,
        noEstaCancelado,
        esRelevante: esDelResponsable && esMismaFecha && noEstaCancelado
      });
      
      const esRelevante = esDelResponsable && esMismaFecha && noEstaCancelado;
      
      if (esRelevante) {
        console.log('✅ EVENTO QUE OCUPA HORARIO:', {
          nombre: evento.Nombre_Cliente,
          estado: evento.Estado,
          horaInicio: evento["Hora Inicio"],
          horaFin: evento["Hora Fin"],
          responsable: evento.Responsable
        });
      }
      
      return esRelevante;
    });

    console.log(`✅ EVENTOS ACTIVOS ENCONTRADOS: ${eventosRelevantes.length}`);

    // 3. Verificar solapamientos considerando duraciones reales
    const disponibles = horariosLaborales.filter(hora => {
      // Verificar si la hora ya pasó
      const yaPaso = yaEsHoraPasada(hora, fechaSeleccionada);
      if (yaPaso) {
        console.log(`⏰ Hora ${hora} ya pasó - DESCARTADA`);
        return false;
      }

      // Verificar solapamientos con eventos existentes
      const tieneSolapamiento = eventosRelevantes.some(evento => {
        const horaInicioExistente = extraerHora(evento["Hora Inicio"]);
        const horaFinExistente = extraerHora(evento["Hora Fin"]);
        
        if (!horaInicioExistente || !horaFinExistente) {
          console.log('⚠️ No se pudieron extraer horas del evento:', evento.Nombre_Cliente);
          return false;
        }

        const solapamiento = verificarSolapamiento(hora, duracionMinutos, horaInicioExistente, horaFinExistente);
        
        if (solapamiento) {
          console.log(`❌ CONFLICTO DETECTADO: Nueva cita ${hora} (${duracionMinutos}min) vs Turno existente ${horaInicioExistente}-${horaFinExistente} (${evento.Nombre_Cliente} - ${evento.Estado})`);
        }
        
        return solapamiento;
      });

      const disponible = !tieneSolapamiento;
      console.log(`⏱️ Hora ${hora}: ${disponible ? 'DISPONIBLE' : 'OCUPADA'}`);
      
      return disponible;
    });
    
    console.log('✅ === HORARIOS FINALES DISPONIBLES ===:', disponibles);
    console.log('🔍 === FIN FILTRADO DE HORARIOS ===');
    
    setHorasDisponibles(disponibles);
  }, [fechaSeleccionada, eventos, responsable, duracionMinutos, obtenerHorariosDisponibles]);

  // EFECTO PARA RECARGAS EXTERNAS (desde panel admin)
  useEffect(() => {
    if (forceReload > 0) {
      console.log('🔄 RECARGA EXTERNA SOLICITADA desde panel admin');
      cargarEventos(true);
    }
  }, [forceReload, cargarEventos]);

  // Cargar eventos al montar
  useEffect(() => {
    console.log('🚀 CARGA INICIAL DE EVENTOS');
    cargarEventos(true);
  }, [cargarEventos]);

  // Recargar eventos cada vez que se selecciona una fecha
  useEffect(() => {
    if (fechaSeleccionada) {
      console.log('📅 FECHA CAMBIADA - Recargando eventos...');
      cargarEventos(true);
    }
  }, [fechaSeleccionada, cargarEventos]);

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
        await cargarEventos(true);
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
