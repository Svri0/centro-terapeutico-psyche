import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';
import Rol from './Rol';

// Interfaz para las propiedades requeridas
export interface UsuarioAttributes {
  id: string;
  email: string;
  password_hash: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  fecha_nacimiento?: Date;
  genero?: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';
  avatar_url?: string;
  especialidad?: string;
  descripcion?: string;
  codigo_sbs?: string;
  rol_id: number;
  activo: boolean;
  email_verificado: boolean;
  token_activacion?: string;
  token_activacion_expira?: Date;
  ultimo_acceso?: Date;
  configuracion: any;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Interfaz para las propiedades opcionales (para crear)
export interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'id' | 'activo' | 'email_verificado' | 'configuracion' | 'created_at' | 'updated_at'> {}

class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
  public id!: string;
  public email!: string;
  public password_hash!: string;
  public nombres!: string;
  public apellidos!: string;
  public telefono?: string;
  public fecha_nacimiento?: Date;
  public genero?: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';
  public avatar_url?: string;
  public especialidad?: string;
  public descripcion?: string;
  public codigo_sbs?: string;
  public rol_id!: number;
  public activo!: boolean;
  public email_verificado!: boolean;
  public token_activacion?: string;
  public token_activacion_expira?: Date;
  public ultimo_acceso?: Date;
  public configuracion!: any;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // Asociaciones
  public readonly rol?: Rol;
}

Usuario.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nombres: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    genero: {
      type: DataTypes.ENUM('masculino', 'femenino', 'otro', 'prefiero_no_decir'),
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    especialidad: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    codigo_sbs: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    email_verificado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    token_activacion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    token_activacion_expira: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ultimo_acceso: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    configuracion: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
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
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
  }
);

export default Usuario; 