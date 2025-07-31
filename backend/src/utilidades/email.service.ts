import nodemailer from 'nodemailer';
import { logger } from './logger';

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
  service: 'gmail', // Puedes cambiar a otro servicio
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Usar contraseña de aplicación de Gmail
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