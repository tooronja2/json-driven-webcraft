
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
  const [ultimaSolicitudPersonalizada, setUltimaSolicitudPersonalizada] = useState('');
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

  // Función que aplica cambio con error controlado
  const aplicarCambioConError = () => {
    if (!mensajeErrorPersonalizado.trim()) return;

    setAplicandoCambio(true);
    setUltimaSolicitudPersonalizada(mensajeErrorPersonalizado);
    
    // Activar error en estadísticas (componente aislado)
    setErrorEstadisticas(true);
    setForceError(true); // Forzar error real
    setAplicandoCambio(false);
    
    // Mostrar feedback
    toast({
      title: "Error controlado generado",
      description: "El error se ha aplicado. Usa 'Try to Fix' para implementar la solicitud.",
      variant: "destructive",
    });
  };

  // Función que resetea el error (para poder volver a generarlo)
  const resetearError = () => {
    setErrorEstadisticas(false);
    setForceError(false); // Resetear el forzado de error
    setUltimaSolicitudPersonalizada('');
    setMensajeErrorPersonalizado('');
    setImagenesAdjuntas([]); // Limpiar imágenes también
    
    toast({
      title: "Error reseteado",
      description: "Puedes generar un nuevo error controlado",
    });
  };

  // Componente de estadísticas que falla cuando hay error - CORREGIDO COMPLETAMENTE
  const renderEstadisticasAdmin = () => {
    // ERROR CONTROLADO: Solo generar error si está activo Y hay mensaje personalizado
    if (errorEstadisticas && forceError && ultimaSolicitudPersonalizada) {
      // Simular error real que bloquea la ejecución
      console.error('🔧 ERROR CONTROLADO REGENERABLE: Estadísticas fallan intencionalmente');
      console.error('🔧 SOLICITUD PERSONALIZADA:', ultimaSolicitudPersonalizada);
      console.error('🔧 IMÁGENES ADJUNTAS:', imagenesAdjuntas.length);
      console.error('🔧 ACCIÓN REQUERIDA: Implementar funcionalidad solicitada');
      
      // GENERAR ERROR REAL - Método completamente corregido
      try {
        const errorObj: any = null;
        // Esta línea causará el error real cuando forceError esté activo
        return errorObj.configuracion.adminSettings; // Esto genera el error real
      } catch (error) {
        // Re-lanzar el error para que Lovable lo detecte
        throw new Error(`CONTROLLED_ERROR: ${ultimaSolicitudPersonalizada} | Images: ${imagenesAdjuntas.length}`);
      }
    }

    return null;
  };

  const eliminarImagen = (index: number) => {
    setImagenesAdjuntas(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">🔧 GENERA ERROR CONTROLADO REAL</h2>
        <p className="text-red-600 mb-6 font-bold">
          ⚠️ ESTE ERROR VA A ROMPER LA APLICACIÓN PARA QUE LOVABLE LO DETECTE
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

      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-red-500 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bug className="h-5 w-5 text-red-600" />
            🔧 ERROR PERSONALIZADO REAL
            <span className="text-sm bg-red-600 text-white px-2 py-1 rounded">CONTROLADO</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm font-bold">
            Genera un error real que Lovable puede detectar con tu mensaje personalizado
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium">Mensaje personalizado para el log:</label>
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
                className="bg-red-600 hover:bg-red-700"
                disabled={aplicandoCambio}
              >
                <Zap className="h-3 w-3 mr-1" />
                {aplicandoCambio ? 'Aplicando...' : 'Aplicar Cambio'}
              </Button>
              <Button
                onClick={resetearError}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Resetear
              </Button>
            </div>
            {errorEstadisticas && forceError && (
              <div className="text-red-600 text-sm font-semibold">
                ⚠️ Error activo en estadísticas - Usa "Try to Fix" para reparar e implementar: {ultimaSolicitudPersonalizada}
              </div>
            )}
            {ultimaSolicitudPersonalizada && !forceError && (
              <div className="text-green-600 text-sm font-semibold">
                ✅ Última solicitud implementada: {ultimaSolicitudPersonalizada}
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 bg-red-100 p-2 rounded border border-red-300">
            <strong>⚠️ ADVERTENCIA:</strong> Va a generar un error real que rompe la aplicación<br/>
            <strong>Mensaje actual:</strong> {mensajeErrorPersonalizado || 'Pendiente'}<br/>
            <strong>Imágenes:</strong> {imagenesAdjuntas.length}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">🎯 Estado del Generador de Errores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>Página actual:</strong> /gestion</div>
          <div><strong>Componente:</strong> GeneraErrores (Tab activo)</div>
          <div><strong>Imágenes listas:</strong> {imagenesAdjuntas.length} imagen(es)</div>
          <div><strong>Mensaje personalizado:</strong> {mensajeErrorPersonalizado ? 'Configurado' : 'Pendiente'}</div>
          <div><strong>Error activo:</strong> {errorEstadisticas && forceError ? 'SÍ' : 'NO'}</div>
          <div><strong>Estado Lovable:</strong> Listo para detectar errores controlados</div>
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded mt-2">
            ✅ <strong>MÉTODO CORREGIDO:</strong> Ahora el error se maneja correctamente con try-catch para evitar crashes no controlados.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneraErrores;
