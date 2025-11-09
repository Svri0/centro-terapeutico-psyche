import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

export interface ContactoEmergenciaAttributes {
  id: string;
  paciente_id: string;
  nombre: string;
  telefono?: string;
  relacion?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface ContactoEmergenciaCreationAttributes
  extends Optional<ContactoEmergenciaAttributes, 'id' | 'telefono' | 'relacion' | 'created_at' | 'updated_at'> {}

class ContactoEmergencia
  extends Model<ContactoEmergenciaAttributes, ContactoEmergenciaCreationAttributes>
  implements ContactoEmergenciaAttributes {
  public id!: string;
  public paciente_id!: string;
  public nombre!: string;
  public telefono?: string;
  public relacion?: string;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;
}

ContactoEmergencia.init(
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
      onDelete: 'CASCADE',
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    relacion: {
      type: DataTypes.STRING(50),
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
    tableName: 'contactos_emergencia',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true,
    indexes: [
      {
        fields: ['paciente_id'],
        name: 'idx_contactos_emergencia_paciente',
      },
    ],
  }
);

export default ContactoEmergencia;


