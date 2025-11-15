import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

export interface TipoServicioAttributes {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  duracion_estandar_minutos: number;
  categoria: 'evaluacion' | 'terapia' | 'consulta';
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface TipoServicioCreationAttributes
  extends Optional<TipoServicioAttributes, 'id' | 'descripcion' | 'activo' | 'created_at' | 'updated_at'> {}

class TipoServicio
  extends Model<TipoServicioAttributes, TipoServicioCreationAttributes>
  implements TipoServicioAttributes {
  public id!: string;
  public codigo!: string;
  public nombre!: string;
  public descripcion?: string;
  public duracion_estandar_minutos!: number;
  public categoria!: 'evaluacion' | 'terapia' | 'consulta';
  public activo!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

TipoServicio.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duracion_estandar_minutos: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoria: {
      type: DataTypes.ENUM('evaluacion', 'terapia', 'consulta'),
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
    tableName: 'tipos_servicio',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    indexes: [
      {
        fields: ['codigo'],
        unique: true,
        name: 'uk_tipos_servicio_codigo',
      },
      {
        fields: ['categoria'],
        name: 'idx_tipos_servicio_categoria',
      },
      {
        fields: ['activo'],
        name: 'idx_tipos_servicio_activo',
      },
    ],
  }
);

export default TipoServicio;

