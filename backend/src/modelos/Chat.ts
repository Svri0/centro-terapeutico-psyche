import { Model, DataTypes } from 'sequelize';
import sequelize from '../configuracion/database';

export interface ChatAttributes {
  id: string;
  emisor_id: string;
  receptor_id: string;
  contenido: string;
  leido: boolean;
  timestamp: Date;
}

export interface ChatCreationAttributes extends Omit<ChatAttributes, 'id' | 'timestamp'> {
  timestamp?: Date;
}

class Chat extends Model<ChatAttributes, ChatCreationAttributes> implements ChatAttributes {
  public id!: string;
  public emisor_id!: string;
  public receptor_id!: string;
  public contenido!: string;
  public leido!: boolean;
  public timestamp!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Chat.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    emisor_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    receptor_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    leido: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'chat',
    timestamps: true,
    underscored: true,
  }
);

export default Chat;
