'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('politicas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM('seguridad', 'privacidad'),
        allowNull: false,
      },
      titulo: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      contenido: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Crear índices
    await queryInterface.addIndex('politicas', ['tipo'], {
      name: 'idx_politicas_tipo',
    });

    await queryInterface.addIndex('politicas', ['activo'], {
      name: 'idx_politicas_activo',
    });

    await queryInterface.addIndex('politicas', ['tipo', 'activo'], {
      name: 'idx_politicas_tipo_activo',
    });

    // Insertar políticas iniciales
    const politicaSeguridad = {
      id: Sequelize.literal('gen_random_uuid()'),
      tipo: 'seguridad',
      titulo: 'Política de Seguridad de Datos',
      contenido: JSON.stringify({
        secciones: [
          {
            titulo: '1. Compromiso con la Seguridad',
            contenido: 'En Centro Terapéutico Psyche, nos comprometemos a proteger la seguridad y confidencialidad de todos los datos personales y de salud mental que manejamos. Implementamos medidas técnicas y organizativas apropiadas para garantizar un nivel de seguridad adecuado.'
          },
          {
            titulo: '2. Medidas de Seguridad Implementadas',
            contenido: 'Encriptación de datos en tránsito y en reposo, autenticación segura mediante tokens JWT, acceso restringido a información sensible solo a personal autorizado, monitoreo continuo de sistemas y detección de amenazas, copias de seguridad regulares y planes de recuperación, actualizaciones periódicas de seguridad.'
          },
          {
            titulo: '3. Protección de Datos Sensibles',
            contenido: 'Todos los datos relacionados con tu salud mental, historial clínico, sesiones terapéuticas y comunicaciones son tratados con el máximo nivel de confidencialidad. Estos datos solo son accesibles por el personal autorizado directamente involucrado en tu tratamiento.'
          },
          {
            titulo: '4. Responsabilidades del Usuario',
            contenido: 'Como usuario, eres responsable de mantener la confidencialidad de tus credenciales de acceso. No compartas tu contraseña con terceros y notifica inmediatamente cualquier uso no autorizado de tu cuenta.'
          },
          {
            titulo: '5. Notificación de Incidentes',
            contenido: 'En caso de detectar cualquier brecha de seguridad que pueda afectar tus datos, te notificaremos de manera oportuna y tomaremos las medidas necesarias para mitigar cualquier riesgo.'
          },
          {
            titulo: '6. Base Legal y Marco Normativo',
            contenido: 'Nuestras prácticas de seguridad de datos se rigen por la normativa chilena vigente, especialmente: Ley 19.628 sobre Protección de la Vida Privada, Ley 20.584 sobre Derechos y Deberes de los Pacientes, Reglamento de Fichas Clínicas (Decreto 41/2012), Código Sanitario (DFL N° 725).'
          }
        ]
      }),
      version: 1,
      activo: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const politicaPrivacidad = {
      id: Sequelize.literal('gen_random_uuid()'),
      tipo: 'privacidad',
      titulo: 'Política de Privacidad',
      contenido: JSON.stringify({
        secciones: [
          {
            titulo: '1. Información que Recopilamos',
            contenido: 'Recopilamos información personal necesaria para brindarte servicios de salud mental de calidad, incluyendo datos de identificación, información de contacto, historial médico y psicológico, notas de sesiones terapéuticas, y cualquier otra información relevante para tu tratamiento.'
          },
          {
            titulo: '2. Uso de la Información',
            contenido: 'Utilizamos tu información personal exclusivamente para: proporcionar servicios de atención psicológica y terapéutica, gestionar citas y sesiones, mantener registros clínicos y de tratamiento, comunicarnos contigo sobre tu tratamiento, cumplir con obligaciones legales y regulatorias establecidas en la Ley 19.628, la Ley 20.584, el Reglamento de Fichas Clínicas y el Código Sanitario (DFL N° 725).'
          },
          {
            titulo: '3. Confidencialidad y Secreto Profesional',
            contenido: 'Todos los profesionales de salud mental adheridos a nuestro centro están sujetos al secreto profesional, establecido en el Código de Ética Profesional del Colegio de Psicólogos de Chile y protegido por el Código Sanitario (DFL N° 725) y la Ley 20.584. Tu información no será compartida con terceros sin tu consentimiento explícito, excepto en los casos legalmente requeridos (como orden judicial o autorización expresa) o cuando sea necesario para proteger tu seguridad o la de otros.'
          },
          {
            titulo: '4. Compartir Información',
            contenido: 'No vendemos, alquilamos ni compartimos tu información personal con terceros para fines comerciales. Solo compartimos información cuando es necesario para tu tratamiento, con tu consentimiento, o cuando la ley lo requiere.'
          },
          {
            titulo: '5. Tus Derechos',
            contenido: 'Tienes derecho a acceder, rectificar, eliminar o limitar el tratamiento de tus datos personales. También puedes solicitar una copia de tu información o retirar tu consentimiento en cualquier momento, sujeto a las limitaciones legales aplicables.'
          },
          {
            titulo: '6. Retención de Datos',
            contenido: 'Conservamos tu información personal durante el tiempo necesario para cumplir con los fines para los que fue recopilada. Conforme al Reglamento de Fichas Clínicas (Decreto 41/2012), mantenemos un plazo mínimo de conservación de 15 años desde el último ingreso de información en tu ficha clínica. Este reglamento también exige acceso controlado y registro de quién accede a la ficha, lo cual implementamos mediante nuestro sistema de auditoría y logs de acceso.'
          },
          {
            titulo: '7. Base Legal y Marco Normativo',
            contenido: 'Esta política de privacidad se rige por la normativa chilena vigente: Ley 19.628 sobre Protección de la Vida Privada, Ley 20.584 sobre Derechos y Deberes de los Pacientes, Reglamento de Fichas Clínicas (Decreto 41/2012), Código Sanitario (DFL N° 725), Código de Ética Profesional del Colegio de Psicólogos de Chile.'
          }
        ]
      }),
      version: 1,
      activo: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await queryInterface.bulkInsert('politicas', [politicaSeguridad, politicaPrivacidad]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('politicas');
  }
};
