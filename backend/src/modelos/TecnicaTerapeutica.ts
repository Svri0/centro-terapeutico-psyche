import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

export interface TecnicaTerapeuticaAttributes {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria: 'cognitivo-conductual' | 'humanista' | 'psicodinamica' | 'sistemica';
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface TecnicaTerapeuticaCreationAttributes
  extends Optional<TecnicaTerapeuticaAttributes, 'id' | 'descripcion' | 'activo' | 'created_at' | 'updated_at'> {}

class TecnicaTerapeutica
  extends Model<TecnicaTerapeuticaAttributes, TecnicaTerapeuticaCreationAttributes>
  implements TecnicaTerapeuticaAttributes {
  public id!: string;
  public nombre!: string;
  public descripcion?: string;
  public categoria!: 'cognitivo-conductual' | 'humanista' | 'psicodinamica' | 'sistemica';
  public activo!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

TecnicaTerapeutica.init(
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
      type: DataTypes.ENUM('cognitivo-conductual', 'humanista', 'psicodinamica', 'sistemica'),
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
    tableName: 'tecnicas_terapeuticas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    indexes: [
      {
        fields: ['nombre'],
        unique: true,
        name: 'uk_tecnicas_terapeuticas_nombre',
      },
      {
        fields: ['categoria'],
        name: 'idx_tecnicas_terapeuticas_categoria',
      },
      {
        fields: ['activo'],
        name: 'idx_tecnicas_terapeuticas_activo',
      },
    ],
  }
);

export default TecnicaTerapeutica;

