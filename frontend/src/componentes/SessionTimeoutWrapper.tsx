import React from 'react';

interface SessionTimeoutWrapperProps {
  children: React.ReactNode;
}

const SessionTimeoutWrapper: React.FC<SessionTimeoutWrapperProps> = ({ children }) => {
  // Versión completamente desactivada para evitar errores
  // Se puede reactivar más tarde cuando se resuelvan los problemas
  return <>{children}</>;
};

export default SessionTimeoutWrapper;
