
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Plus } from 'lucide-react';
import TurnosDia from '@/components/barberia/TurnosDia';
import EstadisticasBarberia from '@/components/barberia/EstadisticasBarberia';
import AgregarTurno from '@/components/barberia/AgregarTurno';

interface DashboardBarberiaProps {
  usuario: string;
  rol: string;
  onLogout: () => void;
}

const DashboardBarberia: React.FC<DashboardBarberiaProps> = ({ usuario, rol, onLogout }) => {
  const [mostrarAgregarTurno, setMostrarAgregarTurno] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('barberia_usuario');
    localStorage.removeItem('barberia_rol');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">Barbería Estilo</h1>
            <p className="text-sm text-gray-600">{usuario} - {rol}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setMostrarAgregarTurno(true)}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Turno
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-1" />
              Salir
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto p-4">
        <Tabs defaultValue="turnos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="turnos">Turnos del Día</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="turnos">
            <TurnosDia />
          </TabsContent>
          
          <TabsContent value="estadisticas">
            <EstadisticasBarberia />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal para agregar turno */}
      {mostrarAgregarTurno && (
        <AgregarTurno 
          onClose={() => setMostrarAgregarTurno(false)}
          onTurnoAgregado={() => {
            setMostrarAgregarTurno(false);
            // Aquí podrías recargar los datos si fuera necesario
          }}
        />
      )}
    </div>
  );
};

export default DashboardBarberia;
