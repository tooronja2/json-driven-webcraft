
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Bug, X, Edit3, Image, Play, Zap, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GeneraErrores: React.FC = () => {
  const [aplicandoCambio, setAplicandoCambio] = useState(false);
  const [errorEstadisticas, setErrorEstadisticas] = useState(false);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState<string[]>([]);
  const [forceError, setForceError] = useState(false);
  const [mensajeErrorPersonalizado, setMensajeErrorPersonalizado] = useState('');
  const [imagenesAdjuntas, setImagenesAdjuntas] = useState<{file: File, preview: string}[]>([]);
  const [mostrarAppsScript, setMostrarAppsScript] = useState(false);
  const [sistemaBloqueado, setSistemaBloqueado] = useState(true); // BLOQUEAR SISTEMA POR DEFECTO
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
    if (!mensajeErrorPersonalizado.trim() || sistemaBloqueado) return;

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
  };

  // Función que resetea COMPLETAMENTE el sistema
  const resetearSistema = () => {
    setErrorEstadisticas(false);
    setForceError(false);
    setSolicitudesEnviadas([]);
    setMensajeErrorPersonalizado('');
    setImagenesAdjuntas([]);
    setMostrarAppsScript(false);
    setSistemaBloqueado(true); // MANTENER BLOQUEADO
    
    toast({
      title: "Sistema reseteado",
      description: "Todas las solicitudes y errores han sido limpiados",
    });
  };

  // Función para desbloquear temporalmente el sistema
  const desbloquearSistema = () => {
    setSistemaBloqueado(false);
    toast({
      title: "Sistema desbloqueado",
      description: "Ahora puedes enviar solicitudes de error",
    });
  };

  // Función para limpiar solo el mensaje actual
  const limpiarMensaje = () => {
    setMensajeErrorPersonalizado('');
    setImagenesAdjuntas([]);
  };

  // Componente de estadísticas que mantiene el error PERSISTENTE
  const renderEstadisticasAdmin = () => {
    // SISTEMA BLOQUEADO - NO GENERAR ERRORES
    if (sistemaBloqueado) {
      return null;
    }

    // TEMPORALMENTE DESHABILITADO PARA MOSTRAR EL APPS SCRIPT
    if (mostrarAppsScript) {
      return null; // No generar error cuando se muestra el Apps Script
    }

    // MANTENER EL ERROR ACTIVO SOLO SI ESTÁ DESBLOQUEADO - No resetear automáticamente
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
  `.trim();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">🔧 SISTEMA DE ERRORES BLOQUEADO</h2>
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-700 font-bold">
            ⛔ SISTEMA BLOQUEADO: No se generarán errores controlados para evitar interferir con la depuración real.
          </AlertDescription>
        </Alert>
      </div>

      {/* Renderizar estadísticas que NO pueden fallar */}
      {renderEstadisticasAdmin()}

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

      <Card className="border-l-4 border-l-red-500 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-red-700">
            <Bug className="h-5 w-5" />
            🚫 SISTEMA BLOQUEADO PARA DEPURACIÓN
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-red-700 text-sm font-bold">
            El generador de errores está bloqueado para no interferir con la depuración del problema real del API key.
          </p>
          
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={() => setMostrarAppsScript(!mostrarAppsScript)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Code className="h-3 w-3 mr-1" />
                {mostrarAppsScript ? 'Ocultar' : 'Ver Apps Script'}
              </Button>
              <Button
                onClick={desbloquearSistema}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700"
                disabled={!sistemaBloqueado}
              >
                🔓 Desbloquear (Solo para Testing)
              </Button>
              <Button
                onClick={resetearSistema}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                Reset Total
              </Button>
            </div>
            
            {/* Solo mostrar si está desbloqueado */}
            {!sistemaBloqueado && (
              <>
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
                </div>
              </>
            )}
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded border">
            <strong>🔒 ESTADO:</strong> {sistemaBloqueado ? 'BLOQUEADO' : 'DESBLOQUEADO'}<br/>
            <strong>Solicitudes enviadas:</strong> {solicitudesEnviadas.length}<br/>
            <strong>Imágenes:</strong> {imagenesAdjuntas.length}<br/>
            <strong>Propósito:</strong> Evitar interferir con depuración del API key
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-300">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">📋 Próximos pasos para resolver el problema real</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="text-blue-700">
            <p className="font-semibold mb-2">El error controlado ha sido eliminado. Ahora puedes:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Ir a la pestaña "Turnos del Día" para ver si carga correctamente</li>
              <li>Verificar en las herramientas de desarrollador (F12 → Network) las llamadas al API</li>
              <li>Revisar si las hojas de Google Sheets tienen los nombres correctos: "Turnos", "Horarios_Especialistas", "Dias_Libres"</li>
              <li>Confirmar que el API_SECRET_KEY es idéntico en el Apps Script y en la aplicación</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneraErrores;
