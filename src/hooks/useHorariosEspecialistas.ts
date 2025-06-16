
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
    
    console.log(`🕐 Obteniendo horarios para ${responsable} el ${diaSemana} (${fechaStr})`);

    // 🔍 PASO 1: Buscar configuración específica EXACTA para esta fecha
    const configuracionEspecifica = horarios.find(h => 
      h.Responsable === responsable && 
      h.Fecha_Especifica && 
      sonFechasIguales(h.Fecha_Especifica, fechaStr) &&
      h.Activo
    );

    console.log('🔍 Configuración específica encontrada:', configuracionEspecifica);

    // 🚫 PASO 2: Si hay configuración específica para esta fecha exacta
    if (configuracionEspecifica) {
      console.log(`📅 Aplicando configuración específica para ${fechaStr} (Tipo: ${configuracionEspecifica.Tipo})`);
      
      // Si es libre o vacaciones para esta fecha específica, NO HAY horarios
      if (configuracionEspecifica.Tipo === 'vacaciones' || configuracionEspecifica.Tipo === 'libre') {
        console.log(`❌ ${responsable} NO trabaja el ${fechaStr} (${configuracionEspecifica.Tipo} - fecha específica)`);
        return [];
      }

      // Si es normal para esta fecha específica, usar esos horarios
      if (configuracionEspecifica.Tipo === 'normal') {
        console.log(`✅ Usando horario específico normal para ${fechaStr}`);
        
        const horaInicioNormalizada = normalizarHora(configuracionEspecifica.Hora_Inicio);
        const horaFinNormalizada = normalizarHora(configuracionEspecifica.Hora_Fin);

        console.log(`✅ Horario específico: ${horaInicioNormalizada} - ${horaFinNormalizada}`);

        // Generar slots para configuración específica
        const [horaInicio, minutoInicio] = horaInicioNormalizada.split(':').map(Number);
        const [horaFin, minutoFin] = horaFinNormalizada.split(':').map(Number);
        
        const slots = [];
        let horaActual = horaInicio;
        let minutoActual = minutoInicio;

        while (horaActual < horaFin || (horaActual === horaFin && minutoActual < minutoFin)) {
          const slot = `${horaActual.toString().padStart(2, '0')}:${minutoActual.toString().padStart(2, '0')}`;
          slots.push(slot);

          minutoActual += duracionMinutos;
          if (minutoActual >= 60) {
            horaActual += Math.floor(minutoActual / 60);
            minutoActual = minutoActual % 60;
          }
        }

        console.log(`📋 Slots generados (específicos) para ${responsable}:`, slots);
        return slots;
      }
    }

    // 📅 PASO 3: NO hay configuración específica para esta fecha, usar horario regular del día de la semana
    console.log(`📅 No hay configuración específica para ${fechaStr}, buscando horario regular para ${diaSemana}`);
    
    const configuracionDia = horarios.find(h => 
      h.Responsable === responsable && 
      h.Dia_Semana === diaSemana &&
      h.Tipo === 'normal' &&
      h.Activo &&
      !h.Fecha_Especifica // Solo horarios generales, NO específicos
    );

    if (!configuracionDia) {
      console.log(`❌ No hay horario regular configurado para ${responsable} los ${diaSemana}`);
      return [];
    }

    // ✅ Normalizar horarios antes de procesarlos
    const horaInicioNormalizada = normalizarHora(configuracionDia.Hora_Inicio);
    const horaFinNormalizada = normalizarHora(configuracionDia.Hora_Fin);

    console.log(`✅ Horario regular encontrado: ${horaInicioNormalizada} - ${horaFinNormalizada}`);

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

    console.log(`📋 Slots generados (regulares) para ${responsable}:`, slots);
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
