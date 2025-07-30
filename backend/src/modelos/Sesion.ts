import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';
import Paciente from './Paciente';
import Usuario from './Usuario';

// Interfaz para las propiedades requeridas
export interface SesionAttributes {
  id: string;
  paciente_id: string;
  psicologo_id: string;
  fecha_programada: Date;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  duracion_minutos?: number;
  tipo_sesion: 'presencial' | 'virtual' | 'telefonica';
  estado: 'programada' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada' | 'no_asistio';
  notas_evolucion?: string;
  objetivos_sesion: any[];
  tecnicas_utilizadas: any[];
  evaluacion_paciente?: any;
  observaciones?: string;
  archivos_adjuntos: any[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Interfaz para las propiedades opcionales (para crear)
export interface SesionCreationAttributes extends Optional<SesionAttributes, 'id' | 'tipo_sesion' | 'estado' | 'objetivos_sesion' | 'tecnicas_utilizadas' | 'archivos_adjuntos' | 'created_at' | 'updated_at'> {}

class Sesion extends Model<SesionAttributes, SesionCreationAttributes> implements SesionAttributes {
  public id!: string;
  public paciente_id!: string;
  public psicologo_id!: string;
  public fecha_programada!: Date;
  public fecha_inicio?: Date;
  public fecha_fin?: Date;
  public duracion_minutos?: number;
  public tipo_sesion!: 'presencial' | 'virtual' | 'telefonica';
  public estado!: 'programada' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada' | 'no_asistio';
  public notas_evolucion?: string;
  public objetivos_sesion!: any[];
  public tecnicas_utilizadas!: any[];
  public evaluacion_paciente?: any;
  public observaciones?: string;
  public archivos_adjuntos!: any[];
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // Asociaciones
  public readonly paciente?: Paciente;
  public readonly psicologo?: Usuario;
}

Sesion.init(
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
    fecha_programada: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    duracion_minutos: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tipo_sesion: {
      type: DataTypes.ENUM('presencial', 'virtual', 'telefonica'),
      allowNull: false,
      defaultValue: 'presencial',
    },
    estado: {
      type: DataTypes.ENUM('programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio'),
      allowNull: false,
      defaultValue: 'programada',
    },
    notas_evolucion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    objetivos_sesion: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    tecnicas_utilizadas: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    evaluacion_paciente: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    archivos_adjuntos: {
      type: DataTypes.JSONB,
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
    tableName: 'sesiones',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
  }
);

export default Sesion; 