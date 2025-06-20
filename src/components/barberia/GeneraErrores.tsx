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
      id: 'crash-app-error',
      nombre: '💥 CRASHEAR APLICACIÓN COMPLETA',
      descripcion: 'Rompe TODA la aplicación para forzar Try to Fix',
      icon: Bug,
      color: 'text-red-500',
      instruccionDefault: 'La aplicación se ha crasheado y necesita ser reparada.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_FORCE_CRASH_ERROR:', {
          error: 'APPLICATION COMPLETELY CRASHED - FORCE TRY TO FIX',
          component: 'GeneraErrores -> FULL APP CRASH',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length,
          timestamp: new Date().toISOString(),
          ubicacion: '/gestion - CRASH FORZADO',
          detalles: 'ERROR CRÍTICO - APLICACIÓN INACCESIBLE'
        });
        
        // Destruir completamente la aplicación
        const body = document.body;
        body.innerHTML = `
          <div style="
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100vw; 
            height: 100vh; 
            background: #ff0000; 
            z-index: 999999; 
            display: flex; 
            flex-direction: column;
            align-items: center; 
            justify-content: center; 
            font-family: Arial, sans-serif;
            color: white; 
          ">
            <h1 style="font-size: 48px; margin-bottom: 20px;">🚨 APLICACIÓN CRASHEADA 🚨</h1>
            <div style="font-size: 24px; text-align: center; max-width: 800px; line-height: 1.5;">
              <p><strong>INSTRUCCIÓN PARA LOVABLE AI:</strong></p>
              <p style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0;">
                ${instruccion}
              </p>
              <p><strong>Imágenes adjuntas:</strong> ${imagenesAdjuntas.length}</p>
              <p><strong>Ubicación:</strong> /gestion → Tab "Genera Errores"</p>
              <p style="font-size: 18px; margin-top: 30px;">
                ⚠️ Esta aplicación está completamente rota y necesita ser reparada por Lovable AI
              </p>
              <p style="font-size: 16px; margin-top: 20px; opacity: 0.8;">
                El botón "Try to Fix" debería aparecer automáticamente
              </p>
            </div>
          </div>
        `;
        
        // Romper JavaScript también
        setTimeout(() => {
          throw new Error(`CRITICAL_APP_CRASH: ${instruccion} | Images: ${imagenesAdjuntas.length} | LOVABLE MUST SHOW TRY TO FIX NOW`);
        }, 500);
      }
    },
    {
      id: 'ui-destroyer-error',
      nombre: '🎨 DESTRUIR INTERFAZ USUARIOS',
      descripcion: 'Destruye específicamente la interfaz de usuarios',
      icon: Zap,
      color: 'text-orange-500',
      instruccionDefault: 'La interfaz de gestión de usuarios se ha corrompido y necesita ser restaurada.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_UI_DESTROYER_ERROR:', {
          error: 'USER INTERFACE COMPLETELY DESTROYED',
          component: 'GeneraErrores -> GestionUsuarios UI DESTROYED',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length,
          timestamp: new Date().toISOString(),
          ubicacion: '/gestion - UI DESTRUCTION',
          detalles: 'INTERFAZ DE USUARIOS DESTRUIDA - REQUIERE REPARACIÓN INMEDIATA'
        });
        
        // Atacar específicamente elementos de la interfaz
        const allElements = document.querySelectorAll('*');
        allElements.forEach((element, index) => {
          if (index % 2 === 0) {
            (element as HTMLElement).style.transform = 'rotate(180deg) scale(0.1)';
            (element as HTMLElement).style.opacity = '0.1';
          }
          if (index % 3 === 0) {
            element.textContent = `💥ERROR: ${instruccion}💥`;
          }
        });
        
        // Crear overlay destructivo
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
          <div style="
            position: fixed; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ff0000, #ff6600); 
            z-index: 999999; 
            padding: 40px;
            border-radius: 20px;
            color: white;
            font-size: 20px;
            text-align: center;
            box-shadow: 0 0 50px rgba(255,0,0,0.5);
            border: 5px solid #fff;
          ">
            <h2>🚨 INTERFAZ DESTRUIDA 🚨</h2>
            <p><strong>Instrucción:</strong> ${instruccion}</p>
            <p><strong>Imágenes:</strong> ${imagenesAdjuntas.length}</p>
            <p style="font-size: 16px; margin-top: 20px;">
              Lovable AI debe mostrar "Try to Fix" AHORA
            </p>
          </div>
        `;
        document.body.appendChild(errorDiv);
        
        throw new Error(`UI_COMPLETELY_DESTROYED: ${instruccion} - FORCE_TRY_TO_FIX_NOW`);
      }
    },
    {
      id: 'react-killer-error',
      nombre: '⚛️ MATAR REACT COMPLETAMENTE',
      descripcion: 'Mata React y rompe toda la reactividad',
      icon: Network,
      color: 'text-purple-600',
      instruccionDefault: 'React se ha crasheado y la aplicación no responde.',
      accion: (instruccion: string) => {
        console.error('LOVABLE_REACT_KILLER_ERROR:', {
          error: 'REACT FRAMEWORK KILLED - TOTAL BREAKDOWN',
          component: 'GeneraErrores -> REACT DESTROYED',
          instruccion_para_ai: instruccion,
          imagenes_adjuntas: imagenesAdjuntas.length,
          timestamp: new Date().toISOString(),
          ubicacion: '/gestion - REACT KILLED',
          detalles: 'REACT COMPLETAMENTE ROTO - APLICACIÓN INOPERATIVA'
        });
        
        // Matar React de forma agresiva
        const reactRoot = document.getElementById('root');
        if (reactRoot) {
          reactRoot.innerHTML = `
            <div style="
              width: 100vw; 
              height: 100vh; 
              background: linear-gradient(45deg, #000, #ff0000, #000); 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              color: white; 
              font-family: monospace;
              animation: blink 0.5s infinite;
            ">
              <style>
                @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0.1; } }
                body { overflow: hidden !important; }
              </style>
              <h1 style="font-size: 60px; margin-bottom: 30px;">💀 REACT MUERTO 💀</h1>
              <div style="font-size: 24px; text-align: center; background: rgba(0,0,0,0.8); padding: 30px; border-radius: 15px; max-width: 90%;">
                <p><strong>🤖 MENSAJE PARA LOVABLE AI:</strong></p>
                <p style="color: #ffff00; font-size: 28px; margin: 20px 0;">${instruccion}</p>
                <p><strong>📷 Imágenes:</strong> ${imagenesAdjuntas.length}</p>
                <p><strong>📍 Ubicación:</strong> /gestion</p>
                <p style="margin-top: 30px; font-size: 20px; color: #ff6666;">
                  ⚠️ REACT FRAMEWORK COMPLETAMENTE DESTRUIDO ⚠️
                </p>
                <p style="font-size: 18px; color: #66ff66;">
                  🔧 LOVABLE DEBE MOSTRAR "TRY TO FIX" INMEDIATAMENTE
                </p>
              </div>
            </div>
          `;
        }
        
        // Error crítico que debe crashear todo
        setTimeout(() => {
          window.location.href = 'javascript:void(0)';
          throw new Error(`REACT_FRAMEWORK_KILLED: ${instruccion} | Images: ${imagenesAdjuntas.length} | CRITICAL_ERROR_FORCE_FIX`);
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

  const ejecutarErrorRapido = (error: typeof erroresRapidos[0]) => {
    const instruccionPersonalizada = instruccionesPersonalizadas[error.id] || error.instruccionDefault;
    
    console.info('🚨 EJECUTANDO ERROR CRÍTICO FORZADO:', {
      pagina: '/gestion',
      componente: 'GeneraErrores',
      error_tipo: error.nombre,
      instruccion: instruccionPersonalizada,
      imagenes: imagenesAdjuntas.length,
      timestamp: new Date().toISOString(),
      mensaje: 'ERROR CRÍTICO - DEBE ACTIVAR TRY TO FIX INMEDIATAMENTE'
    });

    setErrorActivo(error.id);
    
    // Ejecutar inmediatamente el error crítico
    setTimeout(() => {
      error.accion(instruccionPersonalizada);
    }, 200);
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
        <h2 className="text-2xl font-bold mb-4">💀 GENERA ERRORES CRÍTICOS FORZADOS</h2>
        <p className="text-red-600 mb-6 font-bold">
          ⚠️ ESTOS BOTONES VAN A CRASHEAR COMPLETAMENTE LA APLICACIÓN PARA FORZAR "TRY TO FIX"
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
                <strong>💀 ERROR CRÍTICO EJECUTADO:</strong> {erroresRapidos.find(e => e.id === errorActivo)?.nombre}
                <br />
                <span className="text-sm">Si puedes leer esto, el error no fue lo suficientemente fuerte.</span>
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
            <Card key={error.id} className="hover:shadow-md transition-shadow border-l-4 border-l-red-500 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconComponent className={`h-5 w-5 ${error.color}`} />
                  {error.nombre}
                  <span className="text-sm bg-red-600 text-white px-2 py-1 rounded">CRÍTICO</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm font-bold">{error.descripcion}</p>
                
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
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                    variant="destructive"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    💀 CRASHEAR AHORA
                  </Button>
                </div>
                
                <div className="text-xs text-gray-500 bg-red-100 p-2 rounded border border-red-300">
                  <strong>⚠️ ADVERTENCIA:</strong> Este error va a ROMPER completamente la aplicación<br/>
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
