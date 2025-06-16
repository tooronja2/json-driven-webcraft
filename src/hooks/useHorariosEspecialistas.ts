
import { useState, useEffect } from 'react';

interface HorarioEspecialista {
  Responsable: string;
  Dia_Semana: string; // "Lunes", "Martes", etc.
  Hora_Inicio: string; // "09:00"
  Hora_Fin: string; // "13:00"
  Activo: boolean;
  Tipo: string; // "normal", "vacaciones", "libre"
  Fecha_Especifica?: string; // "2025-06-23" para casos específicos
}

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxZV2OgLOAeUrfAvopyfxGLLgHSMzPxFUaC-EAqsWsVMb_07qxSA-MyfIcEEq9tcqlR/exec';

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

  // Generar horarios disponibles para un especialista en una fecha específica
  const obtenerHorariosDisponibles = (responsable: string, fecha: Date, duracionMinutos: number): string[] => {
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

    console.log(`✅ Horario encontrado: ${configuracionDia.Hora_Inicio} - ${configuracionDia.Hora_Fin}`);

    // Generar slots disponibles dentro del rango
    const [horaInicio, minutoInicio] = configuracionDia.Hora_Inicio.split(':').map(Number);
    const [horaFin, minutoFin] = configuracionDia.Hora_Fin.split(':').map(Number);
    
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
  };

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
