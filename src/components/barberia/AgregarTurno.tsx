
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import CalendarioCustom from '@/components/CalendarioCustom';

interface AgregarTurnoProps {
  onClose: () => void;
  onTurnoAgregado: () => void;
  fechaSeleccionada: Date;
}

// URL de Google Apps Script
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlh4awkllCTVdxnVQkUWPfs-RVCYXQ9zwn3UpfKaCNiUEOEcTZdx61SVicn5boJf0p/exec';

// 🔐 API KEY SECRETA
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

const AgregarTurno: React.FC<AgregarTurnoProps> = ({ onClose, onTurnoAgregado, fechaSeleccionada }) => {
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [responsableSeleccionado, setResponsableSeleccionado] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('Confirmado');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [datosCliente, setDatosCliente] = useState({
    nombre: 'Turno manual',
    email: 'manual@admin.com',
    telefono: '00000000000'
  });
  const [cargando, setCargando] = useState(false);
  // Nuevo estado para forzar recarga del calendario
  const [reloadCalendar, setReloadCalendar] = useState(0);

  const servicios = [
    { id: 'corte-barba', nombre: 'Corte de barba', duracion: 15, precio: 6500 },
    { id: 'corte-pelo', nombre: 'Corte de pelo', duracion: 15, precio: 8500 },
    { id: 'todo-maquina', nombre: 'Corte todo maquina', duracion: 15, precio: 8000 },
    { id: 'corte-pelo-barba', nombre: 'Corte de pelo y barba', duracion: 25, precio: 9500 },
    { id: 'disenos-dibujos', nombre: 'Diseños y dibujos', duracion: 15, precio: 6500 }
  ];

  const responsables = ['Lucas Peralta', 'Héctor Medina', 'Camila González'];
  const estados = ['Confirmado', 'Completado', 'En proceso', 'Cancelado'];

  const servicio = servicios.find(s => s.id === servicioSeleccionado);

  const crearTurnoManual = async () => {
    if (!servicioSeleccionado || !responsableSeleccionado || !horaSeleccionada) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setCargando(true);

    try {
      const duracionMinutos = servicio?.duracion || 15;
      
      // Calcular hora de fin
      const [horas, minutos] = horaSeleccionada.split(':').map(Number);
      const fechaFin = new Date();
      fechaFin.setHours(horas, minutos + duracionMinutos);
      const horaFin = `${fechaFin.getHours().toString().padStart(2, '0')}:${fechaFin.getMinutes().toString().padStart(2, '0')}`;

      const turnoData = {
        ID_Evento: `evento_${Date.now()}`,
        Titulo_Evento: servicio?.nombre || '',
        Nombre_Cliente: datosCliente.nombre,
        Email_Cliente: datosCliente.email,
        Fecha: fechaSeleccionada.toISOString().split('T')[0],
        Hora_Inicio: horaSeleccionada,
        Hora_Fin: horaFin,
        Descripcion: `${servicio?.nombre} - Tel: ${datosCliente.telefono}`,
        Estado: estadoSeleccionado,
        "Valor del turno": servicio?.precio || 0,
        "Servicios incluidos": servicio?.nombre || '',
        Responsable: responsableSeleccionado
      };

      const datos = {
        action: "crearReserva",
        apiKey: API_SECRET_KEY,
        data: JSON.stringify(turnoData)
      };

      const formData = new URLSearchParams();
      for (const key in datos) {
        formData.append(key, datos[key]);
      }

      console.log('🚀 Creando turno manual desde panel admin');
      console.log('📦 Datos del turno:', turnoData);

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Turno manual creado exitosamente');
        
        // FORZAR RECARGA INMEDIATA del calendario
        setReloadCalendar(Date.now());
        
        // Pequeña pausa para asegurar que la recarga se procese
        setTimeout(() => {
          alert('¡Turno agregado exitosamente!');
          onTurnoAgregado();
          onClose();
        }, 500);
      } else {
        alert('Error al crear el turno: ' + (result.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('❌ Error completo:', error);
      alert('Error al procesar el turno: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleReservaConfirmada = () => {
    console.log('✅ Reserva confirmada desde calendario');
    // Forzar recarga del calendario después de crear reserva
    setReloadCalendar(Date.now());
    onTurnoAgregado();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Agregar Turno Manual</h2>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulario manual */}
          <div className="space-y-4">
            <h3 className="font-semibold">Crear turno manualmente</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Servicio</label>
              <select
                value={servicioSeleccionado}
                onChange={(e) => setServicioSeleccionado(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Seleccionar servicio</option>
                {servicios.map(servicio => (
                  <option key={servicio.id} value={servicio.id}>
                    {servicio.nombre} ({servicio.duracion}min - ${servicio.precio})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Responsable</label>
              <select
                value={responsableSeleccionado}
                onChange={(e) => setResponsableSeleccionado(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Seleccionar responsable</option>
                {responsables.map(responsable => (
                  <option key={responsable} value={responsable}>
                    {responsable}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <select
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {estados.map(estado => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Hora</label>
              <input
                type="time"
                value={horaSeleccionada}
                onChange={(e) => setHoraSeleccionada(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nombre Cliente</label>
              <input
                type="text"
                value={datosCliente.nombre}
                onChange={(e) => setDatosCliente({...datosCliente, nombre: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email Cliente</label>
              <input
                type="email"
                value={datosCliente.email}
                onChange={(e) => setDatosCliente({...datosCliente, email: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                type="tel"
                value={datosCliente.telefono}
                onChange={(e) => setDatosCliente({...datosCliente, telefono: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <Button 
              onClick={crearTurnoManual} 
              disabled={cargando || !servicioSeleccionado || !responsableSeleccionado || !horaSeleccionada}
              className="w-full"
            >
              {cargando ? 'Agregando...' : 'Agregar Turno Manual'}
            </Button>
          </div>

          {/* Calendario con disponibilidad */}
          <div>
            <h3 className="font-semibold mb-4">O usar el calendario (recomendado)</h3>
            {servicioSeleccionado && responsableSeleccionado && (
              <CalendarioCustom
                servicioId={servicioSeleccionado}
                responsable={responsableSeleccionado}
                onReservaConfirmada={handleReservaConfirmada}
                forceReload={reloadCalendar}
              />
            )}
            {(!servicioSeleccionado || !responsableSeleccionado) && (
              <p className="text-gray-500">
                Selecciona un servicio y responsable para ver la disponibilidad
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgregarTurno;
