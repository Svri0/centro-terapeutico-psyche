import jwt from 'jsonwebtoken';
import { log } from '../utilidades/logger';

// Configuración de JWT
const JWT_SECRET = process.env.JWT_SECRET || 'psyche_jwt_secret_2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'psyche_refresh_secret_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Interfaz para el payload del token
interface TokenPayload {
  id: number;
  email: string;
  rol: string;
  nombre: string;
}

// Interfaz para el token decodificado
interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

class JWTService {
  /**
   * Genera un token de acceso
   */
  static generarToken(payload: TokenPayload): string {
    try {
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'psyche-api',
        audience: 'psyche-users'
      } as jwt.SignOptions);
    } catch (error) {
      log.error('Error generando token:', error);
      throw new Error('Error al generar token de acceso');
    }
  }

  /**
   * Genera un token de refresco
   */
  static generarRefreshToken(payload: TokenPayload): string {
    try {
      return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        issuer: 'psyche-api',
        audience: 'psyche-users'
      } as jwt.SignOptions);
    } catch (error) {
      log.error('Error generando refresh token:', error);
      throw new Error('Error al generar token de refresco');
    }
  }

  /**
   * Verifica y decodifica un token de acceso
   */
  static verificarToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch (error) {
      log.error('Error verificando token:', error);
      throw new Error('Token inválido o expirado');
    }
  }

  /**
   * Verifica y decodifica un token de refresco
   */
  static verificarRefreshToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as DecodedToken;
    } catch (error) {
      log.error('Error verificando refresh token:', error);
      throw new Error('Token de refresco inválido o expirado');
    }
  }

  /**
   * Genera tokens de acceso y refresco
   */
  static generarTokens(payload: TokenPayload): {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } {
    const accessToken = this.generarToken(payload);
    const refreshToken = this.generarRefreshToken(payload);

    // Calcular tiempo de expiración en segundos
    const expiresIn = this.calcularExpiración(JWT_EXPIRES_IN || '24h');

    return {
      accessToken,
      refreshToken,
      expiresIn
    };
  }

  /**
   * Calcula el tiempo de expiración en segundos
   */
  private static calcularExpiración(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 24 * 60 * 60; // 24 horas por defecto
    }

    const [, value, unit] = match as [string, string, string];
    const numValue = parseInt(value || '0', 10);

    switch (unit) {
      case 's':
        return numValue;
      case 'm':
        return numValue * 60;
      case 'h':
        return numValue * 60 * 60;
      case 'd':
        return numValue * 24 * 60 * 60;
      default:
        return 24 * 60 * 60;
    }
  }

  /**
   * Extrae el token del header Authorization
   */
  static extraerToken(authHeader: string | undefined): string {
    if (!authHeader) {
      throw new Error('Header de autorización no proporcionado');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Formato de token inválido');
    }

    return authHeader.substring(7);
  }

  /**
   * Verifica si un token está próximo a expirar (dentro de 1 hora)
   */
  static tokenPróximoAExpirar(token: string): boolean {
    try {
      const decoded = this.verificarToken(token);
      const ahora = Math.floor(Date.now() / 1000);
      const tiempoRestante = decoded.exp - ahora;

      // Considerar próximo a expirar si queda menos de 1 hora
      return tiempoRestante < 3600;
    } catch (error) {
      return true; // Si hay error, considerar como próximo a expirar
    }
  }
}

export default JWTService;
