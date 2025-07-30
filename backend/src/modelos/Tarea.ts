import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';
import Paciente from './Paciente';
import Usuario from './Usuario';
import Sesion from './Sesion';

// Interfaz para las propiedades requeridas
export interface TareaAttributes {
  id: string;
  paciente_id: string;
  psicologo_id: string;
  sesion_id?: string;
  titulo: string;
  descripcion: string;
  instrucciones?: string;
  tipo_tarea: 'ejercicio' | 'lectura' | 'reflexion' | 'practica' | 'evaluacion';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fecha_asignacion: Date;
  fecha_vencimiento?: Date;
  fecha_completada?: Date;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'vencida' | 'cancelada';
  puntos_asignados: number;
  archivos_adjuntos: any[];
  respuesta_paciente?: string;
  archivos_respuesta: any[];
  evaluacion_psicologo?: any;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Interfaz para las propiedades opcionales (para crear)
export interface TareaCreationAttributes extends Optional<TareaAttributes, 'id' | 'tipo_tarea' | 'prioridad' | 'fecha_asignacion' | 'estado' | 'puntos_asignados' | 'archivos_adjuntos' | 'archivos_respuesta' | 'created_at' | 'updated_at'> {}

class Tarea extends Model<TareaAttributes, TareaCreationAttributes> implements TareaAttributes {
  public id!: string;
  public paciente_id!: string;
  public psicologo_id!: string;
  public sesion_id?: string;
  public titulo!: string;
  public descripcion!: string;
  public instrucciones?: string;
  public tipo_tarea!: 'ejercicio' | 'lectura' | 'reflexion' | 'practica' | 'evaluacion';
  public prioridad!: 'baja' | 'media' | 'alta' | 'urgente';
  public fecha_asignacion!: Date;
  public fecha_vencimiento?: Date;
  public fecha_completada?: Date;
  public estado!: 'pendiente' | 'en_progreso' | 'completada' | 'vencida' | 'cancelada';
  public puntos_asignados!: number;
  public archivos_adjuntos!: any[];
  public respuesta_paciente?: string;
  public archivos_respuesta!: any[];
  public evaluacion_psicologo?: any;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // Asociaciones
  public readonly paciente?: Paciente;
  public readonly psicologo?: Usuario;
  public readonly sesion?: Sesion;
}

Tarea.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    paciente_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'pacientes',
        key: 'id',
      },
    },
    psicologo_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    sesion_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'sesiones',
        key: 'id',
      },
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    instrucciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tipo_tarea: {
      type: DataTypes.ENUM('ejercicio', 'lectura', 'reflexion', 'practica', 'evaluacion'),
      allowNull: false,
      defaultValue: 'ejercicio',
    },
    prioridad: {
      type: DataTypes.ENUM('baja', 'media', 'alta', 'urgente'),
      allowNull: false,
      defaultValue: 'media',
    },
    fecha_asignacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fecha_vencimiento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_completada: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'en_progreso', 'completada', 'vencida', 'cancelada'),
      allowNull: false,
      defaultValue: 'pendiente',
    },
    puntos_asignados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
    },
    archivos_adjuntos: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    respuesta_paciente: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    archivos_respuesta: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    evaluacion_psicologo: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'tareas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
  }
);

export default Tarea; 