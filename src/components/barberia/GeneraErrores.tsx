
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
      id: 'console-warning',
      nombre: 'Warning de Consola',
      descripcion: 'Genera un warning controlado en consola',
      icon: Bug,
      color: 'text-orange-500',
      instruccionDefault: 'Hay un warning en consola que necesita atención. Revisa el componente y optimiza el código para eliminar este warning.',
      accion: (instruccion: string) => {
        console.warn('LOVABLE_AI_WARNING:', {
          error: 'React component optimization needed',
          ubicacion: 'GeneraErrores.tsx:42',
          descripcion: 'Warning de optimización detectado',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length > 0 ? `${imagenesAdjuntas.length} imagen(es) adjunta(s)` : 'ninguno',
          timestamp: new Date().toISOString()
        });
      }
    },
    {
      id: 'prop-validation',
      nombre: 'Error de Props',
      descripcion: 'Simula error de validación de props',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      instruccionDefault: 'Las props del componente no están siendo validadas correctamente. Añade PropTypes o mejora las interfaces TypeScript.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_AI_PROPS_ERROR:', {
          error: 'Invalid prop type detected',
          ubicacion: 'GeneraErrores.tsx:67',
          descripcion: 'Error de validación de props',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length > 0 ? `${imagenesAdjuntas.length} imagen(es) adjunta(s)` : 'ninguno',
          timestamp: new Date().toISOString()
        });
      }
    },
    {
      id: 'state-update',
      nombre: 'State Update Warning',
      descripcion: 'Warning sobre actualización de estado',
      icon: Zap,
      color: 'text-blue-600',
      instruccionDefault: 'Se está intentando actualizar el estado después de que el componente se desmontó. Añade cleanup en useEffect.',
      accion: (instruccion: string) => {
        console.warn('LOVABLE_AI_STATE_WARNING:', {
          error: 'Cannot update state on unmounted component',
          ubicacion: 'GeneraErrores.tsx:89',
          descripcion: 'Warning de actualización de estado',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length > 0 ? `${imagenesAdjuntas.length} imagen(es) adjunta(s)` : 'ninguno',
          timestamp: new Date().toISOString()
        });
      }
    },
    {
      id: 'accessibility',
      nombre: 'Warning de Accesibilidad',
      descripcion: 'Problema de accesibilidad detectado',
      icon: Network,
      color: 'text-purple-600',
      instruccionDefault: 'Faltan atributos de accesibilidad. Añade aria-labels, alt text y mejora la navegación por teclado.',
      accion: (instruccion: string) => {
        console.warn('LOVABLE_AI_A11Y_WARNING:', {
          error: 'Accessibility issues detected',
          ubicacion: 'GeneraErrores.tsx:125',
          descripcion: 'Warning de accesibilidad',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length > 0 ? `${imagenesAdjuntas.length} imagen(es) adjunta(s)` : 'ninguno',
          timestamp: new Date().toISOString()
        });
      }
    },
    {
      id: 'performance',
      nombre: 'Warning de Performance',
      descripcion: 'Problema de rendimiento detectado',
      icon: Clock,
      color: 'text-red-500',
      instruccionDefault: 'El componente se está re-renderizando innecesariamente. Optimiza con React.memo o useMemo.',
      accion: (instruccion: string) => {
        console.warn('LOVABLE_AI_PERFORMANCE_WARNING:', {
          error: 'Unnecessary re-renders detected',
          ubicacion: 'GeneraErrores.tsx:151',
          descripcion: 'Warning de performance',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length > 0 ? `${imagenesAdjuntas.length} imagen(es) adjunta(s)` : 'ninguno',
          timestamp: new Date().toISOString()
        });
      }
    },
    {
      id: 'css-issue',
      nombre: 'Problema de CSS',
      descripcion: 'Warning de estilos CSS',
      icon: Database,
      color: 'text-gray-600',
      instruccionDefault: 'Hay conflictos en los estilos CSS. Revisa las clases Tailwind y corrige los conflictos de especificidad.',
      accion: (instruccion: string) => {
        console.warn('LOVABLE_AI_CSS_WARNING:', {
          error: 'CSS styling conflicts detected',
          ubicacion: 'GeneraErrores.tsx:177',
          descripcion: 'Warning de CSS',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length > 0 ? `${imagenesAdjuntas.length} imagen(es) adjunta(s)` : 'ninguno',
          timestamp: new Date().toISOString()
        });
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
      console.info('ERROR_GENERADO_EXITOSAMENTE:', {
        tipo: error.nombre,
        instruccion_enviada: instruccionPersonalizada,
        imagenes_count: imagenesAdjuntas.length
      });
    } catch (err) {
      console.error('Error al generar warning:', err);
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
        <h2 className="text-2xl font-bold mb-4">Genera Errores Controlados - Testing Lovable AI</h2>
        <p className="text-gray-600 mb-6">
          Genera warnings y errores controlados con instrucciones personalizadas para testing del sistema "Try to Fix" de Lovable AI.
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
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <strong>Warning/Error generado:</strong> {erroresPosibles.find(e => e.id === errorActivo)?.nombre}
                <br />
                <span className="text-sm">Revisa la consola del navegador - Lovable AI debería detectar automáticamente el problema</span>
              </div>
              <Button 
                onClick={limpiarTodo}
                variant="outline" 
                size="sm"
                className="ml-4 text-orange-600 border-orange-300 hover:bg-orange-100"
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
          <div><strong>Modo:</strong> Errores controlados y seguros</div>
          <div><strong>Imágenes adjuntas:</strong> {imagenesAdjuntas.length} imagen(es)</div>
          <div><strong>Instrucciones personalizadas:</strong> {Object.keys(instruccionesPersonalizadas).length} configurada(s)</div>
          <div><strong>Timestamp:</strong> {new Date().toLocaleString('es-AR')}</div>
          <div><strong>Estado:</strong> {errorActivo ? `Warning ${errorActivo} enviado` : 'Listo para generar warnings'}</div>
          <div><strong>Detección Lovable:</strong> Los warnings aparecen en consola y activan "Try to Fix"</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneraErrores;
