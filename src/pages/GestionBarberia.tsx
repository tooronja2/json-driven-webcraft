
import React, { useState, useEffect } from 'react';
import LoginBarberia from './LoginBarberia';
import DashboardBarberia from './DashboardBarberia';
import SEOHead from '@/components/SEOHead';

const GestionBarberia: React.FC = () => {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión activa
    const usuarioGuardado = localStorage.getItem('barberia_usuario');
    const rolGuardado = localStorage.getItem('barberia_rol');
    
    if (usuarioGuardado && rolGuardado) {
      setUsuario(usuarioGuardado);
      setRol(rolGuardado);
    }
    
    setCargando(false);
  }, []);

  const handleLogin = (nombreUsuario: string, rolUsuario: string) => {
    setUsuario(nombreUsuario);
    setRol(rolUsuario);
  };

  const handleLogout = () => {
    setUsuario(null);
    setRol(null);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Gestión Barbería - Acceso Empleados"
        description="Sistema de gestión interna para empleados de Barbería Estilo"
      />
      
      {usuario && rol ? (
        <DashboardBarberia 
          usuario={usuario} 
          rol={rol} 
          onLogout={handleLogout} 
        />
      ) : (
        <LoginBarberia onLogin={handleLogin} />
      )}
    </>
  );
};

export default GestionBarberia;
