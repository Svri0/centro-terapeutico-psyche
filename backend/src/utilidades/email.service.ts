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
            <li>Gestión de pacientes y sesiones</li>
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

export const enviarEmailConfirmacionCita = async (
  emailPaciente: string,
  nombrePaciente: string,
  nombrePsicologo: string,
  fecha: string,
  hora: string,
  tipoSesion: string,
  modalidad: string,
  citaId: string
): Promise<boolean> => {
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
          <h3 style="color: #92400e; margin-top: 0; font-size: 18px;">⚠️ ¿No solicitaste esta sesión?</h3>
          <p style="color: #92400e; margin: 10px 0; line-height: 1.6;">
            Si no solicitaste esta sesión o necesitas cancelarla, puedes hacerlo desde tu perfil en el sistema.
          </p>
          <div style="margin-top: 15px;">
            <a href="${process.env.FRONTEND_URL}/perfil-paciente" style="display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; transition: background-color 0.3s;">
              🚫 Cancelar Sesión
            </a>
          </div>
        </div>
        
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
          <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">📱 Acceso desde tu Dispositivo</h3>
          <p style="color: #1e40af; margin: 10px 0; line-height: 1.6;">
            Puedes acceder a tu perfil y gestionar tus sesiones desde cualquier dispositivo ingresando a:
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

  return await enviarEmail({
    to: emailPaciente,
    subject,
    html
  });
};

// Enviar email de notificación de cancelación de cita al psicólogo
export const enviarEmailCancelacionCitaPsicologo = async (
  emailPsicologo: string,
  nombrePsicologo: string,
  nombrePaciente: string,
  fecha: string,
  hora: string,
  tipoSesion: string,
  modalidad: string
): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_APP_NAME || 'Dentro de Psyché'}" <${process.env.EMAIL_USER}>`,
      to: emailPsicologo,
      subject: '🚫 Cita Cancelada - Notificación Importante',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e74c3c; margin: 0; font-size: 28px;">🚫 Cita Cancelada</h1>
              <p style="color: #7f8c8d; margin: 10px 0 0 0; font-size: 16px;">Notificación Importante</p>
            </div>
            
            <div style="background-color: #fff5f5; border-left: 4px solid #e74c3c; padding: 20px; margin-bottom: 25px;">
              <h2 style="color: #c0392b; margin: 0 0 15px 0; font-size: 20px;">Hola ${nombrePsicologo},</h2>
              <p style="color: #2c3e50; margin: 0; line-height: 1.6; font-size: 16px;">
                Te informamos que una cita ha sido cancelada por el paciente.
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #34495e; margin: 0 0 15px 0; font-size: 18px;">📅 Detalles de la Cita Cancelada:</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <p style="margin: 8px 0; color: #2c3e50;"><strong>👤 Paciente:</strong> ${nombrePaciente}</p>
                  <p style="margin: 8px 0; color: #2c3e50;"><strong>📅 Fecha:</strong> ${fecha}</p>
                </div>
                <div>
                  <p style="margin: 8px 0; color: #2c3e50;"><strong>🕐 Hora:</strong> ${hora}</p>
                  <p style="margin: 8px 0; color: #2c3e50;"><strong>🏥 Tipo:</strong> ${tipoSesion}</p>
                </div>
              </div>
              <p style="margin: 8px 0; color: #2c3e50;"><strong>📍 Modalidad:</strong> ${modalidad}</p>
            </div>
            
            <div style="background-color: #e8f5e8; border-left: 4px solid #27ae60; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #27ae60; margin: 0 0 15px 0; font-size: 18px;">💡 Acciones Recomendadas:</h3>
              <ul style="color: #2c3e50; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Actualiza tu agenda para liberar ese horario</li>
                <li>Considera ofrecer el horario a otros pacientes en lista de espera</li>
                <li>Revisa si hay pacientes que necesiten reprogramación</li>
                <li>Contacta al paciente si necesitas más información sobre la cancelación</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
                Este es un mensaje automático del sistema de gestión de sesiones.
              </p>
              <p style="color: #7f8c8d; margin: 5px 0 0 0; font-size: 14px;">
                Si tienes alguna pregunta, contacta al administrador del sistema.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #95a5a6; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} ${process.env.EMAIL_APP_NAME || 'Dentro de Psyché'}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`✅ Email de cancelación enviado exitosamente a: ${emailPsicologo}`, { messageId: info.messageId });
    return true;
  } catch (error) {
    logger.error('❌ Error al enviar email de cancelación:', error);
    return false;
  }
};

// Interfaz para las tareas pendientes en el recordatorio
export interface TareaPendiente {
  id: string;
  titulo: string;
  instrucciones?: string;
  fecha_vencimiento?: Date | string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  puntos_asignados: number;
}

// Enviar email de recordatorio de tareas pendientes a paciente
export const enviarEmailRecordatorioTareas = async (
  emailPaciente: string,
  nombrePaciente: string,
  tareasPendientes: TareaPendiente[]
): Promise<boolean> => {
  try {
    if (!emailPaciente || !nombrePaciente || !tareasPendientes || tareasPendientes.length === 0) {
      logger.warn('No se puede enviar recordatorio: datos incompletos', {
        emailPaciente,
        nombrePaciente,
        tareasCount: tareasPendientes?.length || 0
      });
      return false;
    }

    const subject = '📋 Recordatorio de Tareas Pendientes - Centro Terapéutico Psyche';

    // Formatear fecha límite
    const formatearFecha = (fecha?: Date | string): string => {
      if (!fecha) return 'Sin fecha límite';
      const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
      return fechaObj.toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Calcular días restantes
    const calcularDiasRestantes = (fecha?: Date | string): string => {
      if (!fecha) return '';
      const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
      const ahora = new Date();
      const diffTime = fechaObj.getTime() - ahora.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return `<span style="color: #ef4444; font-weight: bold;">⚠️ Vencida (${Math.abs(diffDays)} día(s) de retraso)</span>`;
      } else if (diffDays === 0) {
        return '<span style="color: #f59e0b; font-weight: bold;">⚠️ Vence hoy</span>';
      } else if (diffDays === 1) {
        return '<span style="color: #f59e0b; font-weight: bold;">⚠️ Vence mañana</span>';
      } else if (diffDays <= 3) {
        return `<span style="color: #f59e0b; font-weight: bold;">⚠️ Vence en ${diffDays} días</span>`;
      } else {
        return `<span style="color: #10b981;">✅ ${diffDays} días restantes</span>`;
      }
    };

    // Obtener color según prioridad
    const obtenerColorPrioridad = (prioridad: string): string => {
      switch (prioridad) {
        case 'urgente':
          return '#ef4444';
        case 'alta':
          return '#f59e0b';
        case 'media':
          return '#3b82f6';
        case 'baja':
          return '#10b981';
        default:
          return '#6b7280';
      }
    };

    // Generar HTML para cada tarea
    const tareasHTML = tareasPendientes.map((tarea, index) => {
      const diasRestantes = calcularDiasRestantes(tarea.fecha_vencimiento);
      const colorPrioridad = obtenerColorPrioridad(tarea.prioridad);
      
      return `
        <div style="background-color: #f9fafb; border-left: 4px solid ${colorPrioridad}; padding: 20px; margin-bottom: 20px; border-radius: 0 8px 8px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
            <h3 style="color: #1f2937; margin: 0; font-size: 18px; font-weight: 600;">
              📌 Tarea ${index + 1}: ${tarea.titulo}
            </h3>
            <span style="background-color: ${colorPrioridad}; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
              ${tarea.prioridad}
            </span>
          </div>
          
          ${tarea.instrucciones ? `
            <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
              <p style="color: #374151; margin: 0 0 8px 0; font-weight: 600;">📝 Instrucciones:</p>
              <p style="color: #6b7280; margin: 0; line-height: 1.6; white-space: pre-wrap;">${tarea.instrucciones}</p>
            </div>
          ` : ''}
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px;">
            <div>
              <p style="color: #374151; margin: 5px 0; font-weight: 500;"><strong>📅 Fecha Límite:</strong></p>
              <p style="color: #6b7280; margin: 5px 0;">${formatearFecha(tarea.fecha_vencimiento)}</p>
            </div>
            <div>
              <p style="color: #374151; margin: 5px 0; font-weight: 500;"><strong>⭐ Puntos:</strong></p>
              <p style="color: #6b7280; margin: 5px 0;">${tarea.puntos_asignados} puntos</p>
            </div>
          </div>
          
          ${diasRestantes ? `
            <div style="margin-top: 10px;">
              <p style="margin: 0;">${diasRestantes}</p>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: visible; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header con gradiente -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🧠 Centro Terapéutico Psyche</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Recordatorio de Tareas Pendientes</p>
        </div>
        
        <!-- Contenido principal -->
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background-color: #fef3c7; border-radius: 15px; border: 3px solid #f59e0b;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #f59e0b; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
              <span style="font-size: 40px; color: #ffffff;">📋</span>
            </div>
            <p style="margin-top: 15px; color: #92400e; font-weight: bold; font-size: 18px;">Tienes ${tareasPendientes.length} tarea(s) pendiente(s)</p>
          </div>
          
          <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">¡Hola ${nombrePaciente}!</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Te recordamos que tienes <strong>${tareasPendientes.length} tarea(s) pendiente(s)</strong> que aún no has completado. 
            Es importante que las completes para continuar con tu proceso terapéutico.
          </p>
          
          <!-- Lista de tareas -->
          <div style="margin: 30px 0;">
            <h3 style="color: #1f2937; margin-bottom: 20px; font-size: 20px;">📝 Tus Tareas Pendientes:</h3>
            ${tareasHTML}
          </div>
          
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; margin: 25px 0;">
            <h3 style="color: #92400e; margin-top: 0; font-size: 18px;">💡 Recordatorio Importante</h3>
            <ul style="color: #92400e; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Completa tus tareas antes de la fecha límite para obtener los puntos asignados</li>
              <li>Las tareas completadas te ayudan a avanzar en tu proceso terapéutico</li>
              <li>Si tienes dudas sobre alguna tarea, contacta a tu psicólogo</li>
              <li>Accede al sistema para completar tus tareas y ver tu progreso</li>
            </ul>
          </div>
          
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">🚀 Completa tus Tareas Ahora</h3>
            <p style="color: #1e40af; margin: 10px 0; line-height: 1.6;">
              Accede al sistema para ver y completar tus tareas pendientes:
            </p>
            <div style="margin-top: 15px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; transition: background-color 0.3s;">
                🔐 Acceder al Sistema
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              <strong>Centro Terapéutico Psyche</strong><br>
              📧 info@psyche.cl | 📱 +56 9 1234 5678<br>
              <span style="font-size: 12px;">Este es un mensaje automático. Si tienes alguna pregunta, contacta a tu psicólogo.</span>
            </p>
          </div>
        </div>
      </div>
    `;

    return await enviarEmail({
      to: emailPaciente,
      subject,
      html
    });
  } catch (error) {
    logger.error('Error al enviar email de recordatorio de tareas', { error, emailPaciente });
    return false;
  }
};