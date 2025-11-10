import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

// Interfaz para las propiedades requeridas
export interface TokensMensajesPacienteAttributes {
  id: string;
  paciente_id: string;
  tokens_disponibles: number;
  tokens_usados: number;
  fecha_ultimo_reset?: Date;
  periodo_reset: 'diario' | 'semanal' | 'mensual' | 'ilimitado';
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Interfaz para las propiedades opcionales (para crear)
export interface TokensMensajesPacienteCreationAttributes
  extends Optional<TokensMensajesPacienteAttributes, 'id' | 'tokens_usados' | 'fecha_ultimo_reset' | 'activo' | 'created_at' | 'updated_at' | 'deleted_at'> {}

class TokensMensajesPaciente extends Model<TokensMensajesPacienteAttributes, TokensMensajesPacienteCreationAttributes> implements TokensMensajesPacienteAttributes {
  public id!: string;
  public paciente_id!: string;
  public tokens_disponibles!: number;
  public tokens_usados!: number;
  public fecha_ultimo_reset?: Date;
  public periodo_reset!: 'diario' | 'semanal' | 'mensual' | 'ilimitado';
  public activo!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

TokensMensajesPaciente.init(
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
      unique: true,
    },
    tokens_disponibles: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    tokens_usados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    fecha_ultimo_reset: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    periodo_reset: {
      type: DataTypes.ENUM('diario', 'semanal', 'mensual', 'ilimitado'),
      allowNull: false,
      defaultValue: 'ilimitado',
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'tokens_mensajes_paciente',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    indexes: [
      {
        fields: ['paciente_id'],
        unique: true,
        name: 'idx_tokens_mensajes_paciente_id'
      },
      {
        fields: ['activo'],
        name: 'idx_tokens_mensajes_paciente_activo'
      }
    ]
  }
);

export default TokensMensajesPaciente;

