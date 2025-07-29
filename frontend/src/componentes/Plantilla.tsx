import React from 'react';

interface PlantillaProps {
  children: React.ReactNode;
}

const Plantilla: React.FC<PlantillaProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">
                Centro Terapéutico Psyche
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-primary-600">
                Panel Principal
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600">
                Pacientes
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600">
                Sesiones
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600">
                Reportes
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 Centro Terapéutico Psyche. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Plantilla; 