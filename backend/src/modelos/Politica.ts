import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

// Interfaz para las propiedades requeridas
export interface PoliticaAttributes {
  id: string;
  tipo: 'seguridad' | 'privacidad';
  titulo: string;
  contenido: string; // JSON string con las secciones
  version: number;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Interfaz para las propiedades opcionales (para crear)
export interface PoliticaCreationAttributes
  extends Optional<PoliticaAttributes, 'id' | 'version' | 'activo' | 'created_at' | 'updated_at' | 'deleted_at'> {}

class Politica extends Model<PoliticaAttributes, PoliticaCreationAttributes> implements PoliticaAttributes {
  public id!: string;
  public tipo!: 'seguridad' | 'privacidad';
  public titulo!: string;
  public contenido!: string;
  public version!: number;
  public activo!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // Método helper para parsear el contenido JSON
  public getContenidoParseado(): any {
    try {
      return JSON.parse(this.contenido);
    } catch (error) {
      return { secciones: [] };
    }
  }
}

Politica.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tipo: {
      type: DataTypes.ENUM('seguridad', 'privacidad'),
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
    tableName: 'politicas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    indexes: [
      {
        fields: ['tipo'],
        name: 'idx_politicas_tipo'
      },
      {
        fields: ['activo'],
        name: 'idx_politicas_activo'
      },
      {
        fields: ['tipo', 'activo'],
        name: 'idx_politicas_tipo_activo'
      }
    ]
  }
);

export default Politica;
