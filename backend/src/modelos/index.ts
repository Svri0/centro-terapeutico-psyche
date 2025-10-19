import Rol from './Rol';
import Usuario from './Usuario';
import Paciente from './Paciente';
import Sesion from './Sesion';
import Tarea from './Tarea';
import LogAuditoria from './LogAuditoria';
import ServicioPsicologo from './ServicioPsicologo';
import RespuestaTarea from './RespuestaTarea';
import DisponibilidadMensual from './DisponibilidadMensual';
import MensajeChat from './MensajeChat';

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


// Usuario - LogAuditoria (1:N)
Usuario.hasMany(LogAuditoria, {
  foreignKey: 'usuario_id',
  as: 'logs_auditoria',
});

LogAuditoria.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario',
});

// Tarea - RespuestaTarea (1:N)
Tarea.hasMany(RespuestaTarea, {
  foreignKey: 'tarea_id',
  as: 'respuestas',
});

RespuestaTarea.belongsTo(Tarea, {
  foreignKey: 'tarea_id',
  as: 'tarea',
});

// Paciente - RespuestaTarea (1:N)
Paciente.hasMany(RespuestaTarea, {
  foreignKey: 'paciente_id',
  as: 'respuestas_tareas',
});

RespuestaTarea.belongsTo(Paciente, {
  foreignKey: 'paciente_id',
  as: 'paciente',
});



// Usuario - ServicioPsicologo (1:N)
Usuario.hasMany(ServicioPsicologo, {
  foreignKey: 'psicologo_id',
  as: 'servicios',
});

ServicioPsicologo.belongsTo(Usuario, {
  foreignKey: 'psicologo_id',
  as: 'psicologo',
});

// Usuario - DisponibilidadMensual (1:N)
Usuario.hasMany(DisponibilidadMensual, {
  foreignKey: 'psicologo_id',
  as: 'disponibilidad_mensual',
});

DisponibilidadMensual.belongsTo(Usuario, {
  foreignKey: 'psicologo_id',
  as: 'psicologo',
});

// Usuario - MensajeChat (1:N) - Mensajes enviados
Usuario.hasMany(MensajeChat, {
  foreignKey: 'remitente_id',
  as: 'mensajes_enviados',
});

MensajeChat.belongsTo(Usuario, {
  foreignKey: 'remitente_id',
  as: 'remitente',
});

// Usuario - MensajeChat (1:N) - Mensajes recibidos
Usuario.hasMany(MensajeChat, {
  foreignKey: 'destinatario_id',
  as: 'mensajes_recibidos',
});

MensajeChat.belongsTo(Usuario, {
  foreignKey: 'destinatario_id',
  as: 'destinatario',
});

export {
  Rol,
  Usuario,
  Paciente,
  Sesion,
  Tarea,
  LogAuditoria,
  ServicioPsicologo,
  RespuestaTarea,
  DisponibilidadMensual,
  MensajeChat,
}; 