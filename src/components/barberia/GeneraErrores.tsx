
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Bug, Zap, Database, Network, Clock, Upload, X, Edit3, Image, Play } from 'lucide-react';

const GeneraErrores: React.FC = () => {
  const [errorActivo, setErrorActivo] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [instruccionesPersonalizadas, setInstruccionesPersonalizadas] = useState<{[key: string]: string}>({});
  const [imagenesAdjuntas, setImagenesAdjuntas] = useState<{file: File, preview: string}[]>([]);
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  const erroresRapidos = [
    {
      id: 'render-error',
      nombre: 'Error de Renderizado',
      descripcion: 'Rompe el renderizado del componente actual',
      icon: Bug,
      color: 'text-red-500',
      instruccionDefault: 'El componente no se está renderizando correctamente debido a un error de JSX.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_RENDER_ERROR:', {
          error: 'Cannot read properties of undefined (reading \'map\')',
          component: 'GeneraErrores',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length,
          timestamp: new Date().toISOString(),
          ubicacion: '/gestion - Tab Genera Errores'
        });
        
        // Forzar error de renderizado inmediato
        const datos: any = undefined;
        return datos.map((item: any) => item.nombre);
      }
    },
    {
      id: 'state-error', 
      nombre: 'Error de Estado',
      descripcion: 'Rompe el estado del componente',
      icon: Zap,
      color: 'text-yellow-600',
      instruccionDefault: 'Hay un problema con el manejo del estado que está causando que el componente falle.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_STATE_ERROR:', {
          error: 'TypeError: Cannot read properties of null',
          component: 'GeneraErrores',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length,
          timestamp: new Date().toISOString(),
          ubicacion: '/gestion - Tab Genera Errores'
        });
        
        // Forzar error de estado
        const estadoNulo: any = null;
        throw new Error(`Cannot access property of null state - ${instruccion}`);
      }
    },
    {
      id: 'hook-error',
      nombre: 'Error de Hook',
      descripcion: 'Rompe el uso de hooks de React',
      icon: Network,
      color: 'text-blue-600', 
      instruccionDefault: 'Los hooks de React no se están usando correctamente en este componente.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_HOOK_ERROR:', {
          error: 'Invalid hook call. Hooks can only be called inside function components',
          component: 'GeneraErrores',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length,
          timestamp: new Date().toISOString(),
          ubicacion: '/gestion - Tab Genera Errores'
        });
        
        // Forzar error de hook
        throw new Error(`Hook error in component - ${instruccion}`);
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

  const ejecutarErrorRapido = (error: typeof erroresRapidos[0]) => {
    const instruccionPersonalizada = instruccionesPersonalizadas[error.id] || error.instruccionDefault;
    
    console.info('🚨 EJECUTANDO ERROR REAL EN PÁGINA ACTUAL:', {
      pagina: '/gestion',
      componente: 'GeneraErrores',
      error_tipo: error.nombre,
      instruccion: instruccionPersonalizada,
      imagenes: imagenesAdjuntas.length,
      timestamp: new Date().toISOString()
    });

    setErrorActivo(error.id);
    
    // Ejecutar el error inmediatamente para romper la página
    error.accion(instruccionPersonalizada);
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
        <h2 className="text-2xl font-bold mb-4">🚨 Genera Errores REALES que Rompan la Página</h2>
        <p className="text-gray-600 mb-6">
          Estos botones van a generar errores reales que van a romper la página actual para que Lovable muestre automáticamente "Try to Fix".
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
                <strong>🚨 ERROR REAL EJECUTADO:</strong> {erroresRapidos.find(e => e.id === errorActivo)?.nombre}
                <br />
                <span className="text-sm">Si ves este mensaje, el error no rompió la página. Intenta con otro error.</span>
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

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        {erroresRapidos.map((error) => {
          const IconComponent = error.icon;
          return (
            <Card key={error.id} className="hover:shadow-md transition-shadow border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconComponent className={`h-5 w-5 ${error.color}`} />
                  {error.nombre}
                  <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">ROMPE PÁGINA</span>
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
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => ejecutarErrorRapido(error)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    variant="destructive"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    💥 ROMPER PÁGINA AHORA
                  </Button>
                </div>
                
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <strong>Ubicación:</strong> /gestion → Tab "Genera Errores"<br/>
                  <strong>Imágenes adjuntas:</strong> {imagenesAdjuntas.length}<br/>
                  <strong>Instrucción actual:</strong> {instruccionesPersonalizadas[error.id] || error.instruccionDefault}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">🎯 Estado del Generador de Errores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>Página actual:</strong> /gestion</div>
          <div><strong>Componente:</strong> GeneraErrores (Tab activo)</div>
          <div><strong>Imágenes listas:</strong> {imagenesAdjuntas.length} imagen(es)</div>
          <div><strong>Instrucciones personalizadas:</strong> {Object.keys(instruccionesPersonalizadas).length} configurada(s)</div>
          <div><strong>Último error:</strong> {errorActivo || 'Ninguno'}</div>
          <div><strong>Estado Lovable:</strong> Listo para detectar errores reales automáticamente</div>
          <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded mt-2">
            ⚠️ <strong>ADVERTENCIA:</strong> Estos errores van a romper la página real. Lovable debería mostrar "Try to Fix" automáticamente.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneraErrores;
