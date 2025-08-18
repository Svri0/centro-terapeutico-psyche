import React, { useState } from 'react';
import HerramientaDibujo from './HerramientaDibujo';

const TestHerramientaDibujo: React.FC = () => {
  const [mostrarDibujo, setMostrarDibujo] = useState(false);
  const [dibujoGuardado, setDibujoGuardado] = useState<string | null>(null);

  const handleSave = (imageData: string) => {
    console.log('Dibujo guardado:', imageData.substring(0, 100) + '...');
    setDibujoGuardado(imageData);
    setMostrarDibujo(false);
  };

  const handleCancel = () => {
    setMostrarDibujo(false);
  };

  if (mostrarDibujo) {
    return (
      <HerramientaDibujo
        onSave={handleSave}
        onCancel={handleCancel}
        loading={false}
      />
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Herramienta de Dibujo</h1>
      
      <div className="mb-6">
        <button
          onClick={() => setMostrarDibujo(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Abrir Herramienta de Dibujo
        </button>
      </div>

      {dibujoGuardado && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Dibujo Guardado:</h2>
          <img 
            src={dibujoGuardado} 
            alt="Dibujo de prueba" 
            className="max-w-full h-auto border border-gray-300 rounded-lg"
          />
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Tamaño del archivo: {Math.round(dibujoGuardado.length / 1024)} KB
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Instrucciones de prueba:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Haz clic en "Abrir Herramienta de Dibujo"</li>
          <li>Dibuja algo en el canvas usando el mouse</li>
          <li>Prueba cambiar colores y tamaños de pincel</li>
          <li>Usa el borrador para eliminar partes</li>
          <li>Prueba deshacer/rehacer</li>
          <li>Haz clic en "Guardar Dibujo"</li>
          <li>Verifica que el dibujo se muestre abajo</li>
        </ul>
      </div>
    </div>
  );
};

export default TestHerramientaDibujo;
