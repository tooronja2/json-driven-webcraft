
import { useState, useEffect, useCallback } from 'react';

interface HorarioEspecialista {
  Responsable: string;
  Dia_Semana: string; // "Lunes", "Martes", etc.
  Hora_Inicio: string | number; // "09:00" o 9
  Hora_Fin: string | number; // "13:00" o 13
  Activo: boolean;
  Tipo: string; // "normal"
}

interface DiaLibre {
  Responsable: string;
  Dia: string; // "17/06/2025"
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

// Función para convertir DD/MM/YYYY a YYYY-MM-DD
const convertirFechaAISO = (fechaDDMMYYYY: string): string => {
  if (!fechaDDMMYYYY) return '';
  
  // Si ya está en formato ISO (YYYY-MM-DD)
  if (fechaDDMMYYYY.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return fechaDDMMYYYY;
  }
  
  // Si está en formato DD/MM/YYYY
  if (fechaDDMMYYYY.includes('/')) {
    const partes = fechaDDMMYYYY.trim().split('/');
    if (partes.length === 3) {
      const [dia, mes, año] = partes;
      return `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
  }
  
  return fechaDDMMYYYY;
};

export const useHorariosEspecialistas = () => {
  const [horarios, setHorarios] = useState<HorarioEspecialista[]>([]);
  const [diasLibres, setDiasLibres] = useState<DiaLibre[]>([]);
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

  const cargarDiasLibres = async () => {
    try {
      console.log('🔄 Cargando días libres...');
      
      const url = `${GOOGLE_APPS_SCRIPT_URL}?action=getDiasLibres&timestamp=${Date.now()}`;
      
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
        console.log('🚫 Días libres recibidos:', data.diasLibres);
        setDiasLibres(data.diasLibres || []);
      } else {
        console.error('❌ Error del servidor:', data.error);
        setDiasLibres([]);
      }
    } catch (error) {
      console.error('❌ Error cargando días libres:', error);
      setDiasLibres([]);
    }
  };

  const obtenerHorariosDisponibles = useCallback((responsable: string, fecha: Date, duracionMinutos: number): string[] => {
    const fechaStr = fecha.toISOString().split('T')[0]; // Formato ISO: YYYY-MM-DD
    const diaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()];
    
    console.log(`🕐 === INICIO BÚSQUEDA HORARIOS ===`);
    console.log(`👤 Responsable: ${responsable}`);
    console.log(`📅 Fecha: ${fechaStr} (${diaSemana})`);
    console.log(`⏱️ Duración: ${duracionMinutos} minutos`);
    
    // 🔍 PASO 1: Verificar si este responsable tiene día libre en esta fecha específica
    console.log(`🔍 === VERIFICANDO DÍAS LIBRES PARA ${fechaStr} ===`);
    const tieneDiaLibre = diasLibres.some(diaLibre => {
      const esMismoResponsable = diaLibre.Responsable === responsable;
      const fechaLibreISO = convertirFechaAISO(diaLibre.Dia);
      const esMismaFecha = fechaLibreISO === fechaStr;
      
      console.log(`🔍 Verificando día libre:`, {
        responsable: diaLibre.Responsable,
        diaOriginal: diaLibre.Dia,
        diaConvertido: fechaLibreISO,
        fechaBuscada: fechaStr,
        esMismoResponsable,
        esMismaFecha
      });
      
      return esMismoResponsable && esMismaFecha;
    });

    if (tieneDiaLibre) {
      console.log(`🚫 ${responsable} tiene día libre el ${fechaStr}`);
      console.log(`🕐 === FIN BÚSQUEDA (DÍA LIBRE) ===`);
      return [];
    }

    // ✅ PASO 2: Buscar horario REGULAR para este día de la semana
    console.log(`✅ NO hay día libre para ${fechaStr}, buscando horario regular para ${diaSemana}`);
    
    const configuracionRegular = horarios.find(h => {
      const esElResponsable = h.Responsable === responsable;
      const esMismoDiaSemana = h.Dia_Semana === diaSemana;
      const esHorarioNormal = h.Tipo === 'normal';
      const estaActivo = h.Activo;
      
      console.log(`🔍 Evaluando horario:`, {
        responsable: h.Responsable,
        diaSemana: h.Dia_Semana,
        tipo: h.Tipo,
        activo: h.Activo,
        cumpleCondiciones: esElResponsable && esMismoDiaSemana && esHorarioNormal && estaActivo
      });
      
      return esElResponsable && esMismoDiaSemana && esHorarioNormal && estaActivo;
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
  }, [horarios, diasLibres]);

  useEffect(() => {
    cargarHorarios();
    cargarDiasLibres();
  }, []);

  return {
    horarios,
    diasLibres,
    cargando,
    cargarHorarios,
    cargarDiasLibres,
    obtenerHorariosDisponibles
  };
};
