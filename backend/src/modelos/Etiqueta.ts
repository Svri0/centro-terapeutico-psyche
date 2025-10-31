import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

export interface EtiquetaAttributes {
  id: string;
  nombre: string;
  color?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface EtiquetaCreationAttributes extends Optional<EtiquetaAttributes, 'id' | 'color' | 'created_at' | 'updated_at'> {}

class Etiqueta extends Model<EtiquetaAttributes, EtiquetaCreationAttributes> implements EtiquetaAttributes {
  public id!: string;
  public nombre!: string;
  public color?: string;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;
}

Etiqueta.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    color: {
      type: DataTypes.STRING(20),
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
    tableName: 'etiquetas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    indexes: [
      { fields: ['nombre'], unique: true, name: 'uk_etiquetas_nombre' },
    ],
  }
);

export default Etiqueta;


