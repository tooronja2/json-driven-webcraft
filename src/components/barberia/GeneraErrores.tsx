
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Bug, X, Edit3, Image, Play, Zap, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GeneraErrores: React.FC = () => {
  const [aplicandoCambio, setAplicandoCambio] = useState(false);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState<string[]>([]);
  const [mensajeErrorPersonalizado, setMensajeErrorPersonalizado] = useState('');
  const [imagenesAdjuntas, setImagenesAdjuntas] = useState<{file: File, preview: string}[]>([]);
  const [mostrarAppsScript, setMostrarAppsScript] = useState(false);
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

  // Función que aplica cambio - MODO SEGURO SIN ERRORES
  const aplicarCambioConError = () => {
    if (!mensajeErrorPersonalizado.trim()) return;

    setAplicandoCambio(true);
    
    // Agregar a la lista de solicitudes enviadas
    setSolicitudesEnviadas(prev => [...prev, mensajeErrorPersonalizado]);
    
    setAplicandoCambio(false);
    
    // Mostrar feedback
    toast({
      title: "Solicitud procesada",
      description: `Solicitud #${solicitudesEnviadas.length + 1} procesada de manera segura.`,
      variant: "default",
    });
  };

  // Función que resetea COMPLETAMENTE el sistema
  const resetearSistema = () => {
    setSolicitudesEnviadas([]);
    setMensajeErrorPersonalizado('');
    setImagenesAdjuntas([]);
    setMostrarAppsScript(false);
    
    toast({
      title: "Sistema reseteado",
      description: "Todas las solicitudes han sido limpiadas",
    });
  };

  // Función para limpiar solo el mensaje actual
  const limpiarMensaje = () => {
    setMensajeErrorPersonalizado('');
    setImagenesAdjuntas([]);
  };

  const eliminarImagen = (index: number) => {
    setImagenesAdjuntas(prev => prev.filter((_, i) => i !== index));
  };

  const appsScriptCompleto = `
/**************************************
 *  Barbería Estilo · API & Emails
 **************************************/
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

/* ────────────────────────────────────
 * 🔒 Verificar API-KEY
 * ──────────────────────────────────── */
function verificarApiKey(apiKey) {
  return apiKey && apiKey === API_SECRET_KEY;
}

/* ────────────────────────────────────
 * 🚚 Endpoints HTTP con CORS COMPLETO
 * ──────────────────────────────────── */
function doGet(e) {
  let response = { error: 'Acción no válida' };

  if (e && e.parameter && e.parameter.action) {
    const { action, apiKey } = e.parameter;
    if (!verificarApiKey(apiKey)) return outputJSONWithCORS({ success:false, error:'API Key inválida' });

    if      (action === 'getEventos')    response = getEventos();
    else if (action === 'getTurno')      response = getTurno(e.parameter.id);
    else if (action === 'getHorarios')   response = getHorarios();
    else if (action === 'getDiasLibres') response = getDiasLibres();
    else if (action === 'updateEstado')  response = updateEstadoTurno(e.parameter.id, e.parameter.estado, e.parameter.origen_panel);
  }
  return outputJSONWithCORS(response);
}

function doPost(e) {
  let response = { error: 'Acción no válida' };
  let params = {};

  // MANEJAR TANTO PARÁMETROS URL COMO BODY JSON
  try {
    // Intentar parsear el body como JSON primero
    if (e.postData && e.postData.contents) {
      const bodyData = JSON.parse(e.postData.contents);
      params = bodyData;
    } else if (e.parameter) {
      // Fallback a parámetros URL
      params = e.parameter;
    }
  } catch (error) {
    // Si falla el JSON, usar parámetros URL
    params = e.parameter || {};
  }

  if (params.action) {
    const { action, apiKey } = params;
    if (!verificarApiKey(apiKey)) return outputJSONWithCORS({ success:false, error:'API Key inválida' });

    if      (action === 'crearReserva')  response = crearReserva(params.data ? JSON.parse(params.data) : params);
    else if (action === 'cancelarTurno') response = cancelarTurno(params.eventId || params.id);
    else if (action === 'updateEstado')  response = updateEstadoTurno(params.id, params.estado, params.origen_panel);
  }
  return outputJSONWithCORS(response);
}

// CORS COMPLETO para todas las solicitudes OPTIONS
function doOptions() {
  const output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.TEXT);
  
  // Headers CORS completos
  output.setHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    'Access-Control-Max-Age': '86400'
  });
  
  return output;
}

// FUNCIÓN PARA INCLUIR CORS EN TODAS LAS RESPUESTAS JSON
function outputJSONWithCORS(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Headers CORS en todas las respuestas
  output.setHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
  });
  
  return output;
}

// FUNCIÓN LEGACY (mantener por compatibilidad)
function outputJSON(data) {
  return outputJSONWithCORS(data);
}

/* ────────────────────────────────────
 * 📊 Operaciones Sheets
 * ──────────────────────────────────── */
const SHEET_ID = '1d5HogKo6RU2o07ewfb2_MWs3atv28YaAcrxMf3DemEU';
function sheetData(name) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(name) ||
                SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  const data   = sheet.getDataRange().getValues();
  const header = data.shift();
  return data.map(r => header.reduce((o,h,i)=>(o[h]=r[i],o),{}));
}

function getEventos()     { return { success:true, eventos: sheetData('Turnos') }; }
function getHorarios()    { return { success:true, horarios: sheetData('Horarios_Especialistas') }; }
function getDiasLibres()  { return { success:true, diasLibres: sheetData('Dias_Libres') }; }

function getTurno(id) {
  const t = sheetData('Turnos').find(x => x.ID_Evento === id);
  return t ? { success:true, turno:t } : { success:false, error:'Turno no encontrado' };
}

/* ────────────────────────────────────
 * ➕ / ✖️  Crear - Cancelar - Actualizar
 * ──────────────────────────────────── */
function crearReserva(d) {
  const sheet  = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  // Las reservas se crean con estado "Reservado" en lugar de "Confirmado"
  sheet.appendRow([
    d.ID_Evento, d.Titulo_Evento, d.Nombre_Cliente, d.Email_Cliente,
    d.Fecha, d.Hora_Inicio, d.Hora_Fin, d.Descripcion,
    'Reservado', d['Valor del turno'], d['Servicios incluidos'], d.Responsable
  ]);
  enviarEmailConfirmacion(d);
  return { success:true };
}

function cancelarTurno(id) {
  const s   = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  const arr = s.getDataRange().getValues();
  for (let i=1;i<arr.length;i++){
    if (arr[i][0] === id){
      s.getRange(i+1,9).setValue('Cancelado');
      return { success:true };
    }
  }
  return { success:false, error:'Turno no encontrado' };
}

// Actualizar estado de turno desde el panel
function updateEstadoTurno(id, nuevoEstado, origenPanel) {
  const s   = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  const arr = s.getDataRange().getValues();
  
  for (let i=1;i<arr.length;i++){
    if (arr[i][0] === id){
      s.getRange(i+1,9).setValue(nuevoEstado);
      
      // Si se está confirmando desde el panel y el cliente tiene email, enviar notificación
      if (nuevoEstado === 'Confirmado' && origenPanel && arr[i][3]) {
        enviarEmailConfirmacionPanel({
          ID_Evento: arr[i][0],
          Titulo_Evento: arr[i][1],
          Nombre_Cliente: arr[i][2],
          Email_Cliente: arr[i][3],
          Fecha: arr[i][4],
          Hora_Inicio: arr[i][5],
          Hora_Fin: arr[i][6],
          Responsable: arr[i][11],
          'Valor del turno': arr[i][9]
        });
      }
      
      return { success:true };
    }
  }
  return { success:false, error:'Turno no encontrado' };
}

/* ────────────────────────────────────
 * ✉️  Email · Plantillas
 * ──────────────────────────────────── */
function enviarEmailConfirmacion(d) {
  const cancelUrl = \`https://json-driven-webcraft.vercel.app/cancelar-turno?id=\${d.ID_Evento}\`;
  const subject   = \`Reserva recibida - \${d.Titulo_Evento}\`;
  const ownerMail = 'tradeljakntnlatam@gmail.com';

  /* === Cliente === */
  const htmlCliente = \`
<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f2f0ed;font-family:'Roboto',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f0ed;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.08);">
        <tr><td style="background:#693f29;text-align:center;padding:32px;">
          <h1 style="margin:0;font-size:30px;color:#fff;font-weight:700;">Barbería Estilo</h1>
        </td></tr>
        <tr><td style="padding:40px 48px 32px;color:#1f2937;">
          <h2 style="margin:0 0 12px;font-size:26px;">Hola \${d.Nombre_Cliente}!</h2>
          <p style="margin:0 0 24px;font-size:16px;color:#4b5563;">Hemos recibido tu reserva. Te confirmaremos pronto los detalles:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;border-radius:12px;padding:24px;font-size:15px;">
            <tr><td><strong>Servicio:</strong></td><td>\${d.Titulo_Evento}</td></tr>
            <tr><td><strong>Fecha:</strong></td><td>\${new Date(d.Fecha).toLocaleDateString('es-AR')}</td></tr>
            <tr><td><strong>Hora inicio:</strong></td><td>\${d.Hora_Inicio}</td></tr>
            <tr><td><strong>Hora fin:</strong></td><td>\${d.Hora_Fin}</td></tr>
            <tr><td><strong>Especialista:</strong></td><td>\${d.Responsable}</td></tr>
            <tr><td><strong>Precio:</strong></td><td>$\${d['Valor del turno']}</td></tr>
          </table>
          <p style="margin:32px 0 8px;font-size:15px;color:#374151;">Estado: <strong>RESERVADO</strong> - Esperando confirmación</p>
          <p style="margin:8px 0;font-size:15px;color:#374151;">Si necesitás cancelar tu reserva, hacelo desde aquí:</p>
          <table align="center"><tr><td bgcolor="#693f29" style="border-radius:8px;">
            <a href="\${cancelUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;border-radius:8px;">Cancelar reserva</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="text-align:center;padding:24px 32px;font-size:13px;color:#6b7280;">¡Gracias por elegirnos! Barbería Estilo</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>\`;

  /* === Dueño === */
  const htmlOwner = \`
<!DOCTYPE html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#111;">
  <h2 style="text-align:center;margin:0 0 24px;">Nueva reserva recibida</h2>
  <p><strong>Cliente:</strong> \${d.Nombre_Cliente} (\${d.Email_Cliente})</p>
  <ul style="padding-left:18px;">
    <li><strong>Servicio:</strong> \${d.Titulo_Evento}</li>
    <li><strong>Fecha:</strong> \${new Date(d.Fecha).toLocaleDateString('es-AR')}</li>
    <li><strong>Hora:</strong> \${d.Hora_Inicio}</li>
    <li><strong>Especialista:</strong> \${d.Responsable}</li>
    <li><strong>Precio:</strong> $\${d['Valor del turno']}</li>
    <li><strong>Estado:</strong> RESERVADO (pendiente de confirmación)</li>
  </ul>
</body></html>\`;

  GmailApp.sendEmail(d.Email_Cliente, subject, '', { htmlBody: htmlCliente });
  GmailApp.sendEmail(ownerMail, \`Nueva reserva - \${d.Titulo_Evento}\`, '', { htmlBody: htmlOwner });
}

// Email cuando se confirma desde el panel
function enviarEmailConfirmacionPanel(d) {
  const subject = \`Turno confirmado - \${d.Titulo_Evento}\`;
  
  const htmlCliente = \`
<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f2f0ed;font-family:'Roboto',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f0ed;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.08);">
        <tr><td style="background:#693f29;text-align:center;padding:32px;">
          <h1 style="margin:0;font-size:30px;color:#fff;font-weight:700;">Barbería Estilo</h1>
        </td></tr>
        <tr><td style="padding:40px 48px 32px;color:#1f2937;">
          <h2 style="margin:0 0 12px;font-size:26px;">¡Turno confirmado!</h2>
          <p style="margin:0 0 24px;font-size:16px;color:#4b5563;">Hola \${d.Nombre_Cliente}, tu turno ha sido confirmado por nuestro equipo:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;border-radius:12px;padding:24px;font-size:15px;">
            <tr><td><strong>Servicio:</strong></td><td>\${d.Titulo_Evento}</td></tr>
            <tr><td><strong>Fecha:</strong></td><td>\${new Date(d.Fecha).toLocaleDateString('es-AR')}</td></tr>
            <tr><td><strong>Hora:</strong></td><td>\${d.Hora_Inicio}</td></tr>
            <tr><td><strong>Especialista:</strong></td><td>\${d.Responsable}</td></tr>
            <tr><td><strong>Precio:</strong></td><td>$\${d['Valor del turno']}</td></tr>
          </table>
          <p style="margin:32px 0 8px;font-size:15px;color:#374151;">Estado: <strong>CONFIRMADO</strong> ✅</p>
        </td></tr>
        <tr><td style="text-align:center;padding:24px 32px;font-size:13px;color:#6b7280;">¡Te esperamos! Barbería Estilo</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>\`;

  GmailApp.sendEmail(d.Email_Cliente, subject, '', { htmlBody: htmlCliente });
}

/* ────────────────────────────────────
 * ⏰  Recordatorio (1 día antes) - SOLO RESERVADOS
 * ──────────────────────────────────── */
function enviarRecordatorios() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  const data  = sheet.getDataRange().getValues();
  const today = new Date(); today.setHours(0,0,0,0);

  for (let i=1;i<data.length;i++){
    const [id,titulo,nombre,email,fecha,hInicio,, ,estado,, ,responsable] = data[i];
    // Solo enviar recordatorios a turnos RESERVADOS (para que vengan)
    if (estado!=='Reservado') continue;
    const fechaTurno = new Date(fecha); fechaTurno.setHours(0,0,0,0);
    if ((fechaTurno - today)/(1000*60*60*24) !== 1) continue;

    const html = \`
<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f2f0ed;font-family:'Roboto',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f0ed;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,.08);">
        <tr><td style="background:#693f29;text-align:center;padding:32px;">
          <h1 style="margin:0;font-size:28px;color:#fff;font-weight:700;">Recordatorio de turno</h1>
        </td></tr>
        <tr><td style="padding:40px 48px 32px;color:#1f2937;">
          <h2 style="margin:0 0 12px;font-size:24px;">Hola \${nombre}!</h2>
          <p style="margin:0 0 24px;font-size:16px;color:#4b5563;">Te recordamos que mañana tenés turno reservado en <strong>Barbería Estilo</strong>:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;border-radius:12px;padding:24px;font-size:15px;">
            <tr><td><strong>Servicio:</strong></td><td>\${titulo}</td></tr>
            <tr><td><strong>Hora:</strong></td><td>\${hInicio}</td></tr>
            <tr><td><strong>Con:</strong></td><td>\${responsable}</td></tr>
          </table>
          <p style="margin-top:32px;font-size:13px;color:#6b7280;">¡Te esperamos!</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>\`;

    GmailApp.sendEmail(
      email,
      'Recordatorio: tu turno es mañana',
      '',
      { htmlBody: html }
    );
  }
}`.trim();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">🔧 Apps Script - CORS Actualizado</h2>
        <p className="text-green-600 mb-6 font-bold">
          ✅ MODO SEGURO: Sistema funcionando sin errores
        </p>
      </div>

      {/* Mostrar Apps Script completo */}
      {mostrarAppsScript && (
        <Card className="border-2 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Code className="h-5 w-5" />
              Apps Script Completo con CORS Solucionado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono">
              <pre>{appsScriptCompleto}</pre>
            </div>
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold text-green-800">Cambios principales implementados:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✅ <strong>doOptions()</strong> con headers CORS completos</li>
                <li>✅ <strong>doPost()</strong> maneja tanto parámetros URL como body JSON</li>
                <li>✅ <strong>outputJSONWithCORS()</strong> incluye headers CORS en todas las respuestas</li>
                <li>✅ <strong>doGet()</strong> también actualizado para usar CORS</li>
                <li>✅ Soporte para updateEstado via GET y POST</li>
              </ul>
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(appsScriptCompleto);
                  toast({
                    title: "Copiado al portapapeles",
                    description: "El código Apps Script ha sido copiado",
                  });
                }}
                className="mt-2 bg-green-600 hover:bg-green-700"
              >
                📋 Copiar código completo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bug className="h-5 w-5 text-blue-600" />
            🔧 SOLICITUDES SEGURAS
            <span className="text-sm bg-green-600 text-white px-2 py-1 rounded">FUNCIONANDO</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm font-bold">
            Sistema funcionando de manera segura sin errores que rompan la aplicación.
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
                {aplicandoCambio ? 'Procesando...' : 'Procesar Solicitud'}
              </Button>
              <Button
                onClick={() => setMostrarAppsScript(!mostrarAppsScript)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Code className="h-3 w-3 mr-1" />
                {mostrarAppsScript ? 'Ocultar' : 'Ver Apps Script'}
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
                Reset
              </Button>
            </div>
            
            {/* Mostrar solicitudes enviadas */}
            {solicitudesEnviadas.length > 0 && (
              <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-300">
                <p className="text-sm font-semibold text-blue-800 mb-2">
                  📋 Solicitudes procesadas ({solicitudesEnviadas.length}):
                </p>
                <div className="space-y-1">
                  {solicitudesEnviadas.map((solicitud, index) => (
                    <div key={index} className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                      <strong>#{index + 1}:</strong> {solicitud}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 bg-blue-100 p-2 rounded border border-blue-300">
            <strong>✅ MODO SEGURO:</strong> Las solicitudes se procesan sin romper la aplicación<br/>
            <strong>Mensaje actual:</strong> {mensajeErrorPersonalizado || 'Vacío'}<br/>
            <strong>Imágenes:</strong> {imagenesAdjuntas.length}<br/>
            <strong>Total solicitudes:</strong> {solicitudesEnviadas.length}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">🎯 Estado del Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>Página actual:</strong> /gestion</div>
          <div><strong>Componente:</strong> GeneraErrores (Modo Seguro)</div>
          <div><strong>Solicitudes procesadas:</strong> {solicitudesEnviadas.length}</div>
          <div><strong>Imágenes listas:</strong> {imagenesAdjuntas.length} imagen(es)</div>
          <div><strong>Mensaje actual:</strong> {mensajeErrorPersonalizado ? 'Configurado' : 'Vacío'}</div>
          <div><strong>Estado:</strong> Funcionando correctamente</div>
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded mt-2">
            ✅ <strong>SISTEMA SEGURO:</strong> No lanza errores que rompan la aplicación.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneraErrores;
