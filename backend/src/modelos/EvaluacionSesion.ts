import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

export interface EvaluacionSesionAttributes {
  id: string;
  sesion_id: string;
  animo_paciente?: number;
  nivel_ansiedad?: number;
  cooperacion?: number;
  insight?: number;
  observaciones_evaluacion?: string;
  created_at: Date;
  updated_at: Date;
}

export interface EvaluacionSesionCreationAttributes
  extends Optional<
    EvaluacionSesionAttributes,
    'id' | 'animo_paciente' | 'nivel_ansiedad' | 'cooperacion' | 'insight' | 'observaciones_evaluacion' | 'created_at' | 'updated_at'
  > {}

class EvaluacionSesion
  extends Model<EvaluacionSesionAttributes, EvaluacionSesionCreationAttributes>
  implements EvaluacionSesionAttributes {
  public id!: string;
  public sesion_id!: string;
  public animo_paciente?: number;
  public nivel_ansiedad?: number;
  public cooperacion?: number;
  public insight?: number;
  public observaciones_evaluacion?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EvaluacionSesion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sesion_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'sesiones',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    animo_paciente: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 10,
      },
    },
    nivel_ansiedad: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 10,
      },
    },
    cooperacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 10,
      },
    },
    insight: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 10,
      },
    },
    observaciones_evaluacion: {
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
  },
  {
    sequelize,
    tableName: 'evaluaciones_sesion',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['sesion_id'],
        unique: true,
        name: 'uk_evaluaciones_sesion_sesion',
      },
    ],
  }
);

export default EvaluacionSesion;

