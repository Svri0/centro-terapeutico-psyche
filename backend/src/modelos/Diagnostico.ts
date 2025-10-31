import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

export interface DiagnosticoAttributes {
  id: string;
  codigo?: string; // e.g., CIE10/DSM
  nombre: string;
  descripcion?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface DiagnosticoCreationAttributes
  extends Optional<DiagnosticoAttributes, 'id' | 'codigo' | 'descripcion' | 'created_at' | 'updated_at'> {}

class Diagnostico extends Model<DiagnosticoAttributes, DiagnosticoCreationAttributes> implements DiagnosticoAttributes {
  public id!: string;
  public codigo?: string;
  public nombre!: string;
  public descripcion?: string;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;
}

Diagnostico.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'diagnosticos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    indexes: [
      { fields: ['codigo'], name: 'idx_diagnosticos_codigo' },
      { fields: ['nombre'], name: 'idx_diagnosticos_nombre' },
    ],
  }
);

export default Diagnostico;


