import { Model, DataTypes } from 'sequelize';
import sequelize from '../configuracion/database';

interface CitaAttributes {
  id: string;
  paciente_id: string;
  psicologo_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  estado: 'programada' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada' | 'no_show';
  tipo_sesion: 'individual' | 'grupal' | 'familiar' | 'evaluacion' | 'seguimiento';
  modalidad: 'presencial' | 'virtual' | 'telefonica';
  notas_paciente?: string;
  notas_psicologo?: string;
  recordatorio_enviado: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface CitaCreationAttributes extends Omit<CitaAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Cita extends Model<CitaAttributes, CitaCreationAttributes> {
  public id!: string;
  public paciente_id!: string;
  public psicologo_id!: string;
  public fecha!: string;
  public hora_inicio!: string;
  public hora_fin!: string;
  public duracion_minutos!: number;
  public estado!: 'programada' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada' | 'no_show';
  public tipo_sesion!: 'individual' | 'grupal' | 'familiar' | 'evaluacion' | 'seguimiento';
  public modalidad!: 'presencial' | 'virtual' | 'telefonica';
  public notas_paciente?: string;
  public notas_psicologo?: string;
  public recordatorio_enviado!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Cita.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    paciente_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'pacientes',
        key: 'id',
      },
    },
    psicologo_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hora_inicio: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    hora_fin: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    duracion_minutos: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
    },
    estado: {
      type: DataTypes.ENUM('programada', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'no_show'),
      defaultValue: 'programada',
    },
    tipo_sesion: {
      type: DataTypes.ENUM('individual', 'grupal', 'familiar', 'evaluacion', 'seguimiento'),
      defaultValue: 'individual',
    },
    modalidad: {
      type: DataTypes.ENUM('presencial', 'virtual', 'telefonica'),
      defaultValue: 'presencial',
    },
    notas_paciente: {
      type: DataTypes.TEXT,
    },
    notas_psicologo: {
      type: DataTypes.TEXT,
    },
    recordatorio_enviado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'citas',
    timestamps: true,
    underscored: true,
  }
);

export default Cita; 