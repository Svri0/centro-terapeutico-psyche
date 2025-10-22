import React from 'react';
import Notificacion, { NotificacionProps } from './Notificacion';

export interface ContenedorNotificacionesProps {
  notificaciones: Array<{
    id: string;
    titulo: string;
    mensaje: string;
    tipo: 'exito' | 'error' | 'info' | 'advertencia';
    visible: boolean;
    duracion?: number;
  }>;
  onCerrar: (id: string) => void;
}

const ContenedorNotificaciones: React.FC<ContenedorNotificacionesProps> = ({
  notificaciones,
  onCerrar
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 notificaciones-container">
      {notificaciones.map((notif, index) => (
        <div
          key={notif.id}
          className="transform transition-all duration-300 ease-in-out mb-2"
          style={{
            transform: `translateY(${index * 5}px)`,
            zIndex: 50 - index
          }}
        >
          <Notificacion
            id={notif.id}
            titulo={notif.titulo}
            mensaje={notif.mensaje}
            tipo={notif.tipo}
            visible={notif.visible}
            duracion={notif.duracion}
            onCerrar={() => onCerrar(notif.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ContenedorNotificaciones;
