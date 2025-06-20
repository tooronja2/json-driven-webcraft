
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Bug, Zap, Database, Network, Clock, Upload, X } from 'lucide-react';

const GeneraErrores: React.FC = () => {
  const [errorActivo, setErrorActivo] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [archivosAdjuntos, setArchivosAdjuntos] = useState<File[]>([]);

  const erroresPosibles = [
    {
      id: 'syntax',
      nombre: 'Error de Sintaxis JSX',
      descripcion: 'Rompe un componente React generando JSX inválido',
      icon: Bug,
      color: 'text-red-600',
      instruccionIA: 'Por favor revisa el componente GeneraErrores.tsx línea 45. Hay un JSX mal formado que necesita ser corregido. Asegúrate de cerrar correctamente todas las etiquetas.',
      accion: () => {
        // Generar error de sintaxis JSX real
        const elementoRoto = React.createElement('div', { 
          dangerouslySetInnerHTML: { __html: '<div><span>Elemento sin cerrar' }
        });
        
        console.error('ERROR SINTAXIS JSX:', {
          error: 'JSX element not properly closed',
          ubicacion: 'GeneraErrores.tsx:45',
          descripcion: 'Elemento JSX mal formado detectado',
          instruccion_para_ai: 'Por favor revisa el componente GeneraErrores.tsx línea 45. Hay un JSX mal formado que necesita ser corregido. Asegúrate de cerrar correctamente todas las etiquetas.',
          archivos_adjuntos: archivosAdjuntos.length > 0 ? `${archivosAdjuntos.length} archivo(s) adjunto(s)` : 'ninguno'
        });
        
        throw new Error('JSX_SYNTAX_ERROR: Unclosed JSX element at GeneraErrores.tsx:45');
      }
    },
    {
      id: 'type',
      nombre: 'Error de TypeScript',
      descripcion: 'Genera un error de tipos que rompe la compilación',
      icon: AlertTriangle,
      color: 'text-orange-600',
      instruccionIA: 'Hay un error de tipos en la variable "datos". Se está intentando acceder a una propiedad que no existe en el tipo definido. Corrige la interface o la forma de acceder a los datos.',
      accion: () => {
        console.error('ERROR TYPESCRIPT:', {
          error: 'Property does not exist on type',
          ubicacion: 'GeneraErrores.tsx:67',
          descripcion: 'Intento de acceso a propiedad inexistente',
          instruccion_para_ai: 'Hay un error de tipos en la variable "datos". Se está intentando acceder a una propiedad que no existe en el tipo definido. Corrige la interface o la forma de acceder a los datos.',
          archivos_adjuntos: archivosAdjuntos.length > 0 ? `${archivosAdjuntos.length} archivo(s) adjunto(s)` : 'ninguno'
        });
        
        // @ts-ignore - Forzar error de tipos
        const datos: { nombre: string } = { nombre: 'test' };
        const resultado = datos.propiedadInexistente.valor;
        throw new Error(`TYPESCRIPT_ERROR: Property 'propiedadInexistente' does not exist on type`);
      }
    },
    {
      id: 'state',
      nombre: 'Error de Estado React',
      descripcion: 'Rompe el estado del componente',
      icon: Zap,
      color: 'text-yellow-600',
      instruccionIA: 'El hook useState está siendo llamado condicionalmente, lo que viola las reglas de React Hooks. Mueve la llamada al hook fuera de cualquier condicional.',
      accion: () => {
        console.error('ERROR REACT HOOKS:', {
          error: 'React Hook called conditionally',
          ubicacion: 'GeneraErrores.tsx:89',
          descripcion: 'Violación de las reglas de React Hooks',
          instruccion_para_ai: 'El hook useState está siendo llamado condicionalmente, lo que viola las reglas de React Hooks. Mueve la llamada al hook fuera de cualquier condicional.',
          archivos_adjuntos: archivosAdjuntos.length > 0 ? `${archivosAdjuntos.length} archivo(s) adjunto(s)` : 'ninguno'
        });
        
        if (Math.random() > 0.5) {
          const [nuevoEstado] = useState('error'); // Esto rompe las reglas de hooks
        }
        throw new Error('REACT_HOOKS_ERROR: Hook called conditionally');
      }
    },
    {
      id: 'import',
      nombre: 'Error de Importación',
      descripcion: 'Intenta importar un módulo inexistente',
      icon: Network,
      color: 'text-blue-600',
      instruccionIA: 'Hay un import de un módulo que no existe. Revisa las importaciones en la parte superior del archivo y elimina o corrige las importaciones incorrectas.',
      accion: () => {
        console.error('ERROR IMPORTACION:', {
          error: 'Module not found',
          ubicacion: 'GeneraErrores.tsx:1',
          descripcion: 'Intento de importar módulo inexistente',
          instruccion_para_ai: 'Hay un import de un módulo que no existe. Revisa las importaciones en la parte superior del archivo y elimina o corrige las importaciones incorrectas.',
          archivos_adjuntos: archivosAdjuntos.length > 0 ? `${archivosAdjuntos.length} archivo(s) adjunto(s)` : 'ninguno'
        });
        
        throw new Error('MODULE_NOT_FOUND: Cannot resolve module "./moduloInexistente"');
      }
    },
    {
      id: 'memory',
      nombre: 'Error de Memoria/Loop',
      descripcion: 'Genera un loop infinito que consume memoria',
      icon: Clock,
      color: 'text-purple-600',
      instruccionIA: 'Hay un useEffect sin dependencias correctas que está generando un loop infinito. Revisa las dependencias del useEffect y añade las variables necesarias al array de dependencias.',
      accion: () => {
        console.error('ERROR LOOP INFINITO:', {
          error: 'Infinite re-render loop detected',
          ubicacion: 'GeneraErrores.tsx:125',
          descripcion: 'Loop infinito en useEffect',
          instruccion_para_ai: 'Hay un useEffect sin dependencias correctas que está generando un loop infinito. Revisa las dependencias del useEffect y añade las variables necesarias al array de dependencias.',
          archivos_adjuntos: archivosAdjuntos.length > 0 ? `${archivosAdjuntos.length} archivo(s) adjunto(s)` : 'ninguno'
        });
        
        // Simular loop infinito con setTimeout para no bloquear completamente
        const crearLoop = () => {
          setTimeout(() => {
            throw new Error('INFINITE_LOOP: useEffect re-rendering infinitely');
          }, 100);
        };
        crearLoop();
      }
    },
    {
      id: 'api',
      nombre: 'Error de API/Red',
      descripcion: 'Simula error en llamada a API',
      icon: Database,
      color: 'text-gray-600',
      instruccionIA: 'La llamada a la API está fallando. Verifica la URL del endpoint, los headers de autenticación y maneja el error apropiadamente con try/catch.',
      accion: () => {
        console.error('ERROR API:', {
          error: 'Failed to fetch API data',
          ubicacion: 'GeneraErrores.tsx:151',
          descripcion: 'Error en llamada a API externa',
          instruccion_para_ai: 'La llamada a la API está fallando. Verifica la URL del endpoint, los headers de autenticación y maneja el error apropiadamente con try/catch.',
          archivos_adjuntos: archivosAdjuntos.length > 0 ? `${archivosAdjuntos.length} archivo(s) adjunto(s)` : 'ninguno'
        });
        
        throw new Error('API_ERROR: Failed to fetch data from https://api.nonexistent.com/data');
      }
    }
  ];

  const generarError = async (error: typeof erroresPosibles[0]) => {
    setCargando(true);
    setErrorActivo(error.id);
    
    // Simular delay antes del error
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      error.accion();
    } catch (err) {
      // El error ya fue loggeado en la acción
      setCargando(false);
      throw err; // Re-lanzar para que Lovable lo detecte
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const nuevosArchivos = Array.from(e.target.files);
      setArchivosAdjuntos(prev => [...prev, ...nuevosArchivos]);
    }
  };

  const eliminarArchivo = (index: number) => {
    setArchivosAdjuntos(prev => prev.filter((_, i) => i !== index));
  };

  const limpiarTodo = () => {
    setErrorActivo(null);
    setArchivosAdjuntos([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Genera Errores - Testing Lovable AI</h2>
        <p className="text-gray-600 mb-6">
          Herramienta para testing del sistema "Try to Fix" de Lovable. Genera errores reales que activan la detección automática de errores.
        </p>
      </div>

      {/* Sección de archivos adjuntos */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-5 w-5 text-blue-600" />
            Archivos Adjuntos para Lovable AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.json"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            
            {archivosAdjuntos.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Archivos listos para enviar a Lovable AI:</p>
                {archivosAdjuntos.map((archivo, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-sm">{archivo.name} ({(archivo.size / 1024).toFixed(1)} KB)</span>
                    <Button
                      onClick={() => eliminarArchivo(index)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {errorActivo && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <strong>Error activo generado:</strong> {erroresPosibles.find(e => e.id === errorActivo)?.nombre}
                <br />
                <span className="text-sm">El error ha sido enviado a la consola con instrucciones para Lovable AI</span>
              </div>
              <Button 
                onClick={limpiarTodo}
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
                <div className="bg-gray-100 p-3 rounded text-xs mb-4">
                  <strong>Instrucción para AI:</strong> {error.instruccionIA}
                </div>
                <Button 
                  onClick={() => generarError(error)}
                  disabled={cargando}
                  className="w-full"
                  variant="destructive"
                >
                  {cargando && errorActivo === error.id ? 'Generando Error...' : 'Generar Error Real'}
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
          <div><strong>Sistema:</strong> Generación de errores reales para testing</div>
          <div><strong>Archivos adjuntos:</strong> {archivosAdjuntos.length} archivo(s)</div>
          <div><strong>Timestamp:</strong> {new Date().toLocaleString('es-AR')}</div>
          <div><strong>Estado:</strong> {errorActivo ? `Error ${errorActivo} activo` : 'Listo para generar errores'}</div>
          <div><strong>Detección Lovable:</strong> Los errores aparecerán en consola y activarán "Try to Fix"</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneraErrores;
