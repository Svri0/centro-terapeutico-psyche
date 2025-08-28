import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

// Interfaz para las propiedades requeridas
export interface PacienteAttributes {
  id: string;
  usuario_id: string;
  psicologo_id: string;
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: Date;
  genero?: 'masculino' | 'femenino' | 'no_binario' | 'prefiero_no_decir';
  numero_ficha: string;
  rut?: string;
  direccion?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  diagnosticos: any[];
  etiquetas: any[];
  estrategias_autorregulacion: any[];
  puntos_acumulados: number;
  estado: 'activo' | 'inactivo' | 'alta' | 'derivado';
  fecha_ingreso: Date;
  fecha_alta?: Date;
  observaciones?: string;
  antecedentes_medicos: any[];
  medicacion_actual: any[];
  alergias: any[];
  condiciones_cronicas: any[];
  historial_psiquiatrico: any[];
  observaciones_medicas?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Interfaz para las propiedades opcionales (para crear)
export interface PacienteCreationAttributes extends Optional<PacienteAttributes, 'id' | 'diagnosticos' | 'etiquetas' | 'estrategias_autorregulacion' | 'puntos_acumulados' | 'estado' | 'fecha_ingreso' | 'created_at' | 'updated_at'> {}

class Paciente extends Model<PacienteAttributes, PacienteCreationAttributes> implements PacienteAttributes {
  public id!: string;
  public usuario_id!: string;
  public psicologo_id!: string;
  public nombres?: string;
  public apellidos?: string;
  public email?: string;
  public telefono?: string;
  public fecha_nacimiento?: Date;
  public genero?: 'masculino' | 'femenino' | 'no_binario' | 'prefiero_no_decir';
  public numero_ficha!: string;
  public rut?: string;
  public direccion?: string;
  public contacto_emergencia_nombre?: string;
  public contacto_emergencia_telefono?: string;
  public contacto_emergencia_relacion?: string;
  public diagnosticos!: any[];
  public etiquetas!: any[];
  public estrategias_autorregulacion!: any[];
  public puntos_acumulados!: number;
  public estado!: 'activo' | 'inactivo' | 'alta' | 'derivado';
  public fecha_ingreso!: Date;
  public fecha_alta?: Date;
  public observaciones?: string;
  public antecedentes_medicos!: any[];
  public medicacion_actual!: any[];
  public alergias!: any[];
  public condiciones_cronicas!: any[];
  public historial_psiquiatrico!: any[];
  public observaciones_medicas?: string;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

Paciente.init(
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
    psicologo_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    nombres: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    genero: {
      type: DataTypes.ENUM('masculino', 'femenino', 'no_binario', 'prefiero_no_decir'),
      allowNull: true,
    },
    numero_ficha: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    rut: {
      type: DataTypes.STRING(12),
      allowNull: true,
      unique: true,
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contacto_emergencia_nombre: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    contacto_emergencia_telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    contacto_emergencia_relacion: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    diagnosticos: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    etiquetas: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    estrategias_autorregulacion: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    puntos_acumulados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo', 'alta', 'derivado'),
      allowNull: false,
      defaultValue: 'activo',
    },
    fecha_ingreso: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    fecha_alta: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    antecedentes_medicos: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    medicacion_actual: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    alergias: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    condiciones_cronicas: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    historial_psiquiatrico: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    observaciones_medicas: {
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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'pacientes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
  }
);

export default Paciente; 