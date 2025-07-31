import { Model, DataTypes } from 'sequelize';
import sequelize from '../configuracion/database';

interface DisponibilidadPsicologoAttributes {
  id: string;
  psicologo_id: string;
  dia_semana: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface DisponibilidadPsicologoCreationAttributes extends Omit<DisponibilidadPsicologoAttributes, 'id' | 'created_at' | 'updated_at'> {}

class DisponibilidadPsicologo extends Model<DisponibilidadPsicologoAttributes, DisponibilidadPsicologoCreationAttributes> {
  public id!: string;
  public psicologo_id!: string;
  public dia_semana!: number;
  public hora_inicio!: string;
  public hora_fin!: string;
  public activo!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

DisponibilidadPsicologo.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    psicologo_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    dia_semana: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 6,
      },
    },
    hora_inicio: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    hora_fin: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'disponibilidad_psicologos',
    timestamps: true,
    underscored: true,
  }
);

export default DisponibilidadPsicologo; 