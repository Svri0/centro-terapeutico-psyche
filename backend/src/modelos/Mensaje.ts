import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';
import Usuario from './Usuario';
import Paciente from './Paciente';

// Interfaz para las propiedades requeridas
export interface MensajeAttributes {
  id: string;
  remitente_id: string;
  destinatario_id: string;
  paciente_id?: string;
  asunto?: string;
  contenido: string;
  tipo_mensaje: 'chat' | 'notificacion' | 'recordatorio' | 'alerta';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  leido: boolean;
  fecha_leido?: Date;
  archivos_adjuntos: any[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Interfaz para las propiedades opcionales (para crear)
export interface MensajeCreationAttributes extends Optional<MensajeAttributes, 'id' | 'tipo_mensaje' | 'prioridad' | 'leido' | 'archivos_adjuntos' | 'created_at' | 'updated_at'> {}

class Mensaje extends Model<MensajeAttributes, MensajeCreationAttributes> implements MensajeAttributes {
  public id!: string;
  public remitente_id!: string;
  public destinatario_id!: string;
  public paciente_id?: string;
  public asunto?: string;
  public contenido!: string;
  public tipo_mensaje!: 'chat' | 'notificacion' | 'recordatorio' | 'alerta';
  public prioridad!: 'baja' | 'media' | 'alta' | 'urgente';
  public leido!: boolean;
  public fecha_leido?: Date;
  public archivos_adjuntos!: any[];
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // Asociaciones
  public readonly remitente?: Usuario;
  public readonly destinatario?: Usuario;
  public readonly paciente?: Paciente;
}

Mensaje.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    remitente_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    destinatario_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    paciente_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'pacientes',
        key: 'id',
      },
    },
    asunto: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tipo_mensaje: {
      type: DataTypes.ENUM('chat', 'notificacion', 'recordatorio', 'alerta'),
      allowNull: false,
      defaultValue: 'chat',
    },
    prioridad: {
      type: DataTypes.ENUM('baja', 'media', 'alta', 'urgente'),
      allowNull: false,
      defaultValue: 'media',
    },
    leido: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    fecha_leido: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    archivos_adjuntos: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
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
    tableName: 'mensajes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
  }
);

export default Mensaje; 