import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { useBusiness } from '@/context/BusinessContext';

interface EventoReserva {
  ID_Evento: string;
  Titulo_Evento: string;
  Nombre_Cliente: string;
  Email_Cliente: string;
  Fecha: string; // Ahora separado: "2025-06-23"
  "Hora Inicio": string; // Ahora separado: "14:15"
  "Hora Fin": string; // Ahora separado: "14:30"
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

// NUEVA URL de tu Google Apps Script
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxZV2OgLOAeUrfAvopyfxGLLgHSMzPxFUaC-EAqsWsVMb_07qxSA-MyfIcEEq9tcqlR/exec';

const CalendarioCustom: React.FC<CalendarioCustomProps> = ({ 
  servicioId, 
  responsable, 
  onReservaConfirmada 
}) => {
  const { contenido, config } = useBusiness();
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

  // Horarios de trabajo (9 AM a 6 PM)
  const generarHorarios = () => {
    const horarios = [];
    for (let hora = 9; hora < 18; hora++) {
      for (let minuto = 0; minuto < 60; minuto += duracionMinutos) {
        const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        horarios.push(horaStr);
      }
    }
    return horarios;
  };

  // Cargar eventos desde Google Sheets
  const cargarEventos = async () => {
    try {
      const url = `${GOOGLE_APPS_SCRIPT_URL}?action=getEventos`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const textResponse = await response.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError);
        throw new Error('Respuesta no es JSON válido');
      }
      
      if (data.success) {
        console.log('📅 Eventos cargados:', data.eventos);
        setEventos(data.eventos || []);
      } else {
        console.error('❌ Error del servidor:', data.error);
      }
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
    }
  };

  // Filtrar horarios disponibles - SIMPLIFICADO para el nuevo formato
  useEffect(() => {
    if (!fechaSeleccionada) return;

    const horariosBase = generarHorarios();
    const fechaSeleccionadaStr = fechaSeleccionada.toISOString().split('T')[0]; // "2025-06-23"
    
    console.log('🔍 Filtrando horarios para fecha:', fechaSeleccionadaStr);
    console.log('👨‍💼 Responsable seleccionado:', responsable);
    console.log('📋 Eventos disponibles:', eventos);
    
    // Filtrar horarios ocupados - MUCHO MÁS SIMPLE ahora
    const horariosOcupados = eventos
      .filter(evento => {
        const esConfirmado = evento.Estado !== 'Cancelado';
        const esDelResponsable = evento.Responsable === responsable;
        const esMismaFecha = evento.Fecha === fechaSeleccionadaStr;
        
        console.log(`📝 Evento ${evento.ID_Evento}:`, {
          fecha: evento.Fecha,
          horaInicio: evento["Hora Inicio"],
          esConfirmado,
          esDelResponsable,
          esMismaFecha,
          responsableEvento: evento.Responsable,
          estado: evento.Estado
        });
        
        return esConfirmado && esDelResponsable && esMismaFecha;
      })
      .map(evento => evento["Hora Inicio"]);

    console.log('⏰ Horarios ocupados encontrados:', horariosOcupados);

    // Remover duplicados y filtrar disponibles
    const horariosOcupadosUnicos = [...new Set(horariosOcupados)];
    const disponibles = horariosBase.filter(hora => !horariosOcupadosUnicos.includes(hora));
    
    console.log('✅ Horarios disponibles finales:', disponibles);
    
    setHorasDisponibles(disponibles);
  }, [fechaSeleccionada, eventos, responsable, duracionMinutos]);

  useEffect(() => {
    cargarEventos();
  }, []);

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

    // NUEVO FORMATO: datos separados
    const reservaData = {
      ID_Evento: `evento_${Date.now()}`,
      Titulo_Evento: servicio?.nombre || '',
      Nombre_Cliente: datosCliente.nombre,
      Email_Cliente: datosCliente.email,
      Fecha: fechaSeleccionada.toISOString().split('T')[0], // "2025-06-23"
      Hora_Inicio: horaSeleccionada, // "14:15"
      Hora_Fin: horaFin, // "14:30"
      Descripcion: `${servicio?.nombre} - Tel: ${datosCliente.telefono || 'No proporcionado'}`,
      Estado: 'Confirmado',
      "Valor del turno": servicio?.precio_oferta || servicio?.precio || 0,
      "Servicios incluidos": servicio?.nombre || '',
      Responsable: responsable
    };

    try {
      const datos = {
        action: "crearReserva",
        data: JSON.stringify(reservaData)
      };

      const formData = new URLSearchParams();
      for (const key in datos) {
        formData.append(key, datos[key]);
      }

      console.log('🚀 Enviando reserva con nuevo formato');
      console.log('📦 Datos:', reservaData);

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      const textResponse = await response.text();
      console.log('📄 Raw response:', textResponse);

      let result;
      try {
        result = JSON.parse(textResponse);
      } catch (parseError) {
        console.error('❌ Error parsing JSON:', parseError);
        console.error('❌ Raw response was:', textResponse);
        throw new Error(`Respuesta del servidor no es JSON válido. Respuesta: ${textResponse.substring(0, 200)}...`);
      }

      console.log('✅ Parsed result:', result);
      
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
          disabled={(date) => date < new Date() || date.getDay() === 0}
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
