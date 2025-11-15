import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

export interface ObjetivoTerapeuticoAttributes {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: 'emocional' | 'cognitivo' | 'conductual' | 'social';
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface ObjetivoTerapeuticoCreationAttributes
  extends Optional<ObjetivoTerapeuticoAttributes, 'id' | 'descripcion' | 'activo' | 'created_at' | 'updated_at'> {}

class ObjetivoTerapeutico
  extends Model<ObjetivoTerapeuticoAttributes, ObjetivoTerapeuticoCreationAttributes>
  implements ObjetivoTerapeuticoAttributes {
  public id!: string;
  public nombre!: string;
  public descripcion?: string;
  public categoria!: 'emocional' | 'cognitivo' | 'conductual' | 'social';
  public activo!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

ObjetivoTerapeutico.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    categoria: {
      type: DataTypes.ENUM('emocional', 'cognitivo', 'conductual', 'social'),
      allowNull: false,
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
    tableName: 'objetivos_terapeuticos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    indexes: [
      {
        fields: ['nombre'],
        unique: true,
        name: 'uk_objetivos_terapeuticos_nombre',
      },
      {
        fields: ['categoria'],
        name: 'idx_objetivos_terapeuticos_categoria',
      },
      {
        fields: ['activo'],
        name: 'idx_objetivos_terapeuticos_activo',
      },
    ],
  }
);

export default ObjetivoTerapeutico;

