// Utilidades para respuestas HTTP estandarizadas
// Centro Terapéutico Psyche

import { Response } from 'express';

export interface RespuestaAPI {
  success: boolean;
  mensaje: string;
  data?: any;
  error?: string;
  codigo?: string;
  timestamp?: string;
  ruta?: string;
}

/**
 * Clase para manejar respuestas HTTP estandarizadas
 */
export class ManejadorRespuestas {
  /**
   * Envía una respuesta exitosa (200)
   */
  static exito(res: Response, mensaje: string, data?: any, codigo?: string): Response {
    const respuesta: RespuestaAPI = {
      success: true,
      mensaje,
      data,
      timestamp: new Date().toISOString(),
      ...(codigo && { codigo })
    };

    return res.status(200).json(respuesta);
  }

  /**
   * Envía una respuesta de creación exitosa (201)
   */
  static creado(res: Response, mensaje: string, data?: any, codigo?: string): Response {
    const respuesta: RespuestaAPI = {
      success: true,
      mensaje,
      data,
      timestamp: new Date().toISOString(),
      ...(codigo && { codigo })
    };

    return res.status(201).json(respuesta);
  }

  /**
   * Envía una respuesta de error de validación (400)
   */
  static errorValidacion(res: Response, mensaje: string, errores?: any, codigo?: string): Response {
    const respuesta: RespuestaAPI = {
      success: false,
      mensaje,
      error: mensaje,
      data: errores,
      timestamp: new Date().toISOString(),
      ...(codigo && { codigo })
    };

    return res.status(400).json(respuesta);
  }

  /**
   * Envía una respuesta de no autorizado (401)
   */
  static noAutorizado(res: Response, mensaje: string, codigo?: string): Response {
    const respuesta: RespuestaAPI = {
      success: false,
      mensaje,
      error: mensaje,
      timestamp: new Date().toISOString(),
      ...(codigo && { codigo })
    };

    return res.status(401).json(respuesta);
  }

  /**
   * Envía una respuesta de prohibido (403)
   */
  static prohibido(res: Response, mensaje: string, codigo?: string): Response {
    const respuesta: RespuestaAPI = {
      success: false,
      mensaje,
      error: mensaje,
      timestamp: new Date().toISOString(),
      ...(codigo && { codigo })
    };

    return res.status(403).json(respuesta);
  }

  /**
   * Envía una respuesta de no encontrado (404)
   */
  static noEncontrado(res: Response, mensaje: string, codigo?: string): Response {
    const respuesta: RespuestaAPI = {
      success: false,
      mensaje,
      error: mensaje,
      timestamp: new Date().toISOString(),
      ...(codigo && { codigo })
    };

    return res.status(404).json(respuesta);
  }

  /**
   * Envía una respuesta de conflicto (409)
   */
  static conflicto(res: Response, mensaje: string, datos?: any, codigo?: string): Response {
    const respuesta: RespuestaAPI = {
      success: false,
      mensaje,
      error: mensaje,
      data: datos,
      timestamp: new Date().toISOString(),
      ...(codigo && { codigo })
    };

    return res.status(409).json(respuesta);
  }

  /**
   * Envía una respuesta de error interno del servidor (500)
   */
  static errorInterno(res: Response, mensaje: string, codigo?: string): Response {
    const respuesta: RespuestaAPI = {
      success: false,
      mensaje,
      error: mensaje,
      timestamp: new Date().toISOString(),
      ...(codigo && { codigo })
    };

    return res.status(500).json(respuesta);
  }

  /**
   * Envía una respuesta personalizada con código de estado específico
   */
  static personalizado(
    res: Response,
    statusCode: number,
    mensaje: string,
    data?: any,
    success: boolean = true,
    codigo?: string
  ): Response {
    const respuesta: RespuestaAPI = {
      success,
      mensaje,
      data,
      timestamp: new Date().toISOString(),
      ...(codigo && { codigo }),
      ...(!success && { error: mensaje })
    };

    return res.status(statusCode).json(respuesta);
  }
}

/**
 * Middleware para agregar métodos de respuesta personalizados al objeto Response
 */
export const agregarMetodosRespuesta = (
  res: Response
): Response & {
  exitoso: (mensaje: string, data?: any, codigo?: string) => Response;
  creado: (mensaje: string, data?: any, codigo?: string) => Response;
  errorValidacion: (mensaje: string, errores?: any, codigo?: string) => Response;
  noAutorizado: (mensaje: string, codigo?: string) => Response;
  prohibido: (mensaje: string, codigo?: string) => Response;
  noEncontrado: (mensaje: string, codigo?: string) => Response;
  conflicto: (mensaje: string, datos?: any, codigo?: string) => Response;
  errorInterno: (mensaje: string, codigo?: string) => Response;
} => {
  const resExtendido = res as any;

  resExtendido.exitoso = (mensaje: string, data?: any, codigo?: string) =>
    ManejadorRespuestas.exito(res, mensaje, data, codigo);

  resExtendido.creado = (mensaje: string, data?: any, codigo?: string) =>
    ManejadorRespuestas.creado(res, mensaje, data, codigo);

  resExtendido.errorValidacion = (mensaje: string, errores?: any, codigo?: string) =>
    ManejadorRespuestas.errorValidacion(res, mensaje, errores, codigo);

  resExtendido.noAutorizado = (mensaje: string, codigo?: string) =>
    ManejadorRespuestas.noAutorizado(res, mensaje, codigo);

  resExtendido.prohibido = (mensaje: string, codigo?: string) =>
    ManejadorRespuestas.prohibido(res, mensaje, codigo);

  resExtendido.noEncontrado = (mensaje: string, codigo?: string) =>
    ManejadorRespuestas.noEncontrado(res, mensaje, codigo);

  resExtendido.conflicto = (mensaje: string, datos?: any, codigo?: string) =>
    ManejadorRespuestas.conflicto(res, mensaje, datos, codigo);

  resExtendido.errorInterno = (mensaje: string, codigo?: string) =>
    ManejadorRespuestas.errorInterno(res, mensaje, codigo);

  return resExtendido;
};
