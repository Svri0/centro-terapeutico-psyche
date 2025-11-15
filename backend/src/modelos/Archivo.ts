import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

export interface ArchivoAttributes {
  id: string;
  nombre_original: string;
  nombre_almacenado: string;
  ruta_almacenamiento: string;
  tipo_mime?: string;
  tamano_bytes?: number;
  entidad_tipo: 'sesion' | 'tarea' | 'respuesta_tarea' | 'reporte' | 'paciente';
  entidad_id: string;
  subido_por?: string;
  created_at: Date;
  deleted_at?: Date;
}

export interface ArchivoCreationAttributes
  extends Optional<
    ArchivoAttributes,
    'id' | 'tipo_mime' | 'tamano_bytes' | 'subido_por' | 'created_at' | 'deleted_at'
  > {}

class Archivo extends Model<ArchivoAttributes, ArchivoCreationAttributes> implements ArchivoAttributes {
  public id!: string;
  public nombre_original!: string;
  public nombre_almacenado!: string;
  public ruta_almacenamiento!: string;
  public tipo_mime?: string;
  public tamano_bytes?: number;
  public entidad_tipo!: 'sesion' | 'tarea' | 'respuesta_tarea' | 'reporte' | 'paciente';
  public entidad_id!: string;
  public subido_por?: string;
  public readonly created_at!: Date;
  public readonly deleted_at?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly deletedAt?: Date;
}

Archivo.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre_original: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nombre_almacenado: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    ruta_almacenamiento: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tipo_mime: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tamano_bytes: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    entidad_tipo: {
      type: DataTypes.ENUM('sesion', 'tarea', 'respuesta_tarea', 'reporte', 'paciente'),
      allowNull: false,
    },
    entidad_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    subido_por: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    created_at: {
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
    tableName: 'archivos',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
    deletedAt: 'deleted_at',
    paranoid: true,
    indexes: [
      {
        fields: ['nombre_almacenado'],
        unique: true,
        name: 'uk_archivos_nombre_almacenado',
      },
      {
        fields: ['entidad_tipo', 'entidad_id'],
        name: 'idx_archivos_entidad',
      },
      {
        fields: ['subido_por'],
        name: 'idx_archivos_subido_por',
      },
      {
        fields: ['created_at'],
        name: 'idx_archivos_created_at',
      },
    ],
  }
);

export default Archivo;

