import nodemailer from 'nodemailer';
import { logger } from './logger';

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD?.replace(/\s/g, '') // Usar contraseña de aplicación de Gmail sin espacios
  },
  tls: {
    rejectUnauthorized: false
  }
});

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export const enviarEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email enviado exitosamente a ${emailData.to}`, { messageId: info.messageId });
    return true;
  } catch (error) {
    logger.error('Error al enviar email', { error, to: emailData.to });
    return false;
  }
};

export const enviarEmailRegistroPaciente = async (
  emailPaciente: string,
  nombrePaciente: string,
  emailTemporal: string,
  passwordTemporal: string,
  tokenRegistro: string
): Promise<boolean> => {
  const subject = 'Registro en Centro Terapéutico Psyche';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Centro Terapéutico Psyche</h2>
      <p>Hola <strong>${nombrePaciente}</strong>,</p>
      <p>Has sido registrado en nuestro sistema terapéutico. Para completar tu registro, necesitas seguir estos pasos:</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1f2937; margin-top: 0;">Credenciales Temporales:</h3>
        <p><strong>Email:</strong> ${emailTemporal}</p>
        <p><strong>Contraseña:</strong> ${passwordTemporal}</p>
      </div>
      
      <p>Para completar tu registro:</p>
      <ol>
        <li>Haz clic en el siguiente enlace: <a href="${process.env.FRONTEND_URL}/registro-paciente?token=${tokenRegistro}" style="color: #2563eb;">Completar Registro</a></li>
        <li>Inicia sesión con las credenciales temporales</li>
        <li>Crea tu nueva contraseña personal</li>
        <li>Completa tu información personal</li>
      </ol>
      
      <p style="color: #6b7280; font-size: 14px;">
        Este enlace expirará en 24 horas por seguridad.
      </p>
      
      <p>Saludos,<br>Equipo del Centro Terapéutico Psyche</p>
    </div>
  `;

  return await enviarEmail({
    to: emailPaciente,
    subject,
    html
  });
};

export const enviarEmailBienvenidaPsicologo = async (
  emailPsicologo: string,
  nombrePsicologo: string,
  passwordTemporal: string,
  especialidad?: string,
  avatarUrl?: string
): Promise<boolean> => {
  const subject = '¡Bienvenido al Centro Terapéutico Psyche! 🧠';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: visible; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <!-- Header con gradiente -->
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🧠 Centro Terapéutico Psyche</h1>
        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">¡Bienvenido a nuestro equipo terapéutico!</p>
      </div>
      
      <!-- Contenido principal -->
      <div style="padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background-color: #fef3c7; border-radius: 15px; border: 3px solid #f59e0b;">
          ${avatarUrl && avatarUrl.trim() !== '' ? `
            <div style="width: 200px; height: 200px; border-radius: 50%; border: 6px solid #f59e0b; overflow: hidden; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); margin: 0 auto; position: relative; background-color: #fde68a;">
              <img src="${avatarUrl}" alt="Tu avatar" style="width: 100%; height: 100%; object-fit: contain; object-position: center; display: block;">
            </div>
          ` : `
            <div style="width: 200px; height: 200px; border-radius: 50%; border: 6px solid #f59e0b; background-color: #fde68a; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);">
              <span style="font-size: 80px; color: #f59e0b;">👤</span>
            </div>
          `}
          <p style="margin-top: 15px; color: #92400e; font-weight: bold; font-size: 16px;">Tu Avatar</p>
        </div>
        <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">¡Hola ${nombrePsicologo}! 👋</h2>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Nos complace darte la bienvenida al <strong>Centro Terapéutico Psyche</strong>. 
          Has sido registrado exitosamente en nuestro sistema como profesional de la salud mental.
        </p>
        
        ${especialidad ? `
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #92400e; font-weight: 500; word-wrap: break-word; overflow-wrap: break-word;">
            <strong>Especialidad registrada:</strong> ${especialidad}
          </p>
        </div>
        ` : ''}
        
        <div style="background-color: #f3f4f6; padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #e5e7eb;">
          <h3 style="color: #1f2937; margin-top: 0; font-size: 18px;">🔐 Credenciales de Acceso</h3>
          <p style="color: #374151; margin: 10px 0; word-wrap: break-word; overflow-wrap: break-word;"><strong>Email:</strong> ${emailPsicologo}</p>
          <p style="color: #374151; margin: 10px 0; word-wrap: break-word; overflow-wrap: break-word;"><strong>Contraseña temporal:</strong> ${passwordTemporal}</p>
          <p style="color: #6b7280; font-size: 14px; margin: 15px 0 0 0; word-wrap: break-word; overflow-wrap: break-word;">
            <strong>⚠️ Importante:</strong> Por seguridad, te recomendamos cambiar esta contraseña en tu primer inicio de sesión.
          </p>
        </div>
        
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; margin: 25px 0;">
          <h3 style="color: #92400e; margin-top: 0; font-size: 18px;">🚀 Próximos Pasos</h3>
          <ol style="color: #92400e; line-height: 1.8; word-wrap: break-word; overflow-wrap: break-word;">
            <li><strong>Accede al sistema:</strong> Visita <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: #d97706; text-decoration: none; font-weight: 500;">nuestra plataforma</a></li>
            <li><strong>Inicia sesión:</strong> Usa las credenciales proporcionadas arriba</li>
            <li><strong>Cambia tu contraseña:</strong> Configura una contraseña segura y personal</li>
            <li><strong>Completa tu perfil:</strong> Añade tu foto, descripción y disponibilidad</li>
            <li><strong>Configura tu agenda:</strong> Define tus horarios de atención</li>
          </ol>
        </div>
        
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <h4 style="color: #065f46; margin-top: 0;">💡 Funcionalidades Disponibles</h4>
          <ul style="color: #065f46; line-height: 1.6; word-wrap: break-word; overflow-wrap: break-word;">
            <li>Gestión de pacientes y citas</li>
            <li>Registro de sesiones terapéuticas</li>
            <li>Sistema de tareas y seguimiento</li>
            <li>Comunicación con pacientes</li>
            <li>Reportes y estadísticas</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
             style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);">
            🚀 Acceder al Sistema
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.<br>
          <strong>Equipo del Centro Terapéutico Psyche</strong><br>
          🧠 Transformando vidas a través de la salud mental
        </p>
      </div>
    </div>
  `;

  return await enviarEmail({
    to: emailPsicologo,
    subject,
    html
  });
};