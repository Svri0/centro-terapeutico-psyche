import { Model, DataTypes } from 'sequelize';
import sequelize from '../configuracion/database';

interface DisponibilidadSemanalAttributes {
  id?: string;
  psicologo_id: string;
  semana_inicio: string;
  semana_fin: string;
  lunes_horarios?: any[];
  martes_horarios?: any[];
  miercoles_horarios?: any[];
  jueves_horarios?: any[];
  viernes_horarios?: any[];
  sabado_horarios?: any[];
  domingo_horarios?: any[];
  total_horas_semana?: number;
  feriados?: any[];
  dias_vacaciones?: any[];
  estado?: 'borrador' | 'confirmada' | 'activa';
  created_at?: Date;
  updated_at?: Date;
}

class DisponibilidadSemanal extends Model<DisponibilidadSemanalAttributes> implements DisponibilidadSemanalAttributes {
  public id!: string;
  public psicologo_id!: string;
  public semana_inicio!: string;
  public semana_fin!: string;
  public lunes_horarios?: any[];
  public martes_horarios?: any[];
  public miercoles_horarios?: any[];
  public jueves_horarios?: any[];
  public viernes_horarios?: any[];
  public sabado_horarios?: any[];
  public domingo_horarios?: any[];
  public total_horas_semana!: number;
  public feriados?: any[];
  public dias_vacaciones?: any[];
  public estado!: 'borrador' | 'confirmada' | 'activa';
  public created_at!: Date;
  public updated_at!: Date;

  // Método para calcular horas totales
  public calcularHorasTotales(): number {
    let total = 0;
    const dias = ['lunes_horarios', 'martes_horarios', 'miercoles_horarios', 'jueves_horarios', 'viernes_horarios', 'sabado_horarios', 'domingo_horarios'];
    
    dias.forEach(dia => {
      const horarios = this.getDataValue(dia as keyof DisponibilidadSemanalAttributes) as any[];
      if (horarios) {
        horarios.forEach(horario => {
          if (horario.activo && horario.hora_inicio && horario.hora_fin) {
            const inicio = new Date(`2000-01-01T${horario.hora_inicio}`);
            const fin = new Date(`2000-01-01T${horario.hora_fin}`);
            const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
            total += horas;
          }
        });
      }
    });
    
    return Math.round(total);
  }

  // Método para validar límite de 40 horas
  public validarLimiteHoras(): boolean {
    return this.calcularHorasTotales() <= 40;
  }
}

DisponibilidadSemanal.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    psicologo_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    semana_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    semana_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    lunes_horarios: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    martes_horarios: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    miercoles_horarios: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    jueves_horarios: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    viernes_horarios: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    sabado_horarios: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    domingo_horarios: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    total_horas_semana: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    feriados: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    dias_vacaciones: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('borrador', 'confirmada', 'activa'),
      allowNull: false,
      defaultValue: 'borrador'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'disponibilidad_semanal',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false, // Deshabilitar soft deletes
    hooks: {
      beforeSave: (instance: DisponibilidadSemanal) => {
        // Calcular horas totales antes de guardar
        instance.total_horas_semana = instance.calcularHorasTotales();
      }
    }
  }
);

export default DisponibilidadSemanal; 