import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';
import Usuario from './Usuario';

// Interfaz para las propiedades requeridas
export interface LogAuditoriaAttributes {
  id: string;
  usuario_id?: string;
  accion: string;
  tabla_afectada?: string;
  registro_id?: string;
  valores_anteriores?: any;
  valores_nuevos?: any;
  ip_address?: string;
  user_agent?: string;
  metadatos: any;
  created_at: Date;
}

// Interfaz para las propiedades opcionales (para crear)
export interface LogAuditoriaCreationAttributes extends Optional<LogAuditoriaAttributes, 'id' | 'metadatos' | 'created_at'> {}

class LogAuditoria extends Model<LogAuditoriaAttributes, LogAuditoriaCreationAttributes> implements LogAuditoriaAttributes {
  public id!: string;
  public usuario_id?: string;
  public accion!: string;
  public tabla_afectada?: string;
  public registro_id?: string;
  public valores_anteriores?: any;
  public valores_nuevos?: any;
  public ip_address?: string;
  public user_agent?: string;
  public metadatos!: any;
  public created_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;

  // Asociaciones
  public readonly usuario?: Usuario;
}

LogAuditoria.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    accion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    tabla_afectada: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    registro_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    valores_anteriores: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    valores_nuevos: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadatos: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'logs_auditoria',
    timestamps: false, // Esta tabla no tiene updated_at
    createdAt: 'created_at',
  }
);

export default LogAuditoria; 