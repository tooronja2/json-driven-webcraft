
import { useState, useEffect, useCallback } from 'react';

interface HorarioEspecialista {
  Responsable: string;
  Dia_Semana: string; // "Lunes", "Martes", etc.
  Hora_Inicio: string | number; // "09:00" o 9
  Hora_Fin: string | number; // "13:00" o 13
  Activo: boolean;
  Tipo: string; // "normal", "vacaciones", "libre"
  Fecha_Especifica?: string; // "17/06/2025" o "2025-06-17" para casos específicos
}

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxbeXocgGONBQyWJoxAanotZEXGX6-Au4ttxqRamJjXOLlzQYhGDIXi0N0-a6ka2_4u/exec';

// Función para normalizar hora a formato "HH:MM"
const normalizarHora = (hora: string | number): string => {
  if (typeof hora === 'number') {
    return `${hora.toString().padStart(2, '0')}:00`;
  }
  if (typeof hora === 'string' && hora.includes(':')) {
    return hora;
  }
  if (typeof hora === 'string' && !hora.includes(':')) {
    const numeroHora = parseInt(hora);
    return `${numeroHora.toString().padStart(2, '0')}:00`;
  }
  return hora.toString();
};

// Función para normalizar fecha a formato ISO (YYYY-MM-DD)
const normalizarFechaAISO = (fecha: string): string => {
  if (!fecha) return '';
  
  // Si ya está en formato ISO (YYYY-MM-DD)
  if (fecha.includes('-') && fecha.length === 10) {
    return fecha;
  }
  
  // Si está en formato DD/MM/YYYY
  if (fecha.includes('/')) {
    const partes = fecha.split('/');
    if (partes.length === 3) {
      const [dia, mes, año] = partes;
      return `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
  }
  
  return fecha;
};

// Función para comparar fechas independientemente del formato
const sonFechasIguales = (fecha1: string, fecha2: string): boolean => {
  if (!fecha1 || !fecha2) return false;
  
  const fechaISO1 = normalizarFechaAISO(fecha1);
  const fechaISO2 = normalizarFechaAISO(fecha2);
  
  return fechaISO1 === fechaISO2;
};

export const useHorariosEspecialistas = () => {
  const [horarios, setHorarios] = useState<HorarioEspecialista[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargarHorarios = async () => {
    try {
      setCargando(true);
      console.log('🔄 Cargando horarios de especialistas...');
      
      const url = `${GOOGLE_APPS_SCRIPT_URL}?action=getHorarios&timestamp=${Date.now()}`;
      
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
        console.log('📅 Horarios recibidos:', data.horarios);
        setHorarios(data.horarios || []);
      } else {
        console.error('❌ Error del servidor:', data.error);
        setHorarios([]);
      }
    } catch (error) {
      console.error('❌ Error cargando horarios:', error);
      setHorarios([]);
    } finally {
      setCargando(false);
    }
  };

  // Función corregida para manejar fechas específicas correctamente
  const obtenerHorariosDisponibles = useCallback((responsable: string, fecha: Date, duracionMinutos: number): string[] => {
    const fechaStr = fecha.toISOString().split('T')[0]; // Formato ISO: YYYY-MM-DD
    const diaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()];
    
    console.log(`🕐 === INICIO BÚSQUEDA HORARIOS ===`);
    console.log(`👤 Responsable: ${responsable}`);
    console.log(`📅 Fecha: ${fechaStr} (${diaSemana})`);
    console.log(`⏱️ Duración: ${duracionMinutos} minutos`);
    console.log(`📋 Total horarios disponibles:`, horarios.length);

    // 🔍 PASO 1: Buscar si existe una configuración ESPECÍFICA para esta fecha EXACTA
    const excepcionEspecifica = horarios.find(h => {
      const esElResponsable = h.Responsable === responsable;
      const tieneFechaEspecifica = h.Fecha_Especifica && h.Fecha_Especifica.trim() !== '';
      
      if (!esElResponsable || !tieneFechaEspecifica) {
        return false;
      }
      
      // Comparar fechas usando nuestra función normalizada
      const esMismaFecha = sonFechasIguales(h.Fecha_Especifica!, fechaStr);
      
      console.log(`🔍 Revisando posible excepción:`, {
        responsable: h.Responsable,
        fechaEspecifica: h.Fecha_Especifica,
        fechaBuscada: fechaStr,
        sonIguales: esMismaFecha,
        tipo: h.Tipo,
        activo: h.Activo
      });
      
      return esMismaFecha;
    });

    // 🚫 PASO 2: Si hay configuración específica para esta fecha exacta, NO TRABAJAR
    if (excepcionEspecifica) {
      console.log(`❌ EXCEPCIÓN DETECTADA: ${responsable} tiene configuración específica para ${fechaStr}`);
      console.log(`🚫 Configuración encontrada:`, excepcionEspecifica);
      console.log(`🕐 === FIN BÚSQUEDA (FECHA ESPECÍFICA - SIN HORARIOS) ===`);
      return [];
    }

    // ✅ PASO 3: NO hay excepción específica, buscar horario REGULAR para este día de la semana
    console.log(`✅ NO hay excepción para ${fechaStr}, buscando horario regular para ${diaSemana}`);
    
    const configuracionRegular = horarios.find(h => {
      const esElResponsable = h.Responsable === responsable;
      const esMismoDiaSemana = h.Dia_Semana === diaSemana;
      const esHorarioNormal = h.Tipo === 'normal';
      const estaActivo = h.Activo;
      // IMPORTANTE: Para horarios regulares, NO debe tener fecha específica
      const noTieneFechaEspecifica = !h.Fecha_Especifica || h.Fecha_Especifica.trim() === '';
      
      console.log(`🔍 Revisando horario regular:`, {
        responsable: h.Responsable,
        diaSemana: h.Dia_Semana,
        tipo: h.Tipo,
        activo: h.Activo,
        fechaEspecifica: h.Fecha_Especifica,
        cumpleCondiciones: esElResponsable && esMismoDiaSemana && esHorarioNormal && estaActivo && noTieneFechaEspecifica
      });
      
      return esElResponsable && esMismoDiaSemana && esHorarioNormal && estaActivo && noTieneFechaEspecifica;
    });

    if (!configuracionRegular) {
      console.log(`❌ No hay horario regular configurado para ${responsable} los ${diaSemana}`);
      console.log(`🕐 === FIN BÚSQUEDA (SIN CONFIGURACIÓN REGULAR) ===`);
      return [];
    }

    console.log(`✅ Horario regular encontrado para ${diaSemana}:`, configuracionRegular);

    // ✅ Normalizar horarios antes de procesarlos
    const horaInicioNormalizada = normalizarHora(configuracionRegular.Hora_Inicio);
    const horaFinNormalizada = normalizarHora(configuracionRegular.Hora_Fin);

    console.log(`⏰ Horario normalizado: ${horaInicioNormalizada} - ${horaFinNormalizada}`);

    // Generar slots disponibles dentro del rango
    const [horaInicio, minutoInicio] = horaInicioNormalizada.split(':').map(Number);
    const [horaFin, minutoFin] = horaFinNormalizada.split(':').map(Number);
    
    const slots = [];
    let horaActual = horaInicio;
    let minutoActual = minutoInicio;

    while (horaActual < horaFin || (horaActual === horaFin && minutoActual < minutoFin)) {
      const slot = `${horaActual.toString().padStart(2, '0')}:${minutoActual.toString().padStart(2, '0')}`;
      slots.push(slot);

      // Avanzar por la duración del servicio
      minutoActual += duracionMinutos;
      if (minutoActual >= 60) {
        horaActual += Math.floor(minutoActual / 60);
        minutoActual = minutoActual % 60;
      }
    }

    console.log(`📋 Slots generados para ${responsable}:`, slots);
    console.log(`🕐 === FIN BÚSQUEDA (CON HORARIOS REGULARES) ===`);
    return slots;
  }, [horarios]);

  useEffect(() => {
    cargarHorarios();
  }, []);

  return {
    horarios,
    cargando,
    cargarHorarios,
    obtenerHorariosDisponibles
  };
};
