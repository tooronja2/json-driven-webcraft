import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Bug, X, Edit3, Image, Play, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GeneraErrores: React.FC = () => {
  const [aplicandoCambio, setAplicandoCambio] = useState(false);
  const [errorEstadisticas, setErrorEstadisticas] = useState(false);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState<string[]>([]);
  const [forceError, setForceError] = useState(false);
  const [mensajeErrorPersonalizado, setMensajeErrorPersonalizado] = useState('');
  const [imagenesAdjuntas, setImagenesAdjuntas] = useState<{file: File, preview: string}[]>([]);
  const pasteAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  // Función que aplica cambio con error controlado - PERMITE MÚLTIPLES SOLICITUDES
  const aplicarCambioConError = () => {
    if (!mensajeErrorPersonalizado.trim()) return;

    setAplicandoCambio(true);
    
    // Agregar a la lista de solicitudes enviadas (NO resetear las anteriores)
    setSolicitudesEnviadas(prev => [...prev, mensajeErrorPersonalizado]);
    
    // Activar error en estadísticas (componente aislado)
    setErrorEstadisticas(true);
    setForceError(true); // Forzar error real
    setAplicandoCambio(false);
    
    // Mostrar feedback
    toast({
      title: "Solicitud enviada",
      description: `Solicitud #${solicitudesEnviadas.length + 1} enviada. Usa 'Try to Fix' para procesar.`,
      variant: "default",
    });

    // NO resetear el mensaje para permitir modificaciones rápidas
    // setMensajeErrorPersonalizado('');
  };

  // Función que resetea COMPLETAMENTE el sistema
  const resetearSistema = () => {
    setErrorEstadisticas(false);
    setForceError(false);
    setSolicitudesEnviadas([]);
    setMensajeErrorPersonalizado('');
    setImagenesAdjuntas([]);
    
    toast({
      title: "Sistema reseteado",
      description: "Todas las solicitudes y errores han sido limpiados",
    });
  };

  // Función para limpiar solo el mensaje actual
  const limpiarMensaje = () => {
    setMensajeErrorPersonalizado('');
    setImagenesAdjuntas([]);
  };

  // Componente de estadísticas que mantiene el error PERSISTENTE
  const renderEstadisticasAdmin = () => {
    // MANTENER EL ERROR ACTIVO - No resetear automáticamente
    if (errorEstadisticas && forceError && solicitudesEnviadas.length > 0) {
      console.log('🔧 MÚLTIPLES SOLICITUDES ACTIVAS:', solicitudesEnviadas.length);
      console.log('🔧 SOLICITUDES ENVIADAS:', solicitudesEnviadas);
      console.log('🔧 IMÁGENES ADJUNTAS:', imagenesAdjuntas.length);
      console.log('🔧 ESTADO: Sistema en modo error persistente para múltiples solicitudes');
      
      // Crear un error que contenga TODAS las solicitudes
      const mensajeCompleto = `MÚLTIPLES SOLICITUDES: ${solicitudesEnviadas.join(' | ')} | Images: ${imagenesAdjuntas.length}`;
      throw new Error(`CONTROLLED_ERROR: ${mensajeCompleto}`);
    }

    return null;
  };

  const eliminarImagen = (index: number) => {
    setImagenesAdjuntas(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">🔧 GENERA MÚLTIPLES SOLICITUDES</h2>
        <p className="text-blue-600 mb-6 font-bold">
          ✅ MODO MÚLTIPLE: Envía varias solicitudes seguidas sin resetear
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

      {/* Renderizar estadísticas que pueden fallar */}
      {renderEstadisticasAdmin()}

      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bug className="h-5 w-5 text-blue-600" />
            🔧 SOLICITUDES MÚLTIPLES
            <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded">PERSISTENTE</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm font-bold">
            Envía múltiples solicitudes sin resetear. El sistema mantiene el error activo.
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium">Nueva solicitud:</label>
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="Describe qué quieres que implemente Lovable..."
                value={mensajeErrorPersonalizado}
                onChange={(e) => setMensajeErrorPersonalizado(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                disabled={aplicandoCambio}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={aplicarCambioConError}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={aplicandoCambio}
              >
                <Zap className="h-3 w-3 mr-1" />
                {aplicandoCambio ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
              <Button
                onClick={limpiarMensaje}
                size="sm"
                variant="outline"
              >
                Limpiar
              </Button>
              <Button
                onClick={resetearSistema}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                Reset Total
              </Button>
            </div>
            
            {/* Mostrar solicitudes enviadas */}
            {solicitudesEnviadas.length > 0 && (
              <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-300">
                <p className="text-sm font-semibold text-blue-800 mb-2">
                  📋 Solicitudes enviadas ({solicitudesEnviadas.length}):
                </p>
                <div className="space-y-1">
                  {solicitudesEnviadas.map((solicitud, index) => (
                    <div key={index} className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                      <strong>#{index + 1}:</strong> {solicitud}
                    </div>
                  ))}
                </div>
                {errorEstadisticas && forceError && (
                  <div className="text-green-600 text-sm font-semibold mt-2">
                    ✅ Error activo - Usa "Try to Fix" para procesar todas las solicitudes
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 bg-blue-100 p-2 rounded border border-blue-300">
            <strong>✅ MODO MÚLTIPLE:</strong> Las solicitudes se acumulan sin resetear<br/>
            <strong>Mensaje actual:</strong> {mensajeErrorPersonalizado || 'Vacío'}<br/>
            <strong>Imágenes:</strong> {imagenesAdjuntas.length}<br/>
            <strong>Total solicitudes:</strong> {solicitudesEnviadas.length}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">🎯 Estado del Sistema Múltiple</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>Página actual:</strong> /gestion</div>
          <div><strong>Componente:</strong> GeneraErrores (Modo Múltiple)</div>
          <div><strong>Solicitudes enviadas:</strong> {solicitudesEnviadas.length}</div>
          <div><strong>Imágenes listas:</strong> {imagenesAdjuntas.length} imagen(es)</div>
          <div><strong>Mensaje actual:</strong> {mensajeErrorPersonalizado ? 'Configurado' : 'Vacío'}</div>
          <div><strong>Estado:</strong> {errorEstadisticas && forceError ? 'Error Activo (Persistente)' : 'Listo'}</div>
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mt-2">
            ✅ <strong>SISTEMA MÚLTIPLE:</strong> Permite enviar varias solicitudes sin resetear automáticamente.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneraErrores;
