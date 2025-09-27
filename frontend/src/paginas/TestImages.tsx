import React from 'react';

const TestImages: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test de Imágenes</h1>
      
      <div style={{ margin: '20px 0' }}>
        <h2>Logo Principal</h2>
        <img src="/logo-de-psyche.svg" alt="Logo" style={{ width: '100px', border: '1px solid red' }} />
      </div>
      
      <div style={{ margin: '20px 0' }}>
        <h2>Psicólogos</h2>
        <img src="/psicologa1.png" alt="Psicóloga 1" style={{ width: '100px', border: '1px solid red' }} />
        <img src="/psicologo.png" alt="Psicólogo" style={{ width: '100px', border: '1px solid red' }} />
        <img src="/psicologa2.png" alt="Psicóloga 2" style={{ width: '100px', border: '1px solid red' }} />
      </div>
      
      <div style={{ margin: '20px 0' }}>
        <h2>Recepción</h2>
        <img src="/fotorecepcion.png" alt="Recepción" style={{ width: '200px', border: '1px solid red' }} />
      </div>
      
      <div style={{ margin: '20px 0' }}>
        <h2>Artículos</h2>
        <img src="/tecnicarelajacion.png" alt="Técnicas" style={{ width: '150px', border: '1px solid red' }} />
        <img src="/comunicacionfamilia.png" alt="Comunicación" style={{ width: '150px', border: '1px solid red' }} />
        <img src="/ansiedad.png" alt="Ansiedad" style={{ width: '150px', border: '1px solid red' }} />
      </div>
      
      <div style={{ margin: '20px 0' }}>
        <h2>Isapres</h2>
        <img src="/fonasa.jpg" alt="Fonasa" style={{ width: '80px', border: '1px solid red' }} />
        <img src="/cruzblanca.png" alt="Cruz Blanca" style={{ width: '80px', border: '1px solid red' }} />
        <img src="/banmedica.png" alt="Banmédica" style={{ width: '80px', border: '1px solid red' }} />
      </div>
    </div>
  );
};

export default TestImages;
