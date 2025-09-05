import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../configuracion/database';

export interface DisponibilidadMensualAttributes {
  id?: number;
  psicologo_id: string;
  fecha: string; // YYYY-MM-DD
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
  tipo_disponibilidad: 'individual' | 'recurrente';
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface DisponibilidadMensualCreationAttributes extends Omit<DisponibilidadMensualAttributes, 'id' | 'created_at' | 'updated_at'> {}

class DisponibilidadMensual extends Model<DisponibilidadMensualAttributes, DisponibilidadMensualCreationAttributes> {
  public id!: number;
  public psicologo_id!: string;
  public fecha!: string;
  public hora_inicio!: string;
  public hora_fin!: string;
  public activo!: boolean;
  public tipo_disponibilidad!: 'individual' | 'recurrente';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public deleted_at?: Date;
}

DisponibilidadMensual.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    psicologo_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Fecha específica (YYYY-MM-DD)'
    },
    hora_inicio: {
      type: DataTypes.TIME,
      allowNull: false
    },
    hora_fin: {
      type: DataTypes.TIME,
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    tipo_disponibilidad: {
      type: DataTypes.ENUM('individual', 'recurrente'),
      allowNull: false,
      defaultValue: 'individual',
      comment: 'individual: fecha específica, recurrente: se repite semanalmente'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'disponibilidad_mensual',
    timestamps: true,
    paranoid: true, // Soft deletes
    underscored: true,
    indexes: [
      {
        fields: ['psicologo_id']
      },
      {
        fields: ['psicologo_id', 'fecha'],
        unique: true
      },
      {
        fields: ['fecha']
      },
      {
        fields: ['activo']
      },
      {
        fields: ['tipo_disponibilidad']
      }
    ]
  }
);

export default DisponibilidadMensual;
