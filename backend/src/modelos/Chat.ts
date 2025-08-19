import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

export interface ChatAttributes {
  id: string;
  tipo: 'individual' | 'grupo';
  nombre?: string;
  descripcion?: string;
  psicologo_id: string;
  paciente_id?: string;
  ultimo_mensaje?: string;
  ultimo_mensaje_timestamp?: Date;
  ultimo_mensaje_remitente?: string;
  no_leidos_psicologo: number;
  no_leidos_paciente: number;
  activo: boolean;
  fecha_creacion: Date;
  fecha_ultima_actividad: Date;
}

export interface ChatCreationAttributes extends Optional<ChatAttributes, 'id' | 'no_leidos_psicologo' | 'no_leidos_paciente' | 'activo' | 'fecha_creacion' | 'fecha_ultima_actividad'> {}

class Chat extends Model<ChatAttributes, ChatCreationAttributes> implements ChatAttributes {
  public id!: string;
  public tipo!: 'individual' | 'grupo';
  public nombre?: string;
  public descripcion?: string;
  public psicologo_id!: string;
  public paciente_id?: string;
  public ultimo_mensaje?: string;
  public ultimo_mensaje_timestamp?: Date;
  public ultimo_mensaje_remitente?: string;
  public no_leidos_psicologo!: number;
  public no_leidos_paciente!: number;
  public activo!: boolean;
  public fecha_creacion!: Date;
  public fecha_ultima_actividad!: Date;

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
    tipo: {
      type: DataTypes.ENUM('individual', 'grupo'),
      allowNull: false,
      defaultValue: 'individual',
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    psicologo_id: {
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
        model: 'usuarios',
        key: 'id',
      },
    },
    ultimo_mensaje: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ultimo_mensaje_timestamp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ultimo_mensaje_remitente: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    no_leidos_psicologo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    no_leidos_paciente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fecha_ultima_actividad: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'chats',
    timestamps: true,
  }
);

export default Chat;
