import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../configuracion/database';

export interface RespuestaTareaAttributes {
  id?: string;
  tarea_id: string;
  paciente_id: string;
  contenido_respuesta?: string;
  archivo_respuesta?: string; // Para almacenar base64 de dibujos/imágenes
  fecha_envio: Date;
  evaluacion_psicologo?: any;
  created_at?: Date;
  updated_at?: Date;
}

export interface RespuestaTareaCreationAttributes extends Omit<RespuestaTareaAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class RespuestaTarea extends Model<RespuestaTareaAttributes, RespuestaTareaCreationAttributes> implements RespuestaTareaAttributes {
  public id!: string;
  public tarea_id!: string;
  public paciente_id!: string;
  public contenido_respuesta?: string;
  public archivo_respuesta?: string;
  public fecha_envio!: Date;
  public evaluacion_psicologo?: any;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

RespuestaTarea.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tarea_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tareas',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    paciente_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'pacientes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    contenido_respuesta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    archivo_respuesta: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Base64 de dibujos o imágenes de respuesta'
    },
    fecha_envio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    evaluacion_psicologo: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Evaluación y retroalimentación del psicólogo'
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
    tableName: 'respuestas_tareas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false,
    indexes: [
      {
        fields: ['tarea_id']
      },
      {
        fields: ['paciente_id']
      },
      {
        fields: ['fecha_envio']
      }
    ]
  }
);

export default RespuestaTarea;
