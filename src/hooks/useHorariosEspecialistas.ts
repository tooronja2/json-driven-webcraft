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

  // Memoizar la función para evitar recreaciones en cada render
  const obtenerHorariosDisponibles = useCallback((responsable: string, fecha: Date, duracionMinutos: number): string[] => {
    const fechaStr = fecha.toISOString().split('T')[0]; // Formato ISO: YYYY-MM-DD
    const diaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()];
    
    console.log(`🕐 === INICIO BÚSQUEDA HORARIOS ===`);
    console.log(`👤 Responsable: ${responsable}`);
    console.log(`📅 Fecha: ${fechaStr} (${diaSemana})`);
    console.log(`⏱️ Duración: ${duracionMinutos} minutos`);

    // 🔍 PASO 1: Verificar si existe configuración específica para esta fecha EXACTA
    const configuracionEspecificaFecha = horarios.find(h => {
      const tieneResponsable = h.Responsable === responsable;
      const tieneFechaEspecifica = h.Fecha_Especifica && h.Fecha_Especifica.trim() !== '';
      const esMismaFecha = tieneFechaEspecifica && sonFechasIguales(h.Fecha_Especifica!, fechaStr);
      const estaActivo = h.Activo;
      
      console.log(`🔍 Revisando configuración específica:`, {
        responsable: h.Responsable,
        fechaEspecifica: h.Fecha_Especifica,
        tipo: h.Tipo,
        tieneResponsable,
        tieneFechaEspecifica,
        esMismaFecha,
        estaActivo
      });
      
      return tieneResponsable && tieneFechaEspecifica && esMismaFecha && estaActivo;
    });

    console.log('📋 Configuración específica encontrada:', configuracionEspecificaFecha);

    // 🚫 PASO 2: Si hay configuración específica para esta fecha exacta, NO TRABAJAR
    if (configuracionEspecificaFecha) {
      console.log(`❌ EXCEPCIÓN DETECTADA: ${responsable} NO trabaja el ${fechaStr} (fecha específica configurada)`);
      console.log(`🚫 Tipo de excepción: ${configuracionEspecificaFecha.Tipo}`);
      console.log(`🕐 === FIN BÚSQUEDA (SIN HORARIOS) ===`);
      return [];
    }

    // ✅ PASO 3: NO hay configuración específica, buscar horario REGULAR para este día de la semana
    console.log(`📅 No hay excepción para ${fechaStr}, buscando horario regular para ${diaSemana}`);
    
    const configuracionRegular = horarios.find(h => {
      const tieneResponsable = h.Responsable === responsable;
      const esMismoDia = h.Dia_Semana === diaSemana;
      const esNormal = h.Tipo === 'normal';
      const estaActivo = h.Activo;
      const noTieneFechaEspecifica = !h.Fecha_Especifica || h.Fecha_Especifica.trim() === '';
      
      console.log(`🔍 Revisando configuración regular:`, {
        responsable: h.Responsable,
        diaSemana: h.Dia_Semana,
        tipo: h.Tipo,
        fechaEspecifica: h.Fecha_Especifica,
        tieneResponsable,
        esMismoDia,
        esNormal,
        estaActivo,
        noTieneFechaEspecifica
      });
      
      return tieneResponsable && esMismoDia && esNormal && estaActivo && noTieneFechaEspecifica;
    });

    if (!configuracionRegular) {
      console.log(`❌ No hay horario regular configurado para ${responsable} los ${diaSemana}`);
      console.log(`🕐 === FIN BÚSQUEDA (SIN CONFIGURACIÓN) ===`);
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
    console.log(`🕐 === FIN BÚSQUEDA (CON HORARIOS) ===`);
    return slots;
  }, [horarios]); // Solo recrear cuando cambie horarios

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
