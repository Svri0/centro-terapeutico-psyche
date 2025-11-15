import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

export interface SesionObjetivoAttributes {
  id: string;
  sesion_id: string;
  objetivo_id: string;
  alcanzado: boolean;
  notas?: string;
  created_at: Date;
}

export interface SesionObjetivoCreationAttributes
  extends Optional<SesionObjetivoAttributes, 'id' | 'alcanzado' | 'notas' | 'created_at'> {}

class SesionObjetivo
  extends Model<SesionObjetivoAttributes, SesionObjetivoCreationAttributes>
  implements SesionObjetivoAttributes {
  public id!: string;
  public sesion_id!: string;
  public objetivo_id!: string;
  public alcanzado!: boolean;
  public notas?: string;
  public readonly created_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
}

SesionObjetivo.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sesion_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sesiones',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    objetivo_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'objetivos_terapeuticos',
        key: 'id',
      },
    },
    alcanzado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'sesion_objetivos',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['sesion_id', 'objetivo_id'],
        unique: true,
        name: 'uk_sesion_objetivos_sesion_objetivo',
      },
      {
        fields: ['sesion_id'],
        name: 'idx_sesion_objetivos_sesion',
      },
      {
        fields: ['objetivo_id'],
        name: 'idx_sesion_objetivos_objetivo',
      },
    ],
  }
);

export default SesionObjetivo;

