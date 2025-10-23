import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';
import Usuario from './Usuario';

// Interfaz para las propiedades requeridas
export interface ConfiguracionRecordatorioAttributes {
  id: string;
  usuario_id: string;
  tipo_evento: 'sesion_programada' | 'sesion_confirmada' | 'sesion_24h_antes' | 'sesion_1h_antes' | 'tarea_asignada' | 'tarea_vencida' | 'tarea_1semana_antes' | 'tarea_1dia_antes';
  canal_notificacion: 'email' | 'whatsapp' | 'push' | 'sms';
  activo: boolean;
  configuracion_personalizada: any; // JSON para configuraciones específicas del canal
  horario_preferido?: string; // Formato HH:MM para horarios específicos
  dias_semana?: number[]; // Array de días de la semana (0-6, domingo=0)
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Interfaz para las propiedades opcionales (para crear)
export interface ConfiguracionRecordatorioCreationAttributes
  extends Optional<ConfiguracionRecordatorioAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'configuracion_personalizada' | 'horario_preferido' | 'dias_semana'> {}

class ConfiguracionRecordatorio extends Model<ConfiguracionRecordatorioAttributes, ConfiguracionRecordatorioCreationAttributes> implements ConfiguracionRecordatorioAttributes {
  public id!: string;
  public usuario_id!: string;
  public tipo_evento!: 'sesion_programada' | 'sesion_confirmada' | 'sesion_24h_antes' | 'sesion_1h_antes' | 'tarea_asignada' | 'tarea_vencida' | 'tarea_1semana_antes' | 'tarea_1dia_antes';
  public canal_notificacion!: 'email' | 'whatsapp' | 'push' | 'sms';
  public activo!: boolean;
  public configuracion_personalizada!: any;
  public horario_preferido?: string;
  public dias_semana?: number[];
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at?: Date;

  // Relaciones
  public readonly usuario?: Usuario;
}

ConfiguracionRecordatorio.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    tipo_evento: {
      type: DataTypes.ENUM(
        'sesion_programada',
        'sesion_confirmada', 
        'sesion_24h_antes',
        'sesion_1h_antes',
        'tarea_asignada',
        'tarea_vencida',
        'tarea_1semana_antes',
        'tarea_1dia_antes'
      ),
      allowNull: false,
    },
    canal_notificacion: {
      type: DataTypes.ENUM('email', 'whatsapp', 'push', 'sms'),
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    configuracion_personalizada: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    horario_preferido: {
      type: DataTypes.STRING(5), // Formato HH:MM
      allowNull: true,
    },
    dias_semana: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
      defaultValue: [1, 2, 3, 4, 5], // Lunes a Viernes por defecto
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
    tableName: 'configuraciones_recordatorio',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

// Relaciones
ConfiguracionRecordatorio.belongsTo(Usuario, {
  foreignKey: 'usuario_id',
  as: 'usuario',
});

export default ConfiguracionRecordatorio;
