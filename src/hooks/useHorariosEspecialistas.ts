
import { useState, useEffect, useCallback } from 'react';

interface HorarioEspecialista {
  Responsable: string;
  Dia_Semana: string; // "Lunes", "Martes", etc.
  Hora_Inicio: string | number; // "09:00" o 9
  Hora_Fin: string | number; // "13:00" o 13
  Activo: boolean;
  Tipo: string; // "normal", "vacaciones", "libre"
  Fecha_Especifica?: string; // "2025-06-23" para casos específicos
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
    const fechaStr = fecha.toISOString().split('T')[0];
    const diaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()];
    
    console.log(`🕐 Obteniendo horarios para ${responsable} el ${diaSemana} (${fechaStr})`);

    // Buscar si hay una configuración específica para esta fecha
    const configuracionEspecifica = horarios.find(h => 
      h.Responsable === responsable && 
      h.Fecha_Especifica === fechaStr &&
      h.Activo
    );

    // Si está de vacaciones o libre ese día específico
    if (configuracionEspecifica && (configuracionEspecifica.Tipo === 'vacaciones' || configuracionEspecifica.Tipo === 'libre')) {
      console.log(`❌ ${responsable} no trabaja el ${fechaStr} (${configuracionEspecifica.Tipo})`);
      return [];
    }

    // Buscar horario regular para ese día de la semana
    let configuracionDia = horarios.find(h => 
      h.Responsable === responsable && 
      h.Dia_Semana === diaSemana &&
      h.Tipo === 'normal' &&
      h.Activo
    );

    // Si hay configuración específica para esa fecha y es normal, usarla
    if (configuracionEspecifica && configuracionEspecifica.Tipo === 'normal') {
      configuracionDia = configuracionEspecifica;
    }

    if (!configuracionDia) {
      console.log(`❌ No hay horario configurado para ${responsable} los ${diaSemana}`);
      return [];
    }

    // ✅ Normalizar horarios antes de procesarlos
    const horaInicioNormalizada = normalizarHora(configuracionDia.Hora_Inicio);
    const horaFinNormalizada = normalizarHora(configuracionDia.Hora_Fin);

    console.log(`✅ Horario encontrado: ${horaInicioNormalizada} - ${horaFinNormalizada}`);

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
