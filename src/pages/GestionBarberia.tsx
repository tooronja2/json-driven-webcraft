
import React, { useState, useEffect } from 'react';
import { BusinessProvider } from '@/context/BusinessContext';
import LoginBarberia from './LoginBarberia';
import DashboardBarberia from './DashboardBarberia';
import SEOHead from '@/components/SEOHead';

const GestionBarberia: React.FC = () => {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [permisos, setPermisos] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión activa
    const usuarioGuardado = localStorage.getItem('barberia_usuario');
    const rolGuardado = localStorage.getItem('barberia_rol');
    const permisosGuardados = localStorage.getItem('barberia_permisos');
    
    if (usuarioGuardado && rolGuardado && permisosGuardados) {
      setUsuario(usuarioGuardado);
      setRol(rolGuardado);
      setPermisos(JSON.parse(permisosGuardados));
    }
    
    setCargando(false);
  }, []);

  const handleLogin = (nombreUsuario: string, rolUsuario: string, permisosUsuario: string[]) => {
    setUsuario(nombreUsuario);
    setRol(rolUsuario);
    setPermisos(permisosUsuario);
  };

  const handleLogout = () => {
    setUsuario(null);
    setRol(null);
    setPermisos([]);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <BusinessProvider>
      <SEOHead 
        title="Gestión Barbería - Sistema PWA"
        description="Sistema de gestión interno PWA para empleados de Barbería Estilo"
      />
      
      {usuario && rol ? (
        <DashboardBarberia 
          usuario={usuario} 
          rol={rol}
          permisos={permisos}
          onLogout={handleLogout} 
        />
      ) : (
        <LoginBarberia onLogin={handleLogin} />
      )}
    </BusinessProvider>
  );
};

export default GestionBarberia;
