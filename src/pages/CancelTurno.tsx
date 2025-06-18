
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// NUEVA URL de tu Google Apps Script actualizada
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx2fe5gVZjK-bJCNPqMncnKJgujQSWwfmcrvz6cRXsydLnbLOJFw1WU53jTOYte40ow/exec';

const CancelTurno = () => {
  const [searchParams] = useSearchParams();
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [turnoData, setTurnoData] = useState<any>(null);
  
  const eventId = searchParams.get('id');

  useEffect(() => {
    if (eventId) {
      cargarDatosTurno();
    }
  }, [eventId]);

  const cargarDatosTurno = async () => {
    try {
      const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getTurno&id=${eventId}`);
      const data = await response.json();
      if (data.success) {
        setTurnoData(data.turno);
      } else {
        setMensaje('Turno no encontrado o ya cancelado');
      }
    } catch (error) {
      setMensaje('Error al cargar datos del turno');
    }
  };

  const cancelarTurno = async () => {
    if (!eventId) return;
    
    setCargando(true);
    
    try {
      const formData = new URLSearchParams();
      formData.append('action', 'cancelarTurno');
      formData.append('eventId', eventId);

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setMensaje('✅ Turno cancelado exitosamente. Te enviamos un email de confirmación.');
      } else {
        setMensaje('❌ Error al cancelar el turno: ' + result.error);
      }
    } catch (error) {
      setMensaje('❌ Error al procesar la cancelación');
    } finally {
      setCargando(false);
    }
  };

  if (!eventId) {
    return (
      <main className="max-w-md mx-auto pt-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Cancelar Turno</h1>
        <p className="text-red-600">ID de turno no válido</p>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto pt-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Cancelar Turno</h1>
      
      {mensaje ? (
        <div className="bg-white rounded-xl p-6 shadow text-center">
          <p className="text-lg">{mensaje}</p>
          <Button 
            onClick={() => window.location.href = '/'} 
            className="mt-4"
          >
            Volver al inicio
          </Button>
        </div>
      ) : turnoData ? (
        <div className="bg-white rounded-xl p-6 shadow space-y-4">
          <h2 className="text-lg font-semibold text-center">Detalles del turno</h2>
          
          <div className="space-y-2 text-sm">
            <p><strong>Servicio:</strong> {turnoData.Titulo_Evento}</p>
            <p><strong>Cliente:</strong> {turnoData.Nombre_Cliente}</p>
            <p><strong>Fecha:</strong> {turnoData.Fecha}</p>
            <p><strong>Hora inicio:</strong> {turnoData["Hora Inicio"]}</p>
            <p><strong>Hora fin:</strong> {turnoData["Hora Fin"]}</p>
            <p><strong>Especialista:</strong> {turnoData.Responsable}</p>
            <p><strong>Estado:</strong> {turnoData.Estado}</p>
          </div>

          {turnoData.Estado !== 'Cancelado' ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">¿Estás seguro que querés cancelar este turno?</p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="flex-1"
                >
                  No, mantener turno
                </Button>
                <Button 
                  onClick={cancelarTurno}
                  disabled={cargando}
                  variant="destructive"
                  className="flex-1"
                >
                  {cargando ? 'Cancelando...' : 'Sí, cancelar'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-red-600">Este turno ya fue cancelado</p>
              <Button onClick={() => window.location.href = '/'} className="mt-4">
                Volver al inicio
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <p>Cargando datos del turno...</p>
        </div>
      )}
    </main>
  );
};

export default CancelTurno;
