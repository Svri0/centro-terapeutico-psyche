import Rol from './Rol';
import Usuario from './Usuario';
import Paciente from './Paciente';
import Sesion from './Sesion';
import Tarea from './Tarea';
import Mensaje from './Mensaje';
import LogAuditoria from './LogAuditoria';

// Configurar asociaciones

// Rol - Usuario (1:N)
Rol.hasMany(Usuario, {
  foreignKey: 'rol_id',
  as: 'usuarios',
});

Usuario.belongsTo(Rol, {
  foreignKey: 'rol_id',
  as: 'rol',
});

// Usuario - Paciente (1:N) - Psicólogo
Usuario.hasMany(Paciente, {
  foreignKey: 'psicologo_id',
  as: 'pacientes_asignados',
});

Paciente.belongsTo(Usuario, {
  foreignKey: 'psicologo_id',
  as: 'psicologo',
});

// Usuario - Paciente (1:1) - Usuario del paciente
Usuario.hasOne(Paciente, {
  foreignKey: 'usuario_id',
  as: 'paciente',
});

Paciente.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario',
});

// Paciente - Sesion (1:N)
Paciente.hasMany(Sesion, {
  foreignKey: 'paciente_id',
  as: 'sesiones',
});

Sesion.belongsTo(Paciente, {
  foreignKey: 'paciente_id',
  as: 'paciente',
});

// Usuario - Sesion (1:N) - Psicólogo
Usuario.hasMany(Sesion, {
  foreignKey: 'psicologo_id',
  as: 'sesiones_psicologo',
});

Sesion.belongsTo(Usuario, {
  foreignKey: 'psicologo_id',
  as: 'psicologo',
});

// Paciente - Tarea (1:N)
Paciente.hasMany(Tarea, {
  foreignKey: 'paciente_id',
  as: 'tareas',
});

Tarea.belongsTo(Paciente, {
  foreignKey: 'paciente_id',
  as: 'paciente',
});

// Usuario - Tarea (1:N) - Psicólogo
Usuario.hasMany(Tarea, {
  foreignKey: 'psicologo_id',
  as: 'tareas_asignadas',
});

Tarea.belongsTo(Usuario, {
  foreignKey: 'psicologo_id',
  as: 'psicologo',
});

// Sesion - Tarea (1:N)
Sesion.hasMany(Tarea, {
  foreignKey: 'sesion_id',
  as: 'tareas',
});

Tarea.belongsTo(Sesion, {
  foreignKey: 'sesion_id',
  as: 'sesion',
});

// Usuario - Mensaje (1:N) - Remitente
Usuario.hasMany(Mensaje, {
  foreignKey: 'remitente_id',
  as: 'mensajes_enviados',
});

Mensaje.belongsTo(Usuario, {
  foreignKey: 'remitente_id',
  as: 'remitente',
});

// Usuario - Mensaje (1:N) - Destinatario
Usuario.hasMany(Mensaje, {
  foreignKey: 'destinatario_id',
  as: 'mensajes_recibidos',
});

Mensaje.belongsTo(Usuario, {
  foreignKey: 'destinatario_id',
  as: 'destinatario',
});

// Paciente - Mensaje (1:N)
Paciente.hasMany(Mensaje, {
  foreignKey: 'paciente_id',
  as: 'mensajes',
});

Mensaje.belongsTo(Paciente, {
  foreignKey: 'paciente_id',
  as: 'paciente',
});

// Usuario - LogAuditoria (1:N)
Usuario.hasMany(LogAuditoria, {
  foreignKey: 'usuario_id',
  as: 'logs_auditoria',
});

LogAuditoria.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario',
});

export {
  Rol,
  Usuario,
  Paciente,
  Sesion,
  Tarea,
  Mensaje,
  LogAuditoria,
}; 