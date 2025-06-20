
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User } from 'lucide-react';

interface LoginBarberiaProps {
  onLogin: (usuario: string, rol: string, permisos: string[]) => void;
}

// URLs de Google Apps Script - ACTUALIZADA
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz1YdmiFjMpQ0kVfClFRkXskNMNZXOl5iZ-04BRXOk_McN5sNeEZemg8xE8NP0CaN5Y/exec';
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

const LoginBarberia: React.FC<LoginBarberiaProps> = ({ onLogin }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const validarUsuarioEnGoogleSheets = async (usuario: string, password: string) => {
    try {
      console.log('🔄 Validando usuario en Google Sheets...');
      console.log('📋 Datos enviados:', { 
        action: 'validarUsuario', 
        usuario: usuario, 
        password: '[OCULTO]',
        apiKey: API_SECRET_KEY.substring(0, 10) + '...',
        url: GOOGLE_APPS_SCRIPT_URL
      });
      
      // FORZAR SOLO GET PARA DEBUGGEAR
      console.log('🔄 Usando GET request para debuggear...');
      
      const getUrl = `${GOOGLE_APPS_SCRIPT_URL}?action=validarUsuario&apiKey=${encodeURIComponent(API_SECRET_KEY)}&usuario=${encodeURIComponent(usuario)}&password=${encodeURIComponent(password)}&timestamp=${Date.now()}`;
      console.log('🔄 URL GET completa:', getUrl.replace(password, '[PASSWORD_OCULTO]'));
      
      const getResponse = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('📡 Estado de respuesta GET:', getResponse.status);
      console.log('📡 Headers de respuesta:', Object.fromEntries(getResponse.headers.entries()));
      
      const responseText = await getResponse.text();
      console.log('📄 Respuesta raw (texto):', responseText);
      
      let getData;
      try {
        getData = JSON.parse(responseText);
        console.log('📄 Respuesta GET parseada:', getData);
      } catch (parseError) {
        console.error('❌ Error al parsear JSON:', parseError);
        console.log('📄 Contenido que falló al parsear:', responseText);
        return {
          valido: false,
          error: 'Error de formato en respuesta del servidor'
        };
      }

      if (getData.success && getData.usuario) {
        console.log('✅ GET request exitoso - usuario encontrado:', getData.usuario);
        return {
          valido: true,
          usuario: getData.usuario
        };
      } else {
        console.log('❌ GET request falló:', {
          success: getData.success,
          error: getData.error,
          usuario: getData.usuario
        });
        return {
          valido: false,
          error: getData.error || 'Usuario o contraseña incorrectos'
        };
      }

    } catch (error) {
      console.error('❌ Error de red al validar usuario:', error);
      console.error('❌ Stack trace:', error.stack);
      return {
        valido: false,
        error: 'Error de conexión al validar usuario: ' + error.message
      };
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    console.log('🔐 Intentando login con:', { usuario: usuario, password: '***' });
    
    // VALIDACIÓN DIRECTA VÍA GOOGLE SHEETS
    const validacionGoogleSheets = await validarUsuarioEnGoogleSheets(usuario, password);
    
    if (validacionGoogleSheets.valido && validacionGoogleSheets.usuario) {
      const usuarioValidado = validacionGoogleSheets.usuario;
      console.log('✅ Login exitoso desde Google Sheets:', usuarioValidado.nombre);
      
      localStorage.setItem('barberia_usuario', usuarioValidado.nombre);
      localStorage.setItem('barberia_rol', usuarioValidado.rol);
      localStorage.setItem('barberia_permisos', JSON.stringify(usuarioValidado.permisos));
      localStorage.setItem('barberia_barbero_asignado', usuarioValidado.barberoAsignado || '');
      onLogin(usuarioValidado.nombre, usuarioValidado.rol, usuarioValidado.permisos);
    } else {
      console.log('❌ Login fallido:', validacionGoogleSheets.error);
      setError(validacionGoogleSheets.error || 'Usuario o contraseña incorrectos');
    }
    
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Barbería Estilo</CardTitle>
          <p className="text-gray-600">Sistema de Gestión PWA v3.1</p>
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
            🔍 Modo debug activado - Revisa la consola
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginBarberia;
