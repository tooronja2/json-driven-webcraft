import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Usuario {
  id: string;
  usuario: string;
  nombre: string;
  rol: string;
  permisos: string[];
  barberoAsignado?: string;
}

interface GestionUsuariosProps {
  onClose: () => void;
}

const BARBEROS = ['Héctor Medina', 'Lucas Peralta', 'Camila González'];
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz1YdmiFjMpQ0kVfClFRkXskNMNZXOl5iZ-04BRXOk_McN5sNeEZemg8xE8NP0CaN5Y/exec';
const API_SECRET_KEY = 'barberia_estilo_2025_secure_api_xyz789';

const GestionUsuarios: React.FC<GestionUsuariosProps> = ({ onClose }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
    nombre: '',
    rol: 'Empleado',
    barberoAsignado: 'todos'
  });
  const { toast } = useToast();

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const limpiarDatosUsuario = (user: any) => {
    // Función para limpiar espacios extra en las propiedades
    const limpiarPropiedad = (valor: any) => {
      if (typeof valor === 'string') {
        return valor.trim();
      }
      return valor;
    };

    // Procesar permisos - puede venir como string JSON o array
    let permisos = [];
    try {
      const permisosRaw = user.permisos || user['permisos '] || '[]';
      permisos = typeof permisosRaw === 'string' ? JSON.parse(permisosRaw) : permisosRaw;
      if (!Array.isArray(permisos)) {
        permisos = ['ver_turnos'];
      }
    } catch (error) {
      console.error('Error al parsear permisos:', error);
      permisos = ['ver_turnos'];
    }

    return {
      id: String(user.id || ''),
      usuario: limpiarPropiedad(user.usuario || user['usuario '] || ''),
      nombre: limpiarPropiedad(user.nombre || user['nombre '] || ''),
      rol: limpiarPropiedad(user.rol || user['rol '] || 'Empleado'),
      permisos: permisos,
      barberoAsignado: limpiarPropiedad(user.barberoAsignado || user['barberoAsignado '] || '')
    };
  };

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      
      // SEGURIDAD MEJORADA: Usar POST para operaciones sensibles
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          action: 'getUsuarios',
          apiKey: API_SECRET_KEY,
          timestamp: Date.now().toString()
        })
      });
      
      const data = await response.json();
      console.log('📄 Respuesta getUsuarios:', data);

      if (data.success && data.usuarios) {
        // Procesar y limpiar datos de usuarios
        const usuariosProcesados = data.usuarios.map(limpiarDatosUsuario);
        console.log('✅ Usuarios procesados:', usuariosProcesados);
        setUsuarios(usuariosProcesados);
      } else {
        console.error('Error al cargar usuarios:', data.error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        variant: "destructive"
      });
    } finally {
      setCargando(false);
    }
  };

  const crearUsuario = async () => {
    if (!formData.usuario || !formData.password || !formData.nombre) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      setGuardando(true);
      
      const nuevoUsuario = {
        usuario: formData.usuario,
        password: formData.password,
        nombre: formData.nombre,
        rol: formData.rol,
        permisos: ['ver_turnos', 'agregar_turnos'],
        barberoAsignado: formData.barberoAsignado === 'todos' ? '' : formData.barberoAsignado
      };

      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          action: 'crearUsuario',
          apiKey: API_SECRET_KEY,
          data: JSON.stringify(nuevoUsuario),
          timestamp: Date.now().toString()
        })
      });

      const data = await response.json();
      console.log('📄 Respuesta crearUsuario:', data);

      if (data.success) {
        toast({
          title: "Usuario creado",
          description: `Usuario ${formData.nombre} creado exitosamente`,
        });
        
        // Recargar lista de usuarios
        await cargarUsuarios();
        
        // Resetear formulario
        setFormData({
          usuario: '',
          password: '',
          nombre: '',
          rol: 'Empleado',
          barberoAsignado: 'todos'
        });
        setMostrarFormulario(false);
      } else {
        toast({
          title: "Error al crear usuario",
          description: data.error || "Error desconocido",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudo crear el usuario",
        variant: "destructive"
      });
    } finally {
      setGuardando(false);
    }
  };

  const eliminarUsuario = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el usuario "${nombre}"?`)) {
      return;
    }

    try {
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          action: 'eliminarUsuario',
          apiKey: API_SECRET_KEY,
          usuarioId: id,
          timestamp: Date.now().toString()
        })
      });

      const data = await response.json();
      console.log('📄 Respuesta eliminarUsuario:', data);

      if (data.success) {
        toast({
          title: "Usuario eliminado",
          description: `Usuario ${nombre} eliminado exitosamente`,
        });
        
        // Recargar lista
        await cargarUsuarios();
      } else {
        toast({
          title: "Error al eliminar",
          description: data.error || "Error desconocido",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudo eliminar el usuario",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestión de Usuarios</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!mostrarFormulario ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Usuarios del Sistema</h3>
                <Button 
                  onClick={() => setMostrarFormulario(true)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={cargando}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </div>

              {cargando ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Cargando usuarios...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Barbero Asignado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell className="font-mono">{usuario.usuario}</TableCell>
                        <TableCell>{usuario.nombre}</TableCell>
                        <TableCell>{usuario.rol}</TableCell>
                        <TableCell>{usuario.barberoAsignado || 'Todos'}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => eliminarUsuario(usuario.id, usuario.nombre)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {usuarios.length === 0 && !cargando && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500">
                          No hay usuarios creados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Crear Nuevo Usuario</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Usuario *</label>
                  <Input
                    value={formData.usuario}
                    onChange={(e) => setFormData({...formData, usuario: e.target.value})}
                    placeholder="usuario.login"
                    disabled={guardando}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Contraseña *</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    disabled={guardando}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Nombre Completo *</label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Juan Pérez"
                    disabled={guardando}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Rol</label>
                  <Select 
                    value={formData.rol} 
                    onValueChange={(value) => setFormData({...formData, rol: value})}
                    disabled={guardando}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Empleado">Empleado</SelectItem>
                      <SelectItem value="Barbero">Barbero</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <label className="text-sm font-medium">Barbero Asignado (opcional)</label>
                  <Select 
                    value={formData.barberoAsignado} 
                    onValueChange={(value) => setFormData({...formData, barberoAsignado: value})}
                    disabled={guardando}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar barbero específico o dejar vacío para todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los barberos</SelectItem>
                      {BARBEROS.map((barbero) => (
                        <SelectItem key={barbero} value={barbero}>{barbero}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600 mt-1">
                    Si seleccionas un barbero, este usuario solo verá los turnos de ese barbero
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setMostrarFormulario(false)}
                  className="flex-1"
                  disabled={guardando}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={crearUsuario}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={guardando}
                >
                  {guardando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creando...
                    </>
                  ) : (
                    'Crear Usuario'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GestionUsuarios;
