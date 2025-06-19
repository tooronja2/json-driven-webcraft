
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useBusiness } from '@/context/BusinessContext';

interface AgregarTurnoProps {
  onClose: () => void;
  onTurnoAgregado: () => void;
}

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlh4awkllCTVdxnVQkUWPfs-RVCYXQ9zwn3UpfKaCNiUEOEcTZdx61SVicn5boJf0p/exec';
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

const BARBEROS = ['Héctor Medina', 'Lucas Peralta', 'Camila González'];

const AgregarTurno: React.FC<AgregarTurnoProps> = ({ onClose, onTurnoAgregado }) => {
  const { contenido } = useBusiness();
  const [formData, setFormData] = useState({
    servicio: '',
    valor: '',
    horaInicio: '',
    responsable: '',
    nombreCliente: 'Cliente Walk-in',
    emailCliente: 'walkin@barberia.com'
  });
  const [cargando, setCargando] = useState(false);

  const servicioSeleccionado = contenido?.find(s => s.id === formData.servicio);
  const duracionMinutos = parseInt(servicioSeleccionado?.detalles?.duracion?.replace('min', '') || '30');

  // Calcular hora fin automáticamente
  const calcularHoraFin = (horaInicio: string): string => {
    if (!horaInicio) return '';
    
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const fechaFin = new Date();
    fechaFin.setHours(horas, minutos + duracionMinutos);
    
    return `${fechaFin.getHours().toString().padStart(2, '0')}:${fechaFin.getMinutes().toString().padStart(2, '0')}`;
  };

  const horaFin = calcularHoraFin(formData.horaInicio);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.servicio || !formData.valor || !formData.horaInicio || !formData.responsable) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setCargando(true);

    const reservaData = {
      ID_Evento: `walk_in_${Date.now()}`,
      Titulo_Evento: servicioSeleccionado?.nombre || formData.servicio,
      Nombre_Cliente: formData.nombreCliente,
      Email_Cliente: formData.emailCliente,
      Fecha: new Date().toISOString().split('T')[0],
      Hora_Inicio: formData.horaInicio,
      Hora_Fin: horaFin,
      Descripcion: `Turno agregado manualmente - ${servicioSeleccionado?.nombre || formData.servicio}`,
      Estado: 'Completado',
      "Valor del turno": parseFloat(formData.valor),
      "Servicios incluidos": servicioSeleccionado?.nombre || formData.servicio,
      Responsable: formData.responsable
    };

    try {
      const datos = {
        action: "crearReserva",
        apiKey: API_SECRET_KEY,
        data: JSON.stringify(reservaData)
      };

      const formDataToSend = new URLSearchParams();
      for (const key in datos) {
        formDataToSend.append(key, datos[key]);
      }

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert('¡Turno agregado exitosamente!');
        onTurnoAgregado();
      } else {
        alert('Error al agregar el turno: ' + (result.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar el turno: ' + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Agregar Turno</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Servicio *</label>
              <Select value={formData.servicio} onValueChange={(value) => {
                const servicio = contenido?.find(s => s.id === value);
                setFormData({
                  ...formData, 
                  servicio: value,
                  valor: servicio?.precio_oferta?.toString() || servicio?.precio?.toString() || ''
                });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {contenido?.map((servicio) => (
                    <SelectItem key={servicio.id} value={servicio.id}>
                      {servicio.nombre} - ${servicio.precio_oferta || servicio.precio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Valor del turno *</label>
              <Input
                type="number"
                value={formData.valor}
                onChange={(e) => setFormData({...formData, valor: e.target.value})}
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Hora de inicio *</label>
              <Input
                type="time"
                value={formData.horaInicio}
                onChange={(e) => setFormData({...formData, horaInicio: e.target.value})}
                required
              />
              {horaFin && (
                <p className="text-xs text-gray-600 mt-1">
                  Duración: {duracionMinutos} min - Fin: {horaFin}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Barbero responsable *</label>
              <Select value={formData.responsable} onValueChange={(value) => setFormData({...formData, responsable: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un barbero" />
                </SelectTrigger>
                <SelectContent>
                  {BARBEROS.map((barbero) => (
                    <SelectItem key={barbero} value={barbero}>
                      {barbero}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Nombre del cliente</label>
              <Input
                value={formData.nombreCliente}
                onChange={(e) => setFormData({...formData, nombreCliente: e.target.value})}
                placeholder="Cliente Walk-in"
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={cargando} className="flex-1">
                {cargando ? 'Agregando...' : 'Agregar Turno'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgregarTurno;
