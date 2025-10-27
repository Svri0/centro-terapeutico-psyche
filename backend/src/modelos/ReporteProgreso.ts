import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';
import Paciente from './Paciente';
import Usuario from './Usuario';

// Interfaz para las propiedades requeridas
export interface ReporteProgresoAttributes {
  id: string;
  paciente_id: string;
  psicologo_id: string;
  sesion_id?: string;
  fecha_reporte: Date;
  periodo_inicio: Date;
  periodo_fin: Date;
  resumen_evolucion: string;
  objetivos_cumplidos: any[];
  objetivos_pendientes: any[];
  areas_trabajadas: any[];
  conductas_observadas: any[];
  logros_importantes: any[];
  desafios_identificados: any[];
  sugerencias_terapeuticas: string;
  progreso_general: 'excelente' | 'muy_bueno' | 'bueno' | 'regular' | 'necesita_atencion';
  metrica_satisfaccion?: number;
  observaciones_adicionales?: string;
  documento_adjunto?: string;
  estado: 'borrador' | 'completado' | 'archivado';
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// Interfaz para las propiedades opcionales (para crear)
export interface ReporteProgresoCreationAttributes extends Optional<ReporteProgresoAttributes, 
  'id' | 'sesion_id' | 'objetivos_cumplidos' | 'objetivos_pendientes' | 'areas_trabajadas' | 
  'conductas_observadas' | 'logros_importantes' | 'desafios_identificados' | 
  'documento_adjunto' | 'estado' | 'created_at' | 'updated_at'> {}

class ReporteProgreso extends Model<ReporteProgresoAttributes, ReporteProgresoCreationAttributes> 
  implements ReporteProgresoAttributes {
  public id!: string;
  public paciente_id!: string;
  public psicologo_id!: string;
  public sesion_id?: string;
  public fecha_reporte!: Date;
  public periodo_inicio!: Date;
  public periodo_fin!: Date;
  public resumen_evolucion!: string;
  public objetivos_cumplidos!: any[];
  public objetivos_pendientes!: any[];
  public areas_trabajadas!: any[];
  public conductas_observadas!: any[];
  public logros_importantes!: any[];
  public desafios_identificados!: any[];
  public sugerencias_terapeuticas!: string;
  public progreso_general!: 'excelente' | 'muy_bueno' | 'bueno' | 'regular' | 'necesita_atencion';
  public metrica_satisfaccion?: number;
  public observaciones_adicionales?: string;
  public documento_adjunto?: string;
  public estado!: 'borrador' | 'completado' | 'archivado';
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

ReporteProgreso.init(
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
    sesion_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'sesiones',
        key: 'id',
      },
    },
    fecha_reporte: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    periodo_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    periodo_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    resumen_evolucion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    objetivos_cumplidos: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    objetivos_pendientes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    areas_trabajadas: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    conductas_observadas: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    logros_importantes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    desafios_identificados: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    sugerencias_terapeuticas: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    progreso_general: {
      type: DataTypes.ENUM('excelente', 'muy_bueno', 'bueno', 'regular', 'necesita_atencion'),
      allowNull: false,
    },
    metrica_satisfaccion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 10,
      },
    },
    observaciones_adicionales: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    documento_adjunto: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM('borrador', 'completado', 'archivado'),
      allowNull: false,
      defaultValue: 'borrador',
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
    tableName: 'reportes_progreso',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
  }
);

export default ReporteProgreso;

