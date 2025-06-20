
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User } from 'lucide-react';

interface LoginBarberiaProps {
  onLogin: (usuario: string, rol: string, permisos: string[]) => void;
}

// Usuario admin principal (mantener como fallback)
const ADMIN_USER = {
  usuario: 'tomasradeljakadmin',
  password: 'tr4d3lJaK4Dm1N',
  nombre: 'Tomás Radelj',
  rol: 'Administrador',
  permisos: ['admin', 'crear_usuarios', 'ver_todos', 'eliminar']
};

// URLs de Google Apps Script
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlh4awkllCTVdxnVQkUWPfs-RVCYXQ9zwn3UpfKaCNiUEOEcTZdx61SVicn5boJf0p/exec';
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

const LoginBarberia: React.FC<LoginBarberiaProps> = ({ onLogin }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const validarUsuarioEnGoogleSheets = async (usuario: string, password: string) => {
    try {
      console.log('🔄 Validando usuario en Google Sheets...');
      
      const response = await fetch(
        `${GOOGLE_APPS_SCRIPT_URL}?action=validarUsuario&apiKey=${API_SECRET_KEY}&usuario=${encodeURIComponent(usuario)}&password=${encodeURIComponent(password)}&timestamp=${Date.now()}`
      );
      
      const data = await response.json();
      console.log('📄 Respuesta de validación:', data);

      if (data.success && data.usuario) {
        return {
          valido: true,
          usuario: data.usuario
        };
      } else {
        return {
          valido: false,
          error: data.error || 'Usuario o contraseña incorrectos'
        };
      }
    } catch (error) {
      console.error('❌ Error al validar usuario:', error);
      return {
        valido: false,
        error: 'Error de conexión al validar usuario'
      };
    }
  };

  const obtenerUsuarios = () => {
    const usuariosGuardados = localStorage.getItem('barberia_usuarios');
    return usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    console.log('Intentando login con:', { usuario, password });
    
    // 1. Verificar admin principal (fallback)
    if (usuario === ADMIN_USER.usuario && password === ADMIN_USER.password) {
      localStorage.setItem('barberia_usuario', ADMIN_USER.nombre);
      localStorage.setItem('barberia_rol', ADMIN_USER.rol);
      localStorage.setItem('barberia_permisos', JSON.stringify(ADMIN_USER.permisos));
      onLogin(ADMIN_USER.nombre, ADMIN_USER.rol, ADMIN_USER.permisos);
      setCargando(false);
      return;
    }

    // 2. Validar en Google Sheets (método principal)
    const validacionGoogleSheets = await validarUsuarioEnGoogleSheets(usuario, password);
    
    if (validacionGoogleSheets.valido && validacionGoogleSheets.usuario) {
      const usuarioValidado = validacionGoogleSheets.usuario;
      localStorage.setItem('barberia_usuario', usuarioValidado.nombre);
      localStorage.setItem('barberia_rol', usuarioValidado.rol);
      localStorage.setItem('barberia_permisos', JSON.stringify(usuarioValidado.permisos));
      localStorage.setItem('barberia_barbero_asignado', usuarioValidado.barberoAsignado || '');
      onLogin(usuarioValidado.nombre, usuarioValidado.rol, usuarioValidado.permisos);
      setCargando(false);
      return;
    }

    // 3. Fallback: verificar usuarios locales (solo para compatibilidad)
    const usuarios = obtenerUsuarios();
    console.log('Verificando usuarios locales como fallback...');
    
    const usuarioEncontrado = usuarios.find(
      (u: any) => u.usuario === usuario && u.password === password
    );

    if (usuarioEncontrado) {
      localStorage.setItem('barberia_usuario', usuarioEncontrado.nombre);
      localStorage.setItem('barberia_rol', usuarioEncontrado.rol);
      localStorage.setItem('barberia_permisos', JSON.stringify(usuarioEncontrado.permisos));
      localStorage.setItem('barberia_barbero_asignado', usuarioEncontrado.barberoAsignado || '');
      onLogin(usuarioEncontrado.nombre, usuarioEncontrado.rol, usuarioEncontrado.permisos);
    } else {
      setError(validacionGoogleSheets.error || 'Usuario o contraseña incorrectos');
    }
    
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Barbería Estilo</CardTitle>
          <p className="text-gray-600">Sistema de Gestión PWA v3.0</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={cargando}>
              {cargando ? 'Validando...' : 'Iniciar Sesión'}
            </Button>
          </form>
          
          <div className="mt-4 text-xs text-center text-gray-500">
            Los usuarios se validan de forma segura desde Google Sheets
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginBarberia;
