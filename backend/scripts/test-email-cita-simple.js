require('dotenv').config();

// Importar nodemailer directamente
const nodemailer = require('nodemailer');

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD?.replace(/\s/g, '')
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Función para enviar email de confirmación de cita
async function enviarEmailConfirmacionCita(
  emailPaciente,
  nombrePaciente,
  nombrePsicologo,
  fecha,
  hora,
  tipoSesion,
  modalidad,
  citaId
) {
  const subject = '✅ Cita Confirmada - Centro Terapéutico Psyche';
  
  // Formatear fecha y hora
  const fechaFormateada = new Date(fecha).toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: visible; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <!-- Header con gradiente -->
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🧠 Centro Terapéutico Psyche</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tu cita ha sido confirmada exitosamente</p>
      </div>
      
      <!-- Contenido principal -->
      <div style="padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background-color: #d1fae5; border-radius: 15px; border: 3px solid #10b981;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #10b981; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
            <span style="font-size: 40px; color: #ffffff;">✅</span>
          </div>
          <p style="margin-top: 15px; color: #065f46; font-weight: bold; font-size: 18px;">Cita Confirmada</p>
        </div>
        
        <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">¡Hola ${nombrePaciente}!</h2>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Tu cita de terapia ha sido <strong>confirmada exitosamente</strong> en el Centro Terapéutico Psyche.
        </p>
        
        <div style="background-color: #f3f4f6; padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #e5e7eb;">
          <h3 style="color: #1f2937; margin-top: 0; font-size: 18px;">📅 Detalles de tu Cita</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
            <div>
              <p style="color: #374151; margin: 5px 0; font-weight: 500;"><strong>👨‍⚕️ Psicólogo:</strong></p>
              <p style="color: #6b7280; margin: 5px 0;">${nombrePsicologo}</p>
            </div>
            <div>
              <p style="color: #374151; margin: 5px 0; font-weight: 500;"><strong>📅 Fecha:</strong></p>
              <p style="color: #6b7280; margin: 5px 0;">${fechaFormateada}</p>
            </div>
            <div>
              <p style="color: #374151; margin: 5px 0; font-weight: 500;"><strong>🕐 Hora:</strong></p>
              <p style="color: #6b7280; margin: 5px 0;">${hora}</p>
            </div>
            <div>
              <p style="color: #374151; margin: 5px 0; font-weight: 500;"><strong>🎯 Tipo:</strong></p>
              <p style="color: #6b7280; margin: 5px 0;">${tipoSesion}</p>
            </div>
            <div>
              <p style="color: #374151; margin: 5px 0; font-weight: 500;"><strong>💻 Modalidad:</strong></p>
              <p style="color: #6b7280; margin: 5px 0;">${modalidad}</p>
            </div>
          </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 25px; border-radius: 12px; margin: 25px 0;">
          <h3 style="color: #065f46; margin-top: 0; font-size: 18px;">🚀 Próximos Pasos</h3>
          <ol style="color: #065f46; line-height: 1.8;">
            <li><strong>Prepara tu sesión:</strong> Ten listos los temas que quieres tratar</li>
            <li><strong>Llega 10 minutos antes:</strong> Para completar cualquier documentación</li>
            <li><strong>Trae tu identificación:</strong> Para verificar tu identidad</li>
            ${modalidad === 'virtual' ? '<li><strong>Prueba tu conexión:</strong> Verifica que tu cámara y micrófono funcionen</li>' : ''}
          </ol>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
          <h3 style="color: #92400e; margin-top: 0; font-size: 18px;">⚠️ ¿No solicitaste esta cita?</h3>
          <p style="color: #92400e; margin: 10px 0; line-height: 1.6;">
            Si no solicitaste esta cita o necesitas cancelarla, puedes hacerlo desde tu perfil en el sistema.
          </p>
          <div style="margin-top: 15px;">
            <a href="${process.env.FRONTEND_URL}/perfil-paciente" style="display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; transition: background-color 0.3s;">
              🚫 Cancelar Cita
            </a>
          </div>
        </div>
        
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
          <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">📱 Acceso desde tu Dispositivo</h3>
          <p style="color: #1e40af; margin: 10px 0; line-height: 1.6;">
            Puedes acceder a tu perfil y gestionar tus citas desde cualquier dispositivo ingresando a:
          </p>
          <div style="margin-top: 15px;">
            <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; transition: background-color 0.3s;">
              🔐 Acceder al Sistema
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            <strong>ID de Cita:</strong> ${citaId}<br>
            <strong>Centro Terapéutico Psyche</strong><br>
            📧 info@psyche.cl | 📱 +56 9 1234 5678
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailPaciente,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email enviado exitosamente a ${emailPaciente}`, { messageId: info.messageId });
    return true;
  } catch (error) {
    console.error('Error al enviar email', { error, to: emailPaciente });
    return false;
  }
}

async function testEmailCita() {
  console.log('🧪 Probando email de confirmación de cita...\n');
  
  try {
    // Datos de prueba
    const emailPaciente = 'paciente.test@psyche.cl';
    const nombrePaciente = 'María González';
    const nombrePsicologo = 'Dr. Carlos Rodríguez';
    const fecha = '2024-12-15';
    const hora = '14:00';
    const tipoSesion = 'individual';
    const modalidad = 'presencial';
    const citaId = 'test-cita-123';
    
    console.log('📧 Enviando email de confirmación de cita...');
    console.log('   - Paciente:', nombrePaciente);
    console.log('   - Psicólogo:', nombrePsicologo);
    console.log('   - Fecha:', fecha);
    console.log('   - Hora:', hora);
    console.log('   - Email destino:', emailPaciente);
    
    const resultado = await enviarEmailConfirmacionCita(
      emailPaciente,
      nombrePaciente,
      nombrePsicologo,
      fecha,
      hora,
      tipoSesion,
      modalidad,
      citaId
    );
    
    if (resultado) {
      console.log('\n✅ Email enviado exitosamente!');
      console.log('📱 El paciente puede acceder desde su dispositivo móvil');
      console.log('🔗 Enlace del perfil:', `${process.env.FRONTEND_URL}/perfil-paciente`);
    } else {
      console.log('\n❌ Error al enviar el email');
    }
    
  } catch (error) {
    console.error('\n💥 Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar la prueba
testEmailCita();
