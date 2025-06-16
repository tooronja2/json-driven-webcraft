
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { useBusiness } from '@/context/BusinessContext';

interface EventoReserva {
  ID_Evento: string;
  Titulo_Evento: string;
  Nombre_Cliente: string;
  Email_Cliente: string;
  Fecha_Inicio: string;
  Fecha_Fin: string;
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

// REEMPLAZA ESTA URL CON LA URL DE TU GOOGLE APPS SCRIPT
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/TU_SCRIPT_ID_AQUI/exec';

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
      console.log('Cargando eventos desde Google Apps Script...');
      const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getEventos`);
      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      
      if (data.success) {
        setEventos(data.eventos || []);
      } else {
        console.error('Error en la respuesta:', data.error);
      }
    } catch (error) {
      console.error('Error cargando eventos:', error);
    }
  };

  // Filtrar horarios disponibles
  useEffect(() => {
    if (!fechaSeleccionada) return;

    const horariosBase = generarHorarios();
    const fechaStr = fechaSeleccionada.toISOString().split('T')[0];
    
    // Filtrar horarios ocupados
    const horariosOcupados = eventos
      .filter(evento => 
        evento.Fecha_Inicio.startsWith(fechaStr) && 
        evento.Responsable === responsable &&
        evento.Estado !== 'Cancelado'
      )
      .map(evento => evento.Fecha_Inicio.split(' ')[1]?.substring(0, 5));

    const disponibles = horariosBase.filter(hora => !horariosOcupados.includes(hora));
    setHorasDisponibles(disponibles);
  }, [fechaSeleccionada, eventos, responsable]);

  useEffect(() => {
    cargarEventos();
  }, []);

  const crearReserva = async () => {
    if (!fechaSeleccionada || !horaSeleccionada || !datosCliente.nombre || !datosCliente.email) {
      alert('Por favor completa todos los campos');
      return;
    }

    setCargando(true);

    const fechaInicio = `${fechaSeleccionada.toISOString().split('T')[0]} ${horaSeleccionada}:00`;
    const fechaFin = new Date(fechaSeleccionada);
    fechaFin.setHours(parseInt(horaSeleccionada.split(':')[0]));
    fechaFin.setMinutes(parseInt(horaSeleccionada.split(':')[1]) + duracionMinutos);
    const fechaFinStr = `${fechaFin.toISOString().split('T')[0]} ${fechaFin.getHours().toString().padStart(2, '0')}:${fechaFin.getMinutes().toString().padStart(2, '0')}:00`;

    const reservaData = {
      ID_Evento: `evento_${Date.now()}`,
      Titulo_Evento: servicio?.nombre || '',
      Nombre_Cliente: datosCliente.nombre,
      Email_Cliente: datosCliente.email,
      Fecha_Inicio: fechaInicio,
      Fecha_Fin: fechaFinStr,
      Descripcion: `${servicio?.nombre} - Tel: ${datosCliente.telefono}`,
      Estado: 'Confirmado',
      "Valor del turno": servicio?.precio_oferta || servicio?.precio || 0,
      "Servicios incluidos": servicio?.nombre || '',
      Responsable: responsable
    };

    try {
      console.log('Enviando reserva:', reservaData);
      
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'crearReserva',
          data: reservaData
        })
      });

      const result = await response.json();
      console.log('Resultado:', result);
      
      if (result.success) {
        alert('¡Reserva confirmada! Te enviamos un email de confirmación.');
        onReservaConfirmada();
      } else {
        alert('Error al crear la reserva: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la reserva');
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
          disabled={(date) => date < new Date() || date.getDay() === 0} // Deshabilitar domingos y fechas pasadas
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
        </div>
      )}

      {horaSeleccionada && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Datos del cliente</h3>
          
          <input
            type="text"
            placeholder="Nombre completo"
            value={datosCliente.nombre}
            onChange={(e) => setDatosCliente({...datosCliente, nombre: e.target.value})}
            className="w-full p-2 border rounded-md"
          />
          
          <input
            type="email"
            placeholder="Email"
            value={datosCliente.email}
            onChange={(e) => setDatosCliente({...datosCliente, email: e.target.value})}
            className="w-full p-2 border rounded-md"
          />
          
          <input
            type="tel"
            placeholder="Teléfono"
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
            disabled={cargando}
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
