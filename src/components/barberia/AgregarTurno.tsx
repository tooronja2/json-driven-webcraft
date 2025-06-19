import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { Calendar as CalendarDate } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AgregarTurnoProps {
  onClose: () => void;
  onTurnoAgregado: () => void;
}

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlh4awkllCTVdxnVQkUWPfs-RVCYXQ9zwn3UpfKaCNiUEOEcTZdx61SVicn5boJf0p/exec';
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

const SERVICIOS = ['Corte de pelo', 'Arreglo de barba', 'Corte y barba', 'Tratamiento capilar'];
const PRECIOS_SERVICIOS: { [key: string]: number } = {
  'Corte de pelo': 15000,
  'Arreglo de barba': 10000,
  'Corte y barba': 23000,
  'Tratamiento capilar': 8000
};
const BARBEROS = ['Héctor Medina', 'Lucas Peralta', 'Camila González'];

interface FormData {
  nombre: string;
  email: string;
  fecha: string;
  hora: string;
  servicio: string;
  descripcion: string;
  responsable: string;
}

const AgregarTurno: React.FC<AgregarTurnoProps> = ({ onClose, onTurnoAgregado }) => {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    fecha: '',
    hora: '',
    servicio: '',
    descripcion: '',
    responsable: ''
  });
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const calcularHoraFin = (horaInicio: string, servicio: string): string => {
    const duracionServicio = {
      'Corte de pelo': 30,
      'Arreglo de barba': 20,
      'Corte y barba': 45,
      'Tratamiento capilar': 40
    }[servicio] || 30;

    const [horas, minutos] = horaInicio.split(':').map(Number);
    let nuevaHora = horas;
    let nuevoMinuto = minutos + duracionServicio;

    if (nuevoMinuto >= 60) {
      nuevaHora += Math.floor(nuevoMinuto / 60);
      nuevoMinuto %= 60;
    }

    nuevaHora %= 24;

    const horaFinFormateada = `${String(nuevaHora).padStart(2, '0')}:${String(nuevoMinuto).padStart(2, '0')}`;
    return horaFinFormateada;
  };

  const enviarTurno = async () => {
    if (!formData.nombre || !formData.email || !formData.fecha || !formData.hora || !formData.responsable) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    setEnviando(true);
    setError('');

    try {
      const turnoData = {
        titulo: `Turno: ${formData.nombre}`,
        nombre: formData.nombre,
        email: formData.email,
        fecha: formData.fecha,
        horaInicio: formData.hora,
        horaFin: calcularHoraFin(formData.hora, formData.servicio),
        descripcion: formData.descripcion || `Turno para ${formData.servicio}`,
        servicio: formData.servicio,
        valor: PRECIOS_SERVICIOS[formData.servicio] || 0,
        responsable: formData.responsable,
        estado: 'Confirmado',
        origen: 'manual', // Marcar como turno agregado manualmente
        apiKey: API_SECRET_KEY
      };

      console.log('Enviando turno:', turnoData);

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
          nombre: '',
          email: '',
          fecha: '',
          hora: '',
          servicio: '',
          descripcion: '',
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
        <h2 className="text-lg font-semibold mb-4">Agregar Nuevo Turno</h2>

        {error && <div className="text-red-500 mb-4">{error}</div>}
        {mensajeExito && <div className="text-green-500 mb-4">{mensajeExito}</div>}

        <div className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre del Cliente</Label>
            <Input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="email">Email del Cliente</Label>
            <Input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label>Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={format(date || new Date(), 'PPP', { locale: es }) ? "justify-start text-left font-normal" : "justify-start text-left font-normal text-muted-foreground"}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarDate
                  mode="single"
                  locale={es}
                  selected={date}
                  onSelect={(date) => {
                    setDate(date);
                    if (date) {
                      setFormData({ ...formData, fecha: date.toISOString().split('T')[0] });
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="hora">Hora (HH:MM)</Label>
            <Input
              type="text"
              id="hora"
              placeholder="10:00"
              value={formData.hora}
              onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="servicio">Servicio</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, servicio: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                {SERVICIOS.map((servicio) => (
                  <SelectItem key={servicio} value={servicio}>{servicio} (${PRECIOS_SERVICIOS[servicio]})</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div>
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Input
              type="text"
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={enviarTurno} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Agregar Turno'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgregarTurno;
