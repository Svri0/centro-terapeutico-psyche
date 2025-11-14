// Mock de nodemailer antes de importar
const mockSendMail = jest.fn();
const mockCreateTransport = jest.fn(() => ({
  sendMail: mockSendMail,
}));

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(() => ({
      sendMail: mockSendMail,
    })),
  },
}));

// Importar después del mock
import { enviarEmail, enviarEmailRegistroPaciente, enviarEmailBienvenidaPsicologo } from '../../utilidades/email.service';

// Mock de logger
jest.mock('../../utilidades/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendMail.mockClear();
  });

  describe('enviarEmail', () => {
    it('debe enviar email exitosamente', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });
      process.env.EMAIL_USER = 'test@example.com';

      const resultado = await enviarEmail({
        to: 'destinatario@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      });

      expect(resultado).toBe(true);
      expect(mockSendMail).toHaveBeenCalled();
    });

    it('debe manejar errores al enviar email', async () => {
      mockSendMail.mockRejectedValue(new Error('Error al enviar'));

      const resultado = await enviarEmail({
        to: 'destinatario@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
      });

      expect(resultado).toBe(false);
    });
  });

  describe('enviarEmailRegistroPaciente', () => {
    it('debe enviar email de registro de paciente', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });
      process.env.EMAIL_USER = 'test@example.com';
      process.env.FRONTEND_URL = 'http://localhost:3000';

      const resultado = await enviarEmailRegistroPaciente(
        'paciente@example.com',
        'Test Paciente',
        'temp@example.com',
        'tempPassword',
        'token123'
      );

      expect(resultado).toBe(true);
      expect(mockSendMail).toHaveBeenCalled();
    });
  });

  describe('enviarEmailBienvenidaPsicologo', () => {
    it('debe enviar email de bienvenida a psicólogo', async () => {
      mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });
      process.env.EMAIL_USER = 'test@example.com';

      const resultado = await enviarEmailBienvenidaPsicologo(
        'psicologo@example.com',
        'Test Psicologo',
        'tempPassword',
        'Psicología Clínica',
        'http://example.com/avatar.jpg'
      );

      expect(resultado).toBe(true);
      expect(mockSendMail).toHaveBeenCalled();
    });
  });
});

