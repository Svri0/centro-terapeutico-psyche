import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

export interface MensajeChatAttributes {
  id: string;
  chat_id: string;
  remitente_id: string;
  contenido: string;
  tipo: 'texto' | 'imagen' | 'audio' | 'documento';
  leido: boolean;
  metadata?: any;
  fecha_envio: Date;
}

export interface MensajeChatCreationAttributes extends Optional<MensajeChatAttributes, 'id' | 'leido' | 'fecha_envio'> {}

class MensajeChat extends Model<MensajeChatAttributes, MensajeChatCreationAttributes> implements MensajeChatAttributes {
  public id!: string;
  public chat_id!: string;
  public remitente_id!: string;
  public contenido!: string;
  public tipo!: 'texto' | 'imagen' | 'audio' | 'documento';
  public leido!: boolean;
  public metadata?: any;
  public fecha_envio!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MensajeChat.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    chat_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'chats',
        key: 'id',
      },
    },
    remitente_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM('texto', 'imagen', 'audio', 'documento'),
      allowNull: false,
      defaultValue: 'texto',
    },
    leido: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    fecha_envio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'mensajes_chat',
    timestamps: true,
  }
);

export default MensajeChat;
