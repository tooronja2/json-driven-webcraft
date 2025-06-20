
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Bug, Zap, Database, Network, Clock } from 'lucide-react';

const GeneraErrores: React.FC = () => {
  const [errorGenerado, setErrorGenerado] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const erroresPosibles = [
    {
      id: 'network',
      nombre: 'Error de Red',
      descripcion: 'Simula un fallo en la conexión a la API',
      icon: Network,
      color: 'text-red-600',
      accion: () => {
        setErrorGenerado('Error de conexión: No se pudo conectar con el servidor. Verifique su conexión a internet.');
      }
    },
    {
      id: 'database',
      nombre: 'Error de Base de Datos',
      descripcion: 'Simula un error en la consulta a Google Sheets',
      icon: Database,
      color: 'text-orange-600',
      accion: () => {
        setErrorGenerado('Error de base de datos: No se pudo acceder a la hoja de cálculo. ID de hoja inválido o permisos insuficientes.');
      }
    },
    {
      id: 'timeout',
      nombre: 'Error de Timeout',
      descripcion: 'Simula un timeout en la respuesta del servidor',
      icon: Clock,
      color: 'text-yellow-600',
      accion: () => {
        setErrorGenerado('Error de timeout: La solicitud tardó demasiado en responder. Intente nuevamente.');
      }
    },
    {
      id: 'validation',
      nombre: 'Error de Validación',
      descripcion: 'Simula un error en la validación de datos',
      icon: AlertTriangle,
      color: 'text-purple-600',
      accion: () => {
        setErrorGenerado('Error de validación: Los datos enviados no cumplen con el formato requerido. Verifique los campos obligatorios.');
      }
    },
    {
      id: 'api_key',
      nombre: 'Error de API Key',
      descripcion: 'Simula un error de autenticación',
      icon: Zap,
      color: 'text-blue-600',
      accion: () => {
        setErrorGenerado('Error de autenticación: API Key inválida o expirada. Contacte al administrador del sistema.');
      }
    },
    {
      id: 'generic',
      nombre: 'Error Genérico',
      descripcion: 'Simula un error no específico del sistema',
      icon: Bug,
      color: 'text-gray-600',
      accion: () => {
        setErrorGenerado('Error interno del sistema: Ha ocurrido un error inesperado. Código: ERR_SYS_001');
      }
    }
  ];

  const generarError = async (error: typeof erroresPosibles[0]) => {
    setCargando(true);
    setErrorGenerado(null);
    
    // Simular delay de carga
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    error.accion();
    setCargando(false);
    
    console.error(`Error simulado [${error.id}]:`, error.descripcion);
  };

  const limpiarError = () => {
    setErrorGenerado(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Genera Errores - Testing</h2>
        <p className="text-gray-600 mb-6">
          Herramienta para testing y depuración. Genera diferentes tipos de errores para probar el comportamiento del sistema.
        </p>
      </div>

      {errorGenerado && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <strong>Error Simulado:</strong>
                <br />
                {errorGenerado}
              </div>
              <Button 
                onClick={limpiarError}
                variant="outline" 
                size="sm"
                className="ml-4 text-red-600 border-red-300 hover:bg-red-100"
              >
                Limpiar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {erroresPosibles.map((error) => {
          const IconComponent = error.icon;
          return (
            <Card key={error.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconComponent className={`h-5 w-5 ${error.color}`} />
                  {error.nombre}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{error.descripcion}</p>
                <Button 
                  onClick={() => generarError(error)}
                  disabled={cargando}
                  className="w-full"
                  variant="outline"
                >
                  {cargando ? 'Generando...' : 'Generar Error'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Información de Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>URL API:</strong> https://script.google.com/macros/s/AKfyc...</div>
          <div><strong>Timestamp:</strong> {new Date().toLocaleString('es-AR')}</div>
          <div><strong>Estado del Sistema:</strong> <span className="text-green-600">Operativo</span></div>
          <div><strong>Última Simulación:</strong> {errorGenerado ? 'Error activo' : 'Ninguna'}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneraErrores;
