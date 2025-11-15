// ============================================
// ÍNDICE DE MODELOS - REESTRUCTURACIÓN COMPLETA
// ============================================

// Modelos base (sin cambios estructurales)
import Rol from './Rol';
import Usuario from './Usuario';
import LogAuditoria from './LogAuditoria';
import ConfiguracionRecordatorio from './ConfiguracionRecordatorio';
import ConfiguracionSistema from './ConfiguracionSistema';
import MensajeChat from './MensajeChat';
import TokensMensajesPaciente from './TokensMensajesPaciente';
import ContactoEmergencia from './ContactoEmergencia';
import Etiqueta from './Etiqueta';
import Diagnostico from './Diagnostico';
import RespuestaTarea from './RespuestaTarea';
import ReporteProgreso from './ReporteProgreso';

// Modelos actualizados
import Paciente from './Paciente';
import Sesion from './Sesion';
import Tarea from './Tarea';
import ServicioPsicologo from './ServicioPsicologo';
import HorarioDisponible from './HorarioDisponible';

// Modelos nuevos
import TipoServicio from './TipoServicio';
import ObjetivoTerapeutico from './ObjetivoTerapeutico';
import TecnicaTerapeutica from './TecnicaTerapeutica';
import SesionObjetivo from './SesionObjetivo';
import SesionTecnica from './SesionTecnica';
import EvaluacionSesion from './EvaluacionSesion';
import Archivo from './Archivo';

// ============================================
// CONFIGURAR ASOCIACIONES
// ============================================

// ----------------------------------------
// MÓDULO: AUTENTICACIÓN Y PERMISOS
// ----------------------------------------

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

// Usuario - HorarioDisponible (1:N)
Usuario.hasMany(HorarioDisponible, {
  foreignKey: 'psicologo_id',
  as: 'horarios_disponibles',
});

HorarioDisponible.belongsTo(Usuario, {
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

// Paciente - ReporteProgreso (1:N)
Paciente.hasMany(ReporteProgreso, {
  foreignKey: 'paciente_id',
  as: 'reportes_progreso',
});

ReporteProgreso.belongsTo(Paciente, {
  foreignKey: 'paciente_id',
  as: 'paciente',
});

// Usuario - ReporteProgreso (1:N) - Psicólogo
Usuario.hasMany(ReporteProgreso, {
  foreignKey: 'psicologo_id',
  as: 'reportes_progreso',
});

ReporteProgreso.belongsTo(Usuario, {
  foreignKey: 'psicologo_id',
  as: 'psicologo',
});

// Sesion - ReporteProgreso (1:N)
Sesion.hasMany(ReporteProgreso, {
  foreignKey: 'sesion_id',
  as: 'reportes',
});

ReporteProgreso.belongsTo(Sesion, {
  foreignKey: 'sesion_id',
  as: 'sesion',
});

// Paciente - ContactoEmergencia (1:N)
Paciente.hasMany(ContactoEmergencia, {
  foreignKey: 'paciente_id',
  as: 'contactos_emergencia',
});

ContactoEmergencia.belongsTo(Paciente, {
  foreignKey: 'paciente_id',
  as: 'paciente',
});

// Paciente - Etiqueta (N:M) a través de paciente_etiquetas
Paciente.belongsToMany(Etiqueta, {
  through: 'paciente_etiquetas',
  foreignKey: 'paciente_id',
  otherKey: 'etiqueta_id',
  as: 'etiquetas_norm',
});

Etiqueta.belongsToMany(Paciente, {
  through: 'paciente_etiquetas',
  foreignKey: 'etiqueta_id',
  otherKey: 'paciente_id',
  as: 'pacientes',
});

// Paciente - Diagnostico (N:M) a través de paciente_diagnosticos
Paciente.belongsToMany(Diagnostico, {
  through: 'paciente_diagnosticos',
  foreignKey: 'paciente_id',
  otherKey: 'diagnostico_id',
  as: 'diagnosticos_norm',
});

Diagnostico.belongsToMany(Paciente, {
  through: 'paciente_diagnosticos',
  foreignKey: 'diagnostico_id',
  otherKey: 'paciente_id',
  as: 'pacientes',
});

// Paciente - TokensMensajesPaciente (1:1)
Paciente.hasOne(TokensMensajesPaciente, {
  foreignKey: 'paciente_id',
  as: 'tokens_mensajes',
});

TokensMensajesPaciente.belongsTo(Paciente, {
  foreignKey: 'paciente_id',
  as: 'paciente',
});

// ----------------------------------------
// MÓDULO: SESIONES TERAPÉUTICAS (NORMALIZADO)
// ----------------------------------------

// Sesion - ObjetivoTerapeutico (N:M) a través de sesion_objetivos
Sesion.belongsToMany(ObjetivoTerapeutico, {
  through: SesionObjetivo,
  foreignKey: 'sesion_id',
  otherKey: 'objetivo_id',
  as: 'objetivos',
});

ObjetivoTerapeutico.belongsToMany(Sesion, {
  through: SesionObjetivo,
  foreignKey: 'objetivo_id',
  otherKey: 'sesion_id',
  as: 'sesiones',
});

// Sesion - TecnicaTerapeutica (N:M) a través de sesion_tecnicas
Sesion.belongsToMany(TecnicaTerapeutica, {
  through: SesionTecnica,
  foreignKey: 'sesion_id',
  otherKey: 'tecnica_id',
  as: 'tecnicas',
});

TecnicaTerapeutica.belongsToMany(Sesion, {
  through: SesionTecnica,
  foreignKey: 'tecnica_id',
  otherKey: 'sesion_id',
  as: 'sesiones',
});

// Sesion - SesionObjetivo (1:N) para acceso directo
Sesion.hasMany(SesionObjetivo, {
  foreignKey: 'sesion_id',
  as: 'sesion_objetivos',
});

SesionObjetivo.belongsTo(Sesion, {
  foreignKey: 'sesion_id',
  as: 'sesion',
});

SesionObjetivo.belongsTo(ObjetivoTerapeutico, {
  foreignKey: 'objetivo_id',
  as: 'objetivo',
});

// Sesion - SesionTecnica (1:N) para acceso directo
Sesion.hasMany(SesionTecnica, {
  foreignKey: 'sesion_id',
  as: 'sesion_tecnicas',
});

SesionTecnica.belongsTo(Sesion, {
  foreignKey: 'sesion_id',
  as: 'sesion',
});

SesionTecnica.belongsTo(TecnicaTerapeutica, {
  foreignKey: 'tecnica_id',
  as: 'tecnica',
});

// Sesion - EvaluacionSesion (1:1)
Sesion.hasOne(EvaluacionSesion, {
  foreignKey: 'sesion_id',
  as: 'evaluacion',
});

EvaluacionSesion.belongsTo(Sesion, {
  foreignKey: 'sesion_id',
  as: 'sesion',
});

// ----------------------------------------
// MÓDULO: SERVICIOS Y DISPONIBILIDAD
// ----------------------------------------

// TipoServicio - ServicioPsicologo (1:N)
TipoServicio.hasMany(ServicioPsicologo, {
  foreignKey: 'tipo_servicio_id',
  as: 'servicios',
});

ServicioPsicologo.belongsTo(TipoServicio, {
  foreignKey: 'tipo_servicio_id',
  as: 'tipo_servicio',
});

// ----------------------------------------
// MÓDULO: ARCHIVOS CENTRALIZADOS
// ----------------------------------------

// Usuario - Archivo (1:N) - Subido por
Usuario.hasMany(Archivo, {
  foreignKey: 'subido_por',
  as: 'archivos_subidos',
});

Archivo.belongsTo(Usuario, {
  foreignKey: 'subido_por',
  as: 'usuario',
});

// ============================================
// EXPORTAR MODELOS
// ============================================

export {
  // Modelos base
  Rol,
  Usuario,
  LogAuditoria,
  ConfiguracionRecordatorio,
  ConfiguracionSistema,
  MensajeChat,
  TokensMensajesPaciente,
  ContactoEmergencia,
  Etiqueta,
  Diagnostico,
  RespuestaTarea,
  ReporteProgreso,
  
  // Modelos actualizados
  Paciente,
  Sesion,
  Tarea,
  ServicioPsicologo,
  HorarioDisponible,
  
  // Modelos nuevos
  TipoServicio,
  ObjetivoTerapeutico,
  TecnicaTerapeutica,
  SesionObjetivo,
  SesionTecnica,
  EvaluacionSesion,
  Archivo,
}; 