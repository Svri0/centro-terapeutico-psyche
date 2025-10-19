import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

// Interfaz para las propiedades requeridas
export interface MensajeChatAttributes {
  id: string;
  contenido: string;
  remitente_id: string;
  destinatario_id: string;
  tipo: 'psicologo' | 'paciente' | 'admin';
  leido: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Interfaz para las propiedades opcionales (para crear)
export interface MensajeChatCreationAttributes extends Optional<MensajeChatAttributes, 'id' | 'leido' | 'created_at' | 'updated_at'> {}

class MensajeChat extends Model<MensajeChatAttributes, MensajeChatCreationAttributes> implements MensajeChatAttributes {
  public id!: string;
  public contenido!: string;
  public remitente_id!: string;
  public destinatario_id!: string;
  public tipo!: 'psicologo' | 'paciente' | 'admin';
  public leido!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

MensajeChat.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tipo: {
      type: DataTypes.ENUM('psicologo', 'paciente', 'admin'),
      allowNull: false,
    },
    leido: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'mensajes_chat',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    indexes: [
      {
        fields: ['remitente_id', 'destinatario_id'],
        name: 'idx_mensajes_chat_participantes'
      },
      {
        fields: ['created_at'],
        name: 'idx_mensajes_chat_timestamp'
      },
      {
        fields: ['leido'],
        name: 'idx_mensajes_chat_leido'
      }
    ]
  }
);

export default MensajeChat;
