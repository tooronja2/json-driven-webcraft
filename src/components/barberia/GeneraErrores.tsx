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
      id: 'ui-break-error',
      nombre: '💥 Romper UI de Usuarios',
      descripcion: 'Rompe visualmente la interfaz de gestión de usuarios',
      icon: Bug,
      color: 'text-red-500',
      instruccionDefault: 'La interfaz de usuarios tiene un problema visual que necesita ser corregido.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_UI_BREAK_ERROR:', {
          error: 'UI component crashed - visual interface broken',
          component: 'GeneraErrores -> GestionUsuarios UI',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length,
          timestamp: new Date().toISOString(),
          ubicacion: '/gestion - Tab Genera Errores',
          detalles: 'Error forzado para activar Try to Fix de Lovable'
        });
        
        // Romper el DOM directamente para que Lovable lo detecte
        const headerElement = document.querySelector('h1');
        if (headerElement) {
          headerElement.innerHTML = `<div style="background: red; color: white; padding: 20px; position: fixed; top: 0; left: 0; right: 0; z-index: 9999; font-size: 18px; text-align: center;">
            🚨 ERROR EJECUTADO: ${instruccion} | Imágenes: ${imagenesAdjuntas.length} | Lovable debe mostrar "Try to Fix" ahora
          </div>` + headerElement.innerHTML;
        }
        
        // También romper el componente actual
        throw new Error(`UI_BREAK_FORCED: ${instruccion} - Imágenes adjuntas: ${imagenesAdjuntas.length}`);
      }
    },
    {
      id: 'text-corruption-error',
      nombre: '📝 Corromper Texto de Página',
      descripcion: 'Corrompe el texto visible de la página actual',
      icon: Zap,
      color: 'text-orange-500',
      instruccionDefault: 'El texto de la página se ha corrompido y necesita ser restaurado.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_TEXT_CORRUPTION_ERROR:', {
          error: 'Page text corruption detected',
          component: 'GeneraErrores -> Page Text',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length,
          timestamp: new Date().toISOString(),
          ubicacion: '/gestion - Tab Genera Errores',
          detalles: 'Texto corrompido intencionalmente'
        });
        
        // Corromper todo el texto visible de la página
        const allTextElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, button, label');
        allTextElements.forEach((element, index) => {
          if (element.textContent && element.textContent.length > 3 && index % 3 === 0) {
            element.textContent = `🔥ERROR🔥 ${instruccion} [IMG:${imagenesAdjuntas.length}]`;
          }
        });
        
        throw new Error(`TEXT_CORRUPTION_FORCED: ${instruccion}`);
      }
    },
    {
      id: 'layout-destroyer-error',
      nombre: '🎨 Destruir Layout',
      descripcion: 'Destruye completamente el layout de la página',
      icon: Network,
      color: 'text-purple-600',
      instruccionDefault: 'El layout de la página se ha roto y necesita ser reparado.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_LAYOUT_DESTROYER_ERROR:', {
          error: 'Page layout completely destroyed',
          component: 'GeneraErrores -> Page Layout',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length,
          timestamp: new Date().toISOString(),
          ubicacion: '/gestion - Tab Genera Errores',
          detalles: 'Layout destruido para forzar detección'
        });
        
        // Destruir completamente el layout
        const body = document.body;
        const errorOverlay = document.createElement('div');
        errorOverlay.innerHTML = `
          <div style="
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100vw; 
            height: 100vh; 
            background: linear-gradient(45deg, red, orange, yellow); 
            z-index: 999999; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 24px; 
            color: white; 
            text-align: center;
            font-weight: bold;
          ">
            <div>
              🚨 LAYOUT DESTRUIDO 🚨<br/>
              Instrucción: ${instruccion}<br/>
              Imágenes: ${imagenesAdjuntas.length}<br/>
              <small>Lovable debería mostrar "Try to Fix"</small>
            </div>
          </div>
        `;
        body.appendChild(errorOverlay);
        
        throw new Error(`LAYOUT_DESTROYED: ${instruccion} - Images: ${imagenesAdjuntas.length}`);
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
    
    console.info('🚨 EJECUTANDO ERROR REAL FORZADO:', {
      pagina: '/gestion',
      componente: 'GeneraErrores',
      error_tipo: error.nombre,
      instruccion: instruccionPersonalizada,
      imagenes: imagenesAdjuntas.length,
      timestamp: new Date().toISOString(),
      mensaje: 'Este error DEBE romper la página y activar Try to Fix'
    });

    setErrorActivo(error.id);
    
    // Pequeño delay para asegurar que el estado se actualice antes del error
    setTimeout(() => {
      error.accion(instruccionPersonalizada);
    }, 100);
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
        <h2 className="text-2xl font-bold mb-4">🚨 Genera Errores REALES Forzados</h2>
        <p className="text-gray-600 mb-6">
          Estos botones van a ROMPER VISUALMENTE la página actual para forzar que Lovable muestre "Try to Fix" inmediatamente.
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
                <strong>🚨 ERROR FORZADO EJECUTADO:</strong> {erroresRapidos.find(e => e.id === errorActivo)?.nombre}
                <br />
                <span className="text-sm">Si ves este mensaje sin que la página se haya roto, algo falló.</span>
              </div>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline" 
                size="sm"
                className="ml-4 text-red-600 border-red-300 hover:bg-red-100"
              >
                Recargar Página
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4">
        {erroresRapidos.map((error) => {
          const IconComponent = error.icon;
          return (
            <Card key={error.id} className="hover:shadow-md transition-shadow border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconComponent className={`h-5 w-5 ${error.color}`} />
                  {error.nombre}
                  <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">FORZADO</span>
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
                    onChange={(e) => setInstruccionesPersonalizadas(prev => ({
                      ...prev,
                      [error.id]: e.target.value
                    }))}
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
                    💥 FORZAR ERROR AHORA
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
          <CardTitle className="text-lg">🎯 Estado del Generador de Errores Forzados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>Página actual:</strong> /gestion</div>
          <div><strong>Componente:</strong> GeneraErrores (Tab activo)</div>
          <div><strong>Imágenes listas:</strong> {imagenesAdjuntas.length} imagen(es)</div>
          <div><strong>Instrucciones personalizadas:</strong> {Object.keys(instruccionesPersonalizadas).length} configurada(s)</div>
          <div><strong>Último error:</strong> {errorActivo || 'Ninguno'}</div>
          <div><strong>Estado Lovable:</strong> Listo para detectar errores forzados</div>
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded mt-2">
            ⚠️ <strong>NUEVO:</strong> Estos errores FUERZAN cambios visuales en la página para que Lovable detecte el problema inmediatamente.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneraErrores;
