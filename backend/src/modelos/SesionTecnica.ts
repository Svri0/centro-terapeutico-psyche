import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

export interface SesionTecnicaAttributes {
  id: string;
  sesion_id: string;
  tecnica_id: string;
  notas_aplicacion?: string;
  created_at: Date;
}

export interface SesionTecnicaCreationAttributes
  extends Optional<SesionTecnicaAttributes, 'id' | 'notas_aplicacion' | 'created_at'> {}

class SesionTecnica
  extends Model<SesionTecnicaAttributes, SesionTecnicaCreationAttributes>
  implements SesionTecnicaAttributes {
  public id!: string;
  public sesion_id!: string;
  public tecnica_id!: string;
  public notas_aplicacion?: string;
  public readonly created_at!: Date;

  // Timestamps
  public readonly createdAt!: Date;
}

SesionTecnica.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sesion_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sesiones',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    tecnica_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tecnicas_terapeuticas',
        key: 'id',
      },
    },
    notas_aplicacion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'sesion_tecnicas',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['sesion_id', 'tecnica_id'],
        unique: true,
        name: 'uk_sesion_tecnicas_sesion_tecnica',
      },
      {
        fields: ['sesion_id'],
        name: 'idx_sesion_tecnicas_sesion',
      },
      {
        fields: ['tecnica_id'],
        name: 'idx_sesion_tecnicas_tecnica',
      },
    ],
  }
);

export default SesionTecnica;

