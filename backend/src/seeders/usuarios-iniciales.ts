import { Usuario } from '../modelos';
import { log } from '../utilidades/logger';

/**
 * Seeder para crear usuarios iniciales del sistema
 */
export const crearUsuariosIniciales = async (): Promise<void> => {
  try {
    log.info('🌱 Iniciando seeder de usuarios iniciales...');

    // Verificar si ya existen usuarios
    const usuariosExistentes = await Usuario.count();
    if (usuariosExistentes > 0) {
      log.info('✅ Ya existen usuarios en la base de datos, saltando seeder...');
      return;
    }

    // Usuarios de prueba
    const usuariosIniciales = [
      {
        nombre: 'Dr. Juan Pérez',
        email: 'juan.perez@psyche.cl',
        password: 'password123',
        rol: 'psicologo' as const,
        telefono: '+56912345678',
        especialidad: 'Psicología Clínica',
        añosExperiencia: 5,
        activo: true
      },
      {
        nombre: 'Dra. María González',
        email: 'maria.gonzalez@psyche.cl',
        password: 'password123',
        rol: 'psicologo' as const,
        telefono: '+56987654321',
        especialidad: 'Psicología Infantil',
        añosExperiencia: 8,
        activo: true
      },
      {
        nombre: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@psyche.cl',
        password: 'password123',
        rol: 'paciente' as const,
        telefono: '+56911223344',
        activo: true
      },
      {
        nombre: 'Ana Silva',
        email: 'ana.silva@psyche.cl',
        password: 'password123',
        rol: 'paciente' as const,
        telefono: '+56955667788',
        activo: true
      },
      {
        nombre: 'Pedro López',
        email: 'pedro.lopez@psyche.cl',
        password: 'password123',
        rol: 'recepcionista' as const,
        telefono: '+56999887766',
        activo: true
      },
      {
        nombre: 'Administrador Sistema',
        email: 'admin@psyche.cl',
        password: 'admin123',
        rol: 'admin' as const,
        telefono: '+56900000000',
        activo: true
      }
    ];

    // Crear usuarios
    for (const datosUsuario of usuariosIniciales) {
      await Usuario.create(datosUsuario);
      log.info(`✅ Usuario creado: ${datosUsuario.email} (${datosUsuario.rol})`);
    }

    log.info(`🎉 Seeder completado: ${usuariosIniciales.length} usuarios creados`);
  } catch (error) {
    log.error('❌ Error en seeder de usuarios:', error);
    throw error;
  }
};

/**
 * Función para ejecutar el seeder
 */
export const ejecutarSeeder = async (): Promise<void> => {
  try {
    await crearUsuariosIniciales();
  } catch (error) {
    log.error('❌ Error ejecutando seeder:', error);
    process.exit(1);
  }
};

// Ejecutar seeder si se llama directamente
if (require.main === module) {
  ejecutarSeeder();
}
