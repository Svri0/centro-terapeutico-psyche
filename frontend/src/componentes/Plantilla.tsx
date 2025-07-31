import React from 'react';
import Logo from './Logo';

interface PlantillaProps {
  children: React.ReactNode;
}

const Plantilla: React.FC<PlantillaProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-soft-50 font-aesthetic">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <Logo size="md" showSubtitle={false} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">
                  Centro Terapéutico
                </h1>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                Panel Principal
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                Pacientes
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                Sesiones
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                Reportes
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-100 mt-auto">
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