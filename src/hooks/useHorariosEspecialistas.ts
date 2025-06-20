import { useState, useEffect, useCallback } from 'react';

interface HorarioEspecialista {
  Responsable: string;
  Dia_Semana: string;
  Hora_Inicio: string | number;
  Hora_Fin: string | number;
  Activo: boolean;
  Tipo: string;
}

interface DiaLibre {
  Responsable: string;
  Dia: string;
}

// URL ACTUALIZADA de Google Apps Script
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxOLBMEo3W8vbMIGY-0ejs4HArOzqRKwWqimt3IajsAtp0R0pK_xgTnw6n5sO2oMJCL/exec';

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

// Función MEJORADA para convertir DD/MM/YYYY a YYYY-MM-DD
const convertirFechaAISO = (fechaDDMMYYYY: any): string => {
  if (!fechaDDMMYYYY) return '';
  
  console.log('🔄 Convirtiendo fecha:', fechaDDMMYYYY, 'Tipo:', typeof fechaDDMMYYYY);
  
  // Si ya está en formato ISO (YYYY-MM-DD)
  const fechaStr = fechaDDMMYYYY.toString().trim();
  if (fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    console.log('✅ Ya está en formato ISO:', fechaStr);
    return fechaStr;
  }
  
  // Si es un objeto Date o string ISO, convertirlo a string ISO
  if (fechaDDMMYYYY instanceof Date) {
    try {
      const fechaISO = fechaDDMMYYYY.toISOString().split('T')[0];
      console.log('✅ Convertido de Date object:', fechaISO);
      return fechaISO;
    } catch (e) {
      console.log('❌ Error convirtiendo Date object:', e);
    }
  }
  
  // Si es string pero viene como ISO completo (1899-12-30T15:31:48.000Z)
  if (fechaStr.includes('T') && fechaStr.includes('Z')) {
    try {
      const fecha = new Date(fechaStr);
      const fechaISO = fecha.toISOString().split('T')[0];
      console.log('✅ Convertido de string ISO completo:', fechaISO);
      return fechaISO;
    } catch (e) {
      console.log('❌ Error convirtiendo string ISO:', e);
    }
  }
  
  // Si está en formato DD/MM/YYYY (el más común desde Google Sheets)
  if (fechaStr.includes('/')) {
    const partes = fechaStr.split('/');
    if (partes.length === 3) {
      const [dia, mes, año] = partes;
      // Asegurar que día y mes tengan 2 dígitos
      const diaFormateado = dia.padStart(2, '0');
      const mesFormateado = mes.padStart(2, '0');
      const fechaISO = `${año}-${mesFormateado}-${diaFormateado}`;
      console.log('✅ Convertido DD/MM/YYYY a ISO:', `${fechaStr} -> ${fechaISO}`);
      return fechaISO;
    }
  }
  
  console.log('⚠️ No se pudo convertir la fecha:', fechaDDMMYYYY);
  return fechaStr;
};

// 🔐 API KEY SECRETA - DEBE SER LA MISMA QUE EN CalendarioCustom
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

export const useHorariosEspecialistas = () => {
  const [horarios, setHorarios] = useState<HorarioEspecialista[]>([]);
  const [diasLibres, setDiasLibres] = useState<DiaLibre[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargarHorarios = async () => {
    try {
      setCargando(true);
      console.log('🔄 Cargando horarios de especialistas...');
      
      const url = `${GOOGLE_APPS_SCRIPT_URL}?action=getHorarios&apiKey=${API_SECRET_KEY}&timestamp=${Date.now()}`;
      
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
      
      const url = `${GOOGLE_APPS_SCRIPT_URL}?action=getDiasLibres&apiKey=${API_SECRET_KEY}&timestamp=${Date.now()}`;
      
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
        console.log('🚫 Días libres RAW recibidos:', data.diasLibres);
        
        // Procesar días libres para normalizar fechas
        const diasLibresProcesados = data.diasLibres.map((diaLibre: any) => {
          const fechaOriginal = diaLibre.Dia;
          const fechaConvertida = convertirFechaAISO(fechaOriginal);
          
          console.log('📅 Procesando día libre:', {
            responsable: diaLibre.Responsable,
            fechaOriginal: fechaOriginal,
            fechaConvertida: fechaConvertida
          });
          
          return {
            Responsable: diaLibre.Responsable,
            Dia: fechaConvertida
          };
        });
        
        console.log('✅ Días libres procesados:', diasLibresProcesados);
        setDiasLibres(diasLibresProcesados);
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
    console.log('📋 Días libres disponibles:', diasLibres);
    
    const tieneDiaLibre = diasLibres.some(diaLibre => {
      const esMismoResponsable = diaLibre.Responsable === responsable;
      const esMismaFecha = diaLibre.Dia === fechaStr;
      
      console.log(`🔍 Verificando día libre:`, {
        responsable: diaLibre.Responsable,
        dia: diaLibre.Dia,
        fechaBuscada: fechaStr,
        esMismoResponsable,
        esMismaFecha,
        coincide: esMismoResponsable && esMismaFecha
      });
      
      return esMismoResponsable && esMismaFecha;
    });

    if (tieneDiaLibre) {
      console.log(`🚫 ${responsable} tiene día libre el ${fechaStr} - NO HAY HORARIOS DISPONIBLES`);
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
