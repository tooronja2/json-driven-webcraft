
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Users } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import TurnosDia from '@/components/barberia/TurnosDia';
import AgregarTurno from '@/components/barberia/AgregarTurno';
import GestionUsuarios from '@/components/barberia/GestionUsuarios';

interface DashboardBarberiaProps {
  usuario: string;
  rol: string;
  permisos: string[];
  onLogout: () => void;
}

const DashboardBarberia: React.FC<DashboardBarberiaProps> = ({ usuario, rol, permisos, onLogout }) => {
  const [mostrarAgregarTurno, setMostrarAgregarTurno] = useState(false);
  const [mostrarGestionUsuarios, setMostrarGestionUsuarios] = useState(false);

  const esAdmin = permisos.includes('admin');

  const handleLogout = () => {
    localStorage.removeItem('barberia_usuario');
    localStorage.removeItem('barberia_rol');
    localStorage.removeItem('barberia_permisos');
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
            {esAdmin && (
              <Button
                onClick={() => setMostrarGestionUsuarios(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Users className="h-4 w-4 mr-1" />
                Usuarios
              </Button>
            )}
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
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="turnos">Turnos del Día</TabsTrigger>
          </TabsList>
          
          <TabsContent value="turnos">
            <TurnosDia permisos={permisos} usuario={usuario} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modales */}
      {mostrarAgregarTurno && (
        <AgregarTurno 
          onClose={() => setMostrarAgregarTurno(false)}
          onTurnoAgregado={() => setMostrarAgregarTurno(false)}
          fechaSeleccionada={new Date()}
        />
      )}

      {mostrarGestionUsuarios && esAdmin && (
        <GestionUsuarios 
          onClose={() => setMostrarGestionUsuarios(false)}
        />
      )}

      <Toaster />
    </div>
  );
};

export default DashboardBarberia;
