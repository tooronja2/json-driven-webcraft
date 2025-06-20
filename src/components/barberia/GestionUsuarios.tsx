
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Plus, Trash2 } from 'lucide-react';

interface Usuario {
  id: string;
  usuario: string;
  password: string;
  nombre: string;
  rol: string;
  permisos: string[];
  barberoAsignado?: string;
}

interface GestionUsuariosProps {
  onClose: () => void;
}

const BARBEROS = ['Héctor Medina', 'Lucas Peralta', 'Camila González'];

const GestionUsuarios: React.FC<GestionUsuariosProps> = ({ onClose }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
    nombre: '',
    rol: 'Empleado',
    barberoAsignado: 'todos'
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = () => {
    const usuariosGuardados = localStorage.getItem('barberia_usuarios');
    if (usuariosGuardados) {
      setUsuarios(JSON.parse(usuariosGuardados));
    }
  };

  const guardarUsuarios = (nuevosUsuarios: Usuario[]) => {
    localStorage.setItem('barberia_usuarios', JSON.stringify(nuevosUsuarios));
    setUsuarios(nuevosUsuarios);
  };

  const crearUsuario = () => {
    if (!formData.usuario || !formData.password || !formData.nombre) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const nuevoUsuario: Usuario = {
      id: Date.now().toString(),
      usuario: formData.usuario,
      password: formData.password,
      nombre: formData.nombre,
      rol: formData.rol,
      permisos: ['ver_turnos', 'agregar_turnos'],
      barberoAsignado: formData.barberoAsignado === 'todos' ? undefined : formData.barberoAsignado
    };

    const usuariosActualizados = [...usuarios, nuevoUsuario];
    guardarUsuarios(usuariosActualizados);

    setFormData({
      usuario: '',
      password: '',
      nombre: '',
      rol: 'Empleado',
      barberoAsignado: 'todos'
    });
    setMostrarFormulario(false);
  };

  const eliminarUsuario = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      const usuariosActualizados = usuarios.filter(u => u.id !== id);
      guardarUsuarios(usuariosActualizados);
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
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </div>

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
                          onClick={() => eliminarUsuario(usuario.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {usuarios.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        No hay usuarios creados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Contraseña *</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Nombre Completo *</label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Juan Pérez"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Rol</label>
                  <Select value={formData.rol} onValueChange={(value) => setFormData({...formData, rol: value})}>
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
                  <Select value={formData.barberoAsignado} onValueChange={(value) => setFormData({...formData, barberoAsignado: value})}>
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
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={crearUsuario}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Crear Usuario
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
