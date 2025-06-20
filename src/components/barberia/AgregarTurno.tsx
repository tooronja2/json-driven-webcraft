
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AgregarTurnoProps {
  onClose: () => void;
  onTurnoAgregado: () => void;
}

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlh4awkllCTVdxnVQkUWPfs-RVCYXQ9zwn3UpfKaCNiUEOEcTZdx61SVicn5boJf0p/exec';
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

// Usar los mismos servicios que están en servicios.json
const SERVICIOS = [
  { nombre: 'Corte de barba', precio: 6500, duracion: 15 },
  { nombre: 'Corte de pelo', precio: 8500, duracion: 15 },
  { nombre: 'Corte todo maquina', precio: 8000, duracion: 15 },
  { nombre: 'Corte de pelo y barba', precio: 9500, duracion: 25 },
  { nombre: 'Diseños y dibujos', precio: 6500, duracion: 15 }
];

const BARBEROS = ['Héctor Medina', 'Lucas Peralta', 'Camila González'];

interface FormDataSimple {
  servicio: string;
  hora: string;
  responsable: string;
}

const AgregarTurno: React.FC<AgregarTurnoProps> = ({ onClose, onTurnoAgregado }) => {
  const [formData, setFormData] = useState<FormDataSimple>({
    servicio: '',
    hora: '',
    responsable: ''
  });
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  const calcularHoraFin = (horaInicio: string, servicio: string): string => {
    const servicioSeleccionado = SERVICIOS.find(s => s.nombre === servicio);
    const duracion = servicioSeleccionado?.duracion || 15;

    const [horas, minutos] = horaInicio.split(':').map(Number);
    let nuevaHora = horas;
    let nuevoMinuto = minutos + duracion;

    if (nuevoMinuto >= 60) {
      nuevaHora += Math.floor(nuevoMinuto / 60);
      nuevoMinuto %= 60;
    }

    nuevaHora %= 24;
    return `${String(nuevaHora).padStart(2, '0')}:${String(nuevoMinuto).padStart(2, '0')}`;
  };

  const generarId = (): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TURNO_${timestamp}_${random}`;
  };

  const enviarTurno = async () => {
    if (!formData.servicio || !formData.hora || !formData.responsable) {
      setError('Por favor completa todos los campos');
      return;
    }

    setEnviando(true);
    setError('');

    try {
      const servicioSeleccionado = SERVICIOS.find(s => s.nombre === formData.servicio);
      const fechaHoy = new Date().toISOString().split('T')[0];

      const turnoData = {
        id: generarId(),
        titulo: 'Atención directa en local',
        nombre: 'Atención directa en local',
        email: 'atencion@barberiaestilo.com',
        fecha: fechaHoy,
        horaInicio: formData.hora,
        horaFin: calcularHoraFin(formData.hora, formData.servicio),
        descripcion: `Turno sin reserva - ${formData.servicio}`,
        servicio: formData.servicio,
        valor: servicioSeleccionado?.precio || 0,
        responsable: formData.responsable,
        estado: 'Completado',
        origen: 'manual',
        apiKey: API_SECRET_KEY
      };

      console.log('Enviando turno sin reserva:', turnoData);

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(turnoData)
      });

      const result = await response.json();
      console.log('Respuesta del servidor:', result);

      if (result.success) {
        setMensajeExito('Turno agregado exitosamente');
        setFormData({
          servicio: '',
          hora: '',
          responsable: ''
        });
        setTimeout(() => {
          setMensajeExito('');
          onTurnoAgregado();
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Error al agregar el turno');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión. Inténtalo nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Agregar Turno Completado</h2>
        <p className="text-sm text-gray-600 mb-4">Para atenciones directas sin reserva previa</p>

        {error && <div className="text-red-500 mb-4">{error}</div>}
        {mensajeExito && <div className="text-green-500 mb-4">{mensajeExito}</div>}

        <div className="space-y-4">
          <div>
            <Label htmlFor="servicio">Tipo de Servicio</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, servicio: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                {SERVICIOS.map((servicio) => (
                  <SelectItem key={servicio.nombre} value={servicio.nombre}>
                    {servicio.nombre} (${servicio.precio.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hora">Hora de Inicio (HH:MM)</Label>
            <Input
              type="time"
              id="hora"
              value={formData.hora}
              onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="responsable">Barbero Responsable</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, responsable: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un barbero" />
              </SelectTrigger>
              <SelectContent>
                {BARBEROS.map((barbero) => (
                  <SelectItem key={barbero} value={barbero}>{barbero}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.servicio && formData.hora && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm">
                <strong>Hora de fin calculada:</strong> {calcularHoraFin(formData.hora, formData.servicio)}
              </p>
              <p className="text-sm">
                <strong>Valor:</strong> ${SERVICIOS.find(s => s.nombre === formData.servicio)?.precio.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={enviarTurno} disabled={enviando}>
            {enviando ? 'Guardando...' : 'Agregar Turno'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgregarTurno;
