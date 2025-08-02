import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../configuracion/database';

export interface ServicioPsicologoAttributes {
  id?: number;
  psicologo_id: string;
  tipo_servicio_id: string;
  nombre: string;
  descripcion: string;
  duracion: number;
  categoria: string;
  activo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface ServicioPsicologoCreationAttributes extends Omit<ServicioPsicologoAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class ServicioPsicologo extends Model<ServicioPsicologoAttributes, ServicioPsicologoCreationAttributes> implements ServicioPsicologoAttributes {
  public id!: number;
  public psicologo_id!: string;
  public tipo_servicio_id!: string;
  public nombre!: string;
  public descripcion!: string;
  public duracion!: number;
  public categoria!: string;
  public activo!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ServicioPsicologo.init(
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
      }
    },
    tipo_servicio_id: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'ID del tipo de servicio predefinido'
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    duracion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Duración en minutos'
    },
    categoria: {
      type: DataTypes.STRING,
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    }
  },
  {
    sequelize,
    tableName: 'servicios_psicologo',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false, // Deshabilitar soft deletes
    indexes: [
      {
        fields: ['psicologo_id']
      },
      {
        fields: ['tipo_servicio_id']
      },
      {
        fields: ['activo']
      },
      {
        fields: ['psicologo_id', 'tipo_servicio_id'],
        unique: true,
        name: 'servicios_psicologo_unique'
      }
    ]
  }
);

export default ServicioPsicologo; 