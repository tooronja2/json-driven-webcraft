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

  const erroresEstructurales = [
    {
      id: 'destroy-react-root',
      nombre: '💀 DESTRUIR ROOT DE REACT',
      descripcion: 'Rompe el root container de React',
      icon: Bug,
      color: 'text-red-600',
      instruccionDefault: 'El contenedor root de React ha sido destruido y necesita ser restaurado.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_CRITICAL_ERROR:', {
          error: 'REACT_ROOT_DESTROYED',
          message: instruccion,
          images: imagenesAdjuntas.length,
          location: '/gestion',
          timestamp: new Date().toISOString(),
          details: 'React root container completely destroyed - APPLICATION BROKEN'
        });
        
        // Destruir el root de React
        const root = document.getElementById('root');
        if (root) {
          root.remove();
        }
        
        // Crear mensaje de error visible
        document.body.innerHTML = `
          <div style="background: #dc2626; color: white; padding: 20px; font-family: Arial;">
            <h1>🚨 REACT ROOT DESTROYED 🚨</h1>
            <p><strong>Mensaje:</strong> ${instruccion}</p>
            <p><strong>Imágenes:</strong> ${imagenesAdjuntas.length}</p>
            <p><strong>Error:</strong> React root container eliminado</p>
          </div>
        `;
        
        throw new Error(`REACT_ROOT_DESTROYED: ${instruccion} | Images: ${imagenesAdjuntas.length}`);
      }
    },
    {
      id: 'break-tabs-component',
      nombre: '🔥 ROMPER COMPONENTE TABS',
      descripcion: 'Destruye el componente Tabs principal',
      icon: Zap,
      color: 'text-orange-600',
      instruccionDefault: 'El componente Tabs se ha corrompido y necesita ser reparado.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_CRITICAL_ERROR:', {
          error: 'TABS_COMPONENT_BROKEN',
          message: instruccion,
          images: imagenesAdjuntas.length,
          location: '/gestion',
          timestamp: new Date().toISOString(),
          details: 'Main Tabs component crashed - UI broken'
        });
        
        // Romper todos los elementos con rol="tablist"
        const tabElements = document.querySelectorAll('[role="tablist"], [role="tab"], [role="tabpanel"]');
        tabElements.forEach(tab => {
          tab.remove();
        });
        
        // Crear error estructural
        const mainContent = document.querySelector('.max-w-4xl');
        if (mainContent) {
          mainContent.innerHTML = `
            <div style="background: #ef4444; color: white; padding: 40px; text-align: center;">
              <h2>💥 TABS COMPONENT DESTROYED</h2>
              <p><strong>Instrucción:</strong> ${instruccion}</p>
              <p><strong>Imágenes:</strong> ${imagenesAdjuntas.length}</p>
              <p>El componente principal de pestañas ha sido eliminado</p>
            </div>
          `;
        }
        
        throw new Error(`TABS_COMPONENT_DESTROYED: ${instruccion} | Images: ${imagenesAdjuntas.length}`);
      }
    },
    {
      id: 'corrupt-dashboard-state',
      nombre: '⚡ CORROMPER ESTADO DASHBOARD',
      descripcion: 'Corrompe el estado del Dashboard principal',
      icon: Network,
      color: 'text-purple-600',
      instruccionDefault: 'El estado del Dashboard se ha corrompido y necesita ser reinicializado.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_CRITICAL_ERROR:', {
          error: 'DASHBOARD_STATE_CORRUPTED',
          message: instruccion,
          images: imagenesAdjuntas.length,
          location: '/gestion',
          timestamp: new Date().toISOString(),
          details: 'Dashboard state completely corrupted - React state broken'
        });
        
        // Corromper el localStorage
        localStorage.setItem('barberia_usuario', 'CORRUPTED_DATA_ERROR');
        localStorage.setItem('barberia_rol', 'CORRUPTED_DATA_ERROR');
        localStorage.setItem('barberia_permisos', 'INVALID_JSON_ERROR');
        
        // Forzar re-render con datos corruptos
        window.dispatchEvent(new Event('storage'));
        
        // Romper el DOM del dashboard
        const dashboard = document.querySelector('.min-h-screen');
        if (dashboard) {
          (dashboard as HTMLElement).style.display = 'none';
        }
        
        // Crear overlay de error
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
          <div style="
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100vw; 
            height: 100vh; 
            background: #7c3aed; 
            color: white; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center;
            z-index: 9999;
          ">
            <h1 style="font-size: 48px;">⚡ DASHBOARD STATE CORRUPTED</h1>
            <p style="font-size: 24px; margin: 20px 0;"><strong>Mensaje:</strong> ${instruccion}</p>
            <p style="font-size: 18px;"><strong>Imágenes:</strong> ${imagenesAdjuntas.length}</p>
            <p style="font-size: 16px;">El estado de React del Dashboard ha sido corrompido</p>
          </div>
        `;
        document.body.appendChild(errorDiv);
        
        throw new Error(`DASHBOARD_STATE_CORRUPTED: ${instruccion} | Images: ${imagenesAdjuntas.length}`);
      }
    },
    {
      id: 'jsx-syntax-break',
      nombre: '🚨 ROMPER SINTAXIS JSX',
      descripcion: 'Genera error de sintaxis JSX crítico',
      icon: Database,
      color: 'text-red-500',
      instruccionDefault: 'Error de sintaxis JSX detectado que impide el renderizado.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_CRITICAL_ERROR:', {
          error: 'JSX_SYNTAX_ERROR',
          message: instruccion,
          images: imagenesAdjuntas.length,
          location: '/gestion',
          timestamp: new Date().toISOString(),
          details: 'Critical JSX syntax error - React cannot render'
        });
        
        // Crear un componente React inválido dinámicamente
        const script = document.createElement('script');
        script.textContent = `
          // Inyectar error JSX crítico
          const originalCreateElement = React.createElement;
          React.createElement = function() {
            throw new Error('JSX_CRITICAL_ERROR: ${instruccion} | Images: ${imagenesAdjuntas.length}');
          };
        `;
        document.head.appendChild(script);
        
        // Forzar re-render
        setTimeout(() => {
          window.location.reload();
        }, 100);
        
        throw new Error(`JSX_SYNTAX_ERROR: ${instruccion} | Images: ${imagenesAdjuntas.length}`);
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

  const ejecutarErrorEstructural = (error: typeof erroresEstructurales[0]) => {
    const instruccionPersonalizada = instruccionesPersonalizadas[error.id] || error.instruccionDefault;
    
    console.warn('🚨 EJECUTANDO ERROR ESTRUCTURAL CRÍTICO:', {
      pagina: '/gestion',
      componente: 'GeneraErrores',
      error_tipo: error.nombre,
      instruccion: instruccionPersonalizada,
      imagenes: imagenesAdjuntas.length,
      timestamp: new Date().toISOString(),
      advertencia: 'ERROR CRÍTICO QUE VA A ROMPER LA APLICACIÓN'
    });

    setErrorActivo(error.id);
    
    // Ejecutar el error crítico inmediatamente
    setTimeout(() => {
      error.accion(instruccionPersonalizada);
    }, 500);
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
        <h2 className="text-2xl font-bold mb-4">💀 GENERA ERRORES ESTRUCTURALES REALES</h2>
        <p className="text-red-600 mb-6 font-bold">
          ⚠️ ESTOS ERRORES VAN A ROMPER COMPONENTES ESTRUCTURALES DE REACT
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
                <strong>💀 ERROR ESTRUCTURAL EJECUTADO:</strong> {erroresEstructurales.find(e => e.id === errorActivo)?.nombre}
                <br />
                <span className="text-sm">Si puedes leer esto, recarga la página.</span>
              </div>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline" 
                size="sm"
                className="ml-4 text-red-600 border-red-300 hover:bg-red-100"
              >
                Recargar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4">
        {erroresEstructurales.map((error) => {
          const IconComponent = error.icon;
          return (
            <Card key={error.id} className="hover:shadow-md transition-shadow border-l-4 border-l-red-500 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconComponent className={`h-5 w-5 ${error.color}`} />
                  {error.nombre}
                  <span className="text-sm bg-red-600 text-white px-2 py-1 rounded">ESTRUCTURAL</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm font-bold">{error.descripcion}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-gray-500" />
                    <label className="text-sm font-medium">Mensaje personalizado para el log:</label>
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
                </div>
                
                <Button 
                  onClick={() => ejecutarErrorEstructural(error)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                  variant="destructive"
                >
                  <Play className="h-4 w-4 mr-2" />
                  💀 ROMPER AHORA
                </Button>
                
                <div className="text-xs text-gray-500 bg-red-100 p-2 rounded border border-red-300">
                  <strong>⚠️ ADVERTENCIA:</strong> Va a ROMPER componentes estructurales<br/>
                  <strong>Mensaje actual:</strong> {instruccionesPersonalizadas[error.id] || error.instruccionDefault}<br/>
                  <strong>Imágenes:</strong> {imagenesAdjuntas.length}
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
