import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

// Interfaz para las propiedades requeridas
export interface RolAttributes {
  id: number;
  nombre: string;
  descripcion?: string;
  permisos: any[];
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Interfaz para las propiedades opcionales (para crear)
export interface RolCreationAttributes extends Optional<RolAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Rol extends Model<RolAttributes, RolCreationAttributes> implements RolAttributes {
  public id!: number;
  public nombre!: string;
  public descripcion?: string;
  public permisos!: any[];
  public activo!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

Rol.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    permisos: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
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
    tableName: 'roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
  }
);

export default Rol; 