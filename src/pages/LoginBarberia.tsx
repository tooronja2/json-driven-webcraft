
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User } from 'lucide-react';

interface LoginBarberiaProps {
  onLogin: (usuario: string, rol: string) => void;
}

// Usuarios autorizados (en producción esto debería venir del backend)
const USUARIOS_AUTORIZADOS = [
  { usuario: 'hector.medina', password: 'barberia2025', nombre: 'Héctor Medina', rol: 'Dueño' },
  { usuario: 'lucas.peralta', password: 'barbero2025', nombre: 'Lucas Peralta', rol: 'Barbero' },
  { usuario: 'camila.gonzalez', password: 'barbera2025', nombre: 'Camila González', rol: 'Barbera' },
];

const LoginBarberia: React.FC<LoginBarberiaProps> = ({ onLogin }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    // Simular delay de autenticación
    setTimeout(() => {
      const usuarioEncontrado = USUARIOS_AUTORIZADOS.find(
        u => u.usuario === usuario && u.password === password
      );

      if (usuarioEncontrado) {
        localStorage.setItem('barberia_usuario', usuarioEncontrado.nombre);
        localStorage.setItem('barberia_rol', usuarioEncontrado.rol);
        onLogin(usuarioEncontrado.nombre, usuarioEncontrado.rol);
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
          <p className="text-gray-600">Acceso para empleados</p>
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
                  placeholder="hector.medina"
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

          <div className="mt-6 text-xs text-gray-500 text-center">
            <p>Usuarios de prueba:</p>
            <p>hector.medina / barberia2025</p>
            <p>lucas.peralta / barbero2025</p>
            <p>camila.gonzalez / barbera2025</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginBarberia;
