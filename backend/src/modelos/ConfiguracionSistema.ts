import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

// Interfaz para las propiedades requeridas
export interface ConfiguracionSistemaAttributes {
  id: string;
  clave: string;
  valor: string;
  descripcion?: string;
  tipo: 'boolean' | 'number' | 'string' | 'json';
  categoria: 'chat' | 'mensajes' | 'general' | 'backup';
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Interfaz para las propiedades opcionales (para crear)
export interface ConfiguracionSistemaCreationAttributes
  extends Optional<ConfiguracionSistemaAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'descripcion'> {}

class ConfiguracionSistema extends Model<ConfiguracionSistemaAttributes, ConfiguracionSistemaCreationAttributes> implements ConfiguracionSistemaAttributes {
  public id!: string;
  public clave!: string;
  public valor!: string;
  public descripcion?: string;
  public tipo!: 'boolean' | 'number' | 'string' | 'json';
  public categoria!: 'chat' | 'mensajes' | 'general' | 'backup';
  public activo!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

ConfiguracionSistema.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clave: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    valor: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tipo: {
      type: DataTypes.ENUM('boolean', 'number', 'string', 'json'),
      allowNull: false,
      defaultValue: 'string',
    },
    categoria: {
      type: DataTypes.ENUM('chat', 'mensajes', 'general', 'backup'),
      allowNull: false,
      defaultValue: 'general',
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
    tableName: 'configuraciones_sistema',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    indexes: [
      {
        fields: ['clave'],
        unique: true,
        name: 'idx_configuraciones_sistema_clave'
      },
      {
        fields: ['categoria'],
        name: 'idx_configuraciones_sistema_categoria'
      },
      {
        fields: ['activo'],
        name: 'idx_configuraciones_sistema_activo'
      }
    ]
  }
);

export default ConfiguracionSistema;

