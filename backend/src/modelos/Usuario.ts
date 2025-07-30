import bcrypt from 'bcryptjs';
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../configuracion/database';

// Interfaz para las propiedades requeridas
interface UsuarioAttributes {
  id: number;
  nombre: string;
  apellidos?: string;
  email: string;
  password: string;
  rol: 'admin' | 'psicologo' | 'paciente' | 'recepcionista';
  telefono?: string;
  especialidad?: string;
  añosExperiencia?: number;
  fechaNacimiento?: Date;
  direccion?: string;
  activo: boolean;
  ultimoAcceso?: Date;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

// Interfaz para las propiedades opcionales
interface UsuarioCreationAttributes
  extends Optional<UsuarioAttributes, 'id' | 'activo' | 'fechaCreacion' | 'fechaActualizacion'> {}

class Usuario
  extends Model<UsuarioAttributes, UsuarioCreationAttributes>
  implements UsuarioAttributes
{
  public id!: number;
  public nombre!: string;
  public apellidos?: string;
  public email!: string;
  public password!: string;
  public rol!: 'admin' | 'psicologo' | 'paciente' | 'recepcionista';
  public telefono?: string;
  public especialidad?: string;
  public añosExperiencia?: number;
  public fechaNacimiento?: Date;
  public direccion?: string;
  public activo!: boolean;
  public ultimoAcceso?: Date;
  public fechaCreacion!: Date;
  public fechaActualizacion!: Date;

  // Método para comparar contraseñas
  public async compararPassword(passwordCandidata: string): Promise<boolean> {
    return bcrypt.compare(passwordCandidata, this.password);
  }

  // Método para hashear contraseña
  public async hashearPassword(): Promise<void> {
    if (this.changed('password')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  // Método para actualizar último acceso
  public async actualizarUltimoAcceso(): Promise<void> {
    this.ultimoAcceso = new Date();
    await this.save();
  }

  // Método para obtener datos públicos (sin password)
  public toJSON(): any {
    const values = Object.assign({}, this.get());
    if ('password' in values) {
      delete (values as any).password;
    }
    return values;
  }
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'nombres', // Mapear a la columna nombres de la BD
      validate: {
        len: [2, 100],
        notEmpty: true
      }
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'apellidos', // Mapear a la columna apellidos de la BD
      validate: {
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash', // Mapear a la columna password_hash de la BD
      validate: {
        len: [6, 255],
        notEmpty: true
      }
    },
    rol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'rol_id', // Mapear a la columna rol_id de la BD
      defaultValue: 1 // 1 = paciente por defecto
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    especialidad: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    añosExperiencia: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 50
      }
    },
    fechaNacimiento: {
      type: DataTypes.DATE,
      allowNull: true
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    ultimoAcceso: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    fechaActualizacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'fechaCreacion',
    updatedAt: 'fechaActualizacion',
    hooks: {
      beforeSave: async (usuario: Usuario) => {
        await usuario.hashearPassword();
      }
    }
  }
);

export default Usuario;
