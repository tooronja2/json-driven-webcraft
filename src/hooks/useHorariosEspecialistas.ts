
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

// Función CORREGIDA para normalizar fecha a formato ISO (YYYY-MM-DD)
const normalizarFechaAISO = (fecha: string): string => {
  if (!fecha) return '';
  
  console.log(`🔄 Normalizando fecha: "${fecha}"`);
  
  // Si es un Date ISO string (2025-06-17T03:00:00.000Z)
  if (fecha.includes('T') && fecha.includes('Z')) {
    const fechaISO = fecha.split('T')[0];
    console.log(`✅ Fecha ISO extraída: "${fechaISO}"`);
    return fechaISO;
  }
  
  // Si ya está en formato ISO (YYYY-MM-DD)
  if (fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
    console.log(`✅ Fecha ya en formato ISO: "${fecha}"`);
    return fecha;
  }
  
  // Si está en formato DD/MM/YYYY
  if (fecha.includes('/')) {
    const partes = fecha.split('/');
    if (partes.length === 3) {
      const [dia, mes, año] = partes;
      const fechaISO = `${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
      console.log(`✅ Fecha convertida de DD/MM/YYYY a ISO: "${fechaISO}"`);
      return fechaISO;
    }
  }
  
  console.log(`⚠️ No se pudo normalizar la fecha: "${fecha}"`);
  return fecha;
};

// Función CORREGIDA para comparar fechas independientemente del formato
const sonFechasIguales = (fecha1: string, fecha2: string): boolean => {
  if (!fecha1 || !fecha2) return false;
  
  const fechaISO1 = normalizarFechaAISO(fecha1);
  const fechaISO2 = normalizarFechaAISO(fecha2);
  
  console.log(`🔍 Comparando fechas: "${fechaISO1}" vs "${fechaISO2}" = ${fechaISO1 === fechaISO2}`);
  
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

  // Función CORREGIDA para manejar fechas específicas correctamente
  const obtenerHorariosDisponibles = useCallback((responsable: string, fecha: Date, duracionMinutos: number): string[] => {
    const fechaStr = fecha.toISOString().split('T')[0]; // Formato ISO: YYYY-MM-DD
    const diaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fecha.getDay()];
    
    console.log(`🕐 === INICIO BÚSQUEDA HORARIOS ===`);
    console.log(`👤 Responsable: ${responsable}`);
    console.log(`📅 Fecha: ${fechaStr} (${diaSemana})`);
    console.log(`⏱️ Duración: ${duracionMinutos} minutos`);
    console.log(`📋 Total horarios disponibles:`, horarios.length);
    
    // DEPURACIÓN: Mostrar TODOS los horarios para este responsable
    console.log('🔍 === TODOS LOS HORARIOS PARA ESTE RESPONSABLE ===');
    const horariosResponsable = horarios.filter(h => h.Responsable === responsable);
    horariosResponsable.forEach((h, index) => {
      console.log(`Horario ${index + 1}:`, {
        responsable: h.Responsable,
        diaSemana: h.Dia_Semana,
        tipo: h.Tipo,
        activo: h.Activo,
        fechaEspecifica: h.Fecha_Especifica || 'SIN_FECHA_ESPECIFICA',
        horaInicio: h.Hora_Inicio,
        horaFin: h.Hora_Fin
      });
    });

    // 🔍 PASO 1: Buscar si existe una configuración ESPECÍFICA para esta fecha EXACTA
    console.log(`🔍 === PASO 1: BUSCANDO EXCEPCIÓN ESPECÍFICA PARA ${fechaStr} ===`);
    const excepcionEspecifica = horarios.find(h => {
      const esElResponsable = h.Responsable === responsable;
      const tieneFechaEspecifica = h.Fecha_Especifica && h.Fecha_Especifica.trim() !== '';
      
      if (!esElResponsable || !tieneFechaEspecifica) {
        return false;
      }
      
      // Comparar fechas usando nuestra función CORREGIDA
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

    // 🚫 PASO 2: Si hay configuración específica para esta fecha exacta, retornar array vacío
    if (excepcionEspecifica) {
      console.log(`❌ EXCEPCIÓN DETECTADA: ${responsable} tiene configuración específica para ${fechaStr}`);
      console.log(`🚫 Configuración encontrada:`, excepcionEspecifica);
      console.log(`🕐 === FIN BÚSQUEDA (FECHA ESPECÍFICA - SIN HORARIOS) ===`);
      return [];
    }

    // ✅ PASO 3: NO hay excepción específica, buscar horario REGULAR para este día de la semana
    console.log(`✅ NO hay excepción para ${fechaStr}, buscando horario regular para ${diaSemana}`);
    console.log(`🔍 === PASO 3: BUSCANDO CONFIGURACIÓN REGULAR PARA ${diaSemana} ===`);
    
    // FUNDAMENTAL: Solo buscar horarios que NO tengan NINGUNA fecha específica
    const configuracionRegular = horarios.find(h => {
      const esElResponsable = h.Responsable === responsable;
      const esMismoDiaSemana = h.Dia_Semana === diaSemana;
      const esHorarioNormal = h.Tipo === 'normal';
      const estaActivo = h.Activo;
      // CRÍTICO: NO debe tener NINGUNA fecha específica (configuración general)
      const esConfiguracionGeneral = !h.Fecha_Especifica || h.Fecha_Especifica.trim() === '';
      
      console.log(`🔍 Evaluando horario:`, {
        responsable: h.Responsable,
        diaSemana: h.Dia_Semana,
        tipo: h.Tipo,
        activo: h.Activo,
        fechaEspecifica: h.Fecha_Especifica || 'NINGUNA',
        esConfiguracionGeneral: esConfiguracionGeneral,
        esElResponsable: esElResponsable,
        esMismoDiaSemana: esMismoDiaSemana,
        esHorarioNormal: esHorarioNormal,
        estaActivo: estaActivo,
        cumpleTodasLasCondiciones: esElResponsable && esMismoDiaSemana && esHorarioNormal && estaActivo && esConfiguracionGeneral
      });
      
      return esElResponsable && esMismoDiaSemana && esHorarioNormal && estaActivo && esConfiguracionGeneral;
    });

    if (!configuracionRegular) {
      console.log(`❌ No hay horario regular configurado para ${responsable} los ${diaSemana}`);
      console.log(`🚨 DIAGNÓSTICO: Parece que solo hay configuraciones específicas para este día, no hay horario regular.`);
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
