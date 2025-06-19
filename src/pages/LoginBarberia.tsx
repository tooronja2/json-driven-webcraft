
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User } from 'lucide-react';

interface LoginBarberiaProps {
  onLogin: (usuario: string, rol: string, permisos: string[]) => void;
}

// Usuario admin principal
const ADMIN_USER = {
  usuario: 'tomasradeljakadmin',
  password: 'tr4d3lJaK4Dm1N',
  nombre: 'Tomás Radelj',
  rol: 'Administrador',
  permisos: ['admin', 'crear_usuarios', 'ver_todos', 'eliminar']
};

const LoginBarberia: React.FC<LoginBarberiaProps> = ({ onLogin }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const obtenerUsuarios = () => {
    const usuariosGuardados = localStorage.getItem('barberia_usuarios');
    return usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    setTimeout(() => {
      console.log('Intentando login con:', { usuario, password });
      
      // Verificar admin principal
      if (usuario === ADMIN_USER.usuario && password === ADMIN_USER.password) {
        localStorage.setItem('barberia_usuario', ADMIN_USER.nombre);
        localStorage.setItem('barberia_rol', ADMIN_USER.rol);
        localStorage.setItem('barberia_permisos', JSON.stringify(ADMIN_USER.permisos));
        onLogin(ADMIN_USER.nombre, ADMIN_USER.rol, ADMIN_USER.permisos);
        setCargando(false);
        return;
      }

      // Verificar usuarios creados
      const usuarios = obtenerUsuarios();
      console.log('Usuarios en localStorage:', usuarios);
      
      const usuarioEncontrado = usuarios.find(
        (u: any) => {
          console.log('Comparando:', u.usuario, 'con', usuario, '| pass:', u.password, 'con', password);
          return u.usuario === usuario && u.password === password;
        }
      );

      console.log('Usuario encontrado:', usuarioEncontrado);

      if (usuarioEncontrado) {
        localStorage.setItem('barberia_usuario', usuarioEncontrado.nombre);
        localStorage.setItem('barberia_rol', usuarioEncontrado.rol);
        localStorage.setItem('barberia_permisos', JSON.stringify(usuarioEncontrado.permisos));
        localStorage.setItem('barberia_barbero_asignado', usuarioEncontrado.barberoAsignado || '');
        onLogin(usuarioEncontrado.nombre, usuarioEncontrado.rol, usuarioEncontrado.permisos);
      } else {
        setError('Usuario o contraseña incorrectos');
      }
      setCargando(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Barbería Estilo</CardTitle>
          <p className="text-gray-600">Sistema de Gestión PWA</p>
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
              {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginBarberia;
