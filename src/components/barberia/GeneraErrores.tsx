
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Bug, Zap, Database, Network, Clock, Upload, X, Edit3, Image } from 'lucide-react';

const GeneraErrores: React.FC = () => {
  const [errorActivo, setErrorActivo] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [instruccionesPersonalizadas, setInstruccionesPersonalizadas] = useState<{[key: string]: string}>({});
  const [imagenesAdjuntas, setImagenesAdjuntas] = useState<{file: File, preview: string}[]>([]);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  const erroresPosibles = [
    {
      id: 'undefined-variable',
      nombre: 'Variable Undefined',
      descripcion: 'Genera error de variable no definida',
      icon: Bug,
      color: 'text-red-500',
      instruccionDefault: 'Hay una variable que no está definida y está causando un error en el componente.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_AI_ERROR:', {
          error: 'ReferenceError: variableNoDefinida is not defined',
          ubicacion: 'GeneraErrores.tsx:32',
          descripcion: 'Variable no definida',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length > 0 ? `${imagenesAdjuntas.length} imagen(es) adjunta(s)` : 'ninguno',
          timestamp: new Date().toISOString()
        });
        
        // Esto va a generar un error real
        setTimeout(() => {
          // @ts-ignore - Forzamos el error
          console.log(variableNoDefinida.propiedad);
        }, 100);
      }
    },
    {
      id: 'jsx-error',
      nombre: 'Error de JSX',
      descripcion: 'Genera error de renderizado JSX',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      instruccionDefault: 'Hay un problema con el JSX que está causando que el componente no se renderice correctamente.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_AI_JSX_ERROR:', {
          error: 'Error: Cannot read properties of undefined',
          ubicacion: 'GeneraErrores.tsx:52',
          descripcion: 'Error de renderizado JSX',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length > 0 ? `${imagenesAdjuntas.length} imagen(es) adjunta(s)` : 'ninguno',
          timestamp: new Date().toISOString()
        });
        
        // Forzamos un error de renderizado
        setTimeout(() => {
          const elemento = document.createElement('div');
          elemento.innerHTML = '<div><span>Unclosed tag';
          document.body.appendChild(elemento);
        }, 100);
      }
    },
    {
      id: 'async-error',
      nombre: 'Error Async/Promise',
      descripcion: 'Genera error en operación asíncrona',
      icon: Zap,
      color: 'text-blue-600',
      instruccionDefault: 'Hay una promesa que está siendo rechazada y no está siendo manejada correctamente.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_AI_ASYNC_ERROR:', {
          error: 'Unhandled Promise Rejection: Failed to fetch',
          ubicacion: 'GeneraErrores.tsx:74',
          descripcion: 'Error en operación asíncrona',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length > 0 ? `${imagenesAdjuntas.length} imagen(es) adjunta(s)` : 'ninguno',
          timestamp: new Date().toISOString()
        });
        
        // Generamos un error de promesa no manejada
        setTimeout(() => {
          new Promise((_, reject) => {
            reject(new Error('Operación asíncrona falló'));
          });
        }, 100);
      }
    },
    {
      id: 'type-error',
      nombre: 'TypeError',
      descripcion: 'Genera error de tipo de dato',
      icon: Network,
      color: 'text-purple-600',
      instruccionDefault: 'Se está intentando acceder a una propiedad de un valor null o undefined.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_AI_TYPE_ERROR:', {
          error: 'TypeError: Cannot read properties of null',
          ubicacion: 'GeneraErrores.tsx:96',
          descripcion: 'Error de tipo de dato',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length > 0 ? `${imagenesAdjuntas.length} imagen(es) adjunta(s)` : 'ninguno',
          timestamp: new Date().toISOString()
        });
        
        // Generamos un TypeError real
        setTimeout(() => {
          const objetoNulo = null;
          // @ts-ignore - Forzamos el error
          console.log(objetoNulo.propiedad.valor);
        }, 100);
      }
    },
    {
      id: 'syntax-error',
      nombre: 'Error de Sintaxis',
      descripcion: 'Simula error de sintaxis en runtime',
      icon: Clock,
      color: 'text-red-500',
      instruccionDefault: 'Hay un error de sintaxis en el código JavaScript que está siendo evaluado dinámicamente.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_AI_SYNTAX_ERROR:', {
          error: 'SyntaxError: Unexpected token',
          ubicacion: 'GeneraErrores.tsx:118',
          descripcion: 'Error de sintaxis',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length > 0 ? `${imagenesAdjuntas.length} imagen(es) adjunta(s)` : 'ninguno',
          timestamp: new Date().toISOString()
        });
        
        // Generamos un error de sintaxis
        setTimeout(() => {
          try {
            eval('const x = {');
          } catch (e) {
            throw new Error('Error de sintaxis detectado: ' + e);
          }
        }, 100);
      }
    },
    {
      id: 'network-error',
      nombre: 'Error de Red',
      descripcion: 'Genera error de conexión/fetch',
      icon: Database,
      color: 'text-gray-600',
      instruccionDefault: 'Hay un problema con una petición de red que está fallando y necesita ser manejada.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_AI_NETWORK_ERROR:', {
          error: 'NetworkError: Failed to fetch from invalid URL',
          ubicacion: 'GeneraErrores.tsx:140',
          descripcion: 'Error de red/fetch',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length > 0 ? `${imagenesAdjuntas.length} imagen(es) adjunta(s)` : 'ninguno',
          timestamp: new Date().toISOString()
        });
        
        // Generamos un error de red
        setTimeout(() => {
          fetch('https://url-que-no-existe-para-generar-error.invalid')
            .catch(error => {
              throw new Error('Error de conexión: ' + error.message);
            });
        }, 100);
      }
    }
  ];

  // Manejar paste de imágenes
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const preview = event.target?.result as string;
              setImagenesAdjuntas(prev => [...prev, { file, preview }]);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const generarError = async (error: typeof erroresPosibles[0]) => {
    setCargando(true);
    setErrorActivo(error.id);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const instruccionPersonalizada = instruccionesPersonalizadas[error.id] || error.instruccionDefault;
    
    try {
      error.accion(instruccionPersonalizada);
      console.info('ERROR_REAL_GENERADO:', {
        tipo: error.nombre,
        instruccion_enviada: instruccionPersonalizada,
        imagenes_count: imagenesAdjuntas.length,
        nota: 'Este error debería activar el Try to Fix de Lovable AI automáticamente'
      });
    } catch (err) {
      console.error('Error al generar error real:', err);
    }
    
    setCargando(false);
  };

  const actualizarInstruccion = (errorId: string, nuevaInstruccion: string) => {
    setInstruccionesPersonalizadas(prev => ({
      ...prev,
      [errorId]: nuevaInstruccion
    }));
  };

  const eliminarImagen = (index: number) => {
    setImagenesAdjuntas(prev => prev.filter((_, i) => i !== index));
  };

  const limpiarTodo = () => {
    setErrorActivo(null);
    setImagenesAdjuntas([]);
    setInstruccionesPersonalizadas({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Genera Errores REALES - Activa "Try to Fix"</h2>
        <p className="text-gray-600 mb-6">
          Genera errores reales que rompen la aplicación para activar automáticamente el "Try to Fix" de Lovable AI.
        </p>
      </div>

      {/* Área de paste para imágenes */}
      <Card className="border-dashed border-2 border-blue-300 bg-blue-50">
        <CardContent className="p-6">
          <div 
            ref={pasteAreaRef}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Image className="h-6 w-6" />
              <span className="font-medium">Área de Imágenes para Lovable AI</span>
            </div>
            <p className="text-sm text-gray-600">
              Presiona <kbd className="bg-gray-200 px-2 py-1 rounded text-xs">Ctrl + V</kbd> en cualquier lugar para pegar imágenes del portapapeles
            </p>
            
            {imagenesAdjuntas.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-blue-700">
                  {imagenesAdjuntas.length} imagen(es) lista(s) para enviar a Lovable AI:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {imagenesAdjuntas.map((imagen, index) => (
                    <div key={index} className="relative bg-white rounded border p-2">
                      <img 
                        src={imagen.preview} 
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <Button
                        onClick={() => eliminarImagen(index)}
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {(imagen.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ))}
                </div>
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
                <strong>Error REAL generado:</strong> {erroresPosibles.find(e => e.id === errorActivo)?.nombre}
                <br />
                <span className="text-sm">Lovable AI debería mostrar automáticamente el botón "Try to Fix"</span>
              </div>
              <Button 
                onClick={limpiarTodo}
                variant="outline" 
                size="sm"
                className="ml-4 text-red-600 border-red-300 hover:bg-red-100"
              >
                Limpiar Todo
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
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">{error.descripcion}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-gray-500" />
                    <label className="text-sm font-medium">Instrucción personalizada para Lovable AI:</label>
                  </div>
                  <Textarea
                    placeholder={error.instruccionDefault}
                    value={instruccionesPersonalizadas[error.id] || ''}
                    onChange={(e) => actualizarInstruccion(error.id, e.target.value)}
                    className="text-sm"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    Si está vacío, se usará: "{error.instruccionDefault}"
                  </p>
                </div>
                
                <Button 
                  onClick={() => generarError(error)}
                  disabled={cargando}
                  className="w-full"
                  variant="secondary"
                >
                  {cargando && errorActivo === error.id ? 'Generando Warning...' : 'Enviar a Lovable AI'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Estado del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>Modo:</strong> Errores REALES que activan Try to Fix</div>
          <div><strong>Imágenes adjuntas:</strong> {imagenesAdjuntas.length} imagen(es)</div>
          <div><strong>Instrucciones personalizadas:</strong> {Object.keys(instruccionesPersonalizadas).length} configurada(s)</div>
          <div><strong>Timestamp:</strong> {new Date().toLocaleString('es-AR')}</div>
          <div><strong>Estado:</strong> {errorActivo ? `Error ${errorActivo} generado` : 'Listo para generar errores reales'}</div>
          <div><strong>Detección Lovable:</strong> Errores reales que activan "Try to Fix" automáticamente</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneraErrores;
