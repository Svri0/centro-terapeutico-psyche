import { useState, useCallback } from 'react';

export interface NotificacionData {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'exito' | 'error' | 'info' | 'advertencia';
  visible: boolean;
  duracion?: number;
}

export const useNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState<NotificacionData[]>([]);

  const mostrarNotificacion = useCallback((
    titulo: string,
    mensaje: string,
    tipo: 'exito' | 'error' | 'info' | 'advertencia' = 'info',
    duracion: number = 4000
  ) => {
    const id = Date.now().toString();
    const nuevaNotificacion: NotificacionData = {
      id,
      titulo,
      mensaje,
      tipo,
      visible: true,
      duracion
    };

    setNotificaciones(prev => [...prev, nuevaNotificacion]);
    return id;
  }, []);

  const cerrarNotificacion = useCallback((id: string) => {
    setNotificaciones(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const mostrarExito = useCallback((titulo: string, mensaje: string, duracion?: number) => {
    return mostrarNotificacion(titulo, mensaje, 'exito', duracion);
  }, [mostrarNotificacion]);

  const mostrarError = useCallback((titulo: string, mensaje: string, duracion?: number) => {
    return mostrarNotificacion(titulo, mensaje, 'error', duracion);
  }, [mostrarNotificacion]);

  const mostrarInfo = useCallback((titulo: string, mensaje: string, duracion?: number) => {
    return mostrarNotificacion(titulo, mensaje, 'info', duracion);
  }, [mostrarNotificacion]);

  const mostrarAdvertencia = useCallback((titulo: string, mensaje: string, duracion?: number) => {
    return mostrarNotificacion(titulo, mensaje, 'advertencia', duracion);
  }, [mostrarNotificacion]);

  return {
    notificaciones,
    mostrarNotificacion,
    cerrarNotificacion,
    mostrarExito,
    mostrarError,
    mostrarInfo,
    mostrarAdvertencia
  };
};
