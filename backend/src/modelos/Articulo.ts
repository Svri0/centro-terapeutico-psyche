import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';
import Usuario from './Usuario';

// Interfaz para las propiedades requeridas
export interface ArticuloAttributes {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  contenido: string;
  imagen_url: string;
  categoria: string;
  autor_id?: string;
  tiempo_lectura: number; // en minutos
  publicado: boolean;
  fecha_publicacion?: Date;
  vistas: number;
  etiquetas: string[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Interfaz para las propiedades opcionales (para crear)
export interface ArticuloCreationAttributes extends Optional<ArticuloAttributes, 'id' | 'autor_id' | 'publicado' | 'fecha_publicacion' | 'vistas' | 'etiquetas' | 'created_at' | 'updated_at'> {}

class Articulo extends Model<ArticuloAttributes, ArticuloCreationAttributes> implements ArticuloAttributes {
  public id!: string;
  public titulo!: string;
  public slug!: string;
  public resumen!: string;
  public contenido!: string;
  public imagen_url!: string;
  public categoria!: string;
  public autor_id?: string;
  public tiempo_lectura!: number;
  public publicado!: boolean;
  public fecha_publicacion?: Date;
  public vistas!: number;
  public etiquetas!: string[];
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // Asociaciones
  public readonly autor?: Usuario;
}

Articulo.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    resumen: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imagen_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    categoria: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    autor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    tiempo_lectura: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    publicado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    fecha_publicacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    vistas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    etiquetas: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
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
    tableName: 'articulos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    indexes: [
      {
        fields: ['slug'],
        unique: true,
      },
      {
        fields: ['categoria'],
      },
      {
        fields: ['publicado'],
      },
      {
        fields: ['fecha_publicacion'],
      },
    ],
  }
);

export default Articulo;

