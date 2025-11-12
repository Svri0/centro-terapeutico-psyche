import React from 'react';
import { Link } from 'react-router-dom';
import { useLogViewPerformance } from '../utilidades/performanceLogger';

const PanelPrincipal: React.FC = () => {
  useLogViewPerformance('PanelPrincipal');
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img src="/logo-de-psyche.svg" alt="Dentro de Psyché" className="h-16 w-auto" />
            </div>
            <div className="flex items-center">
              <Link
                to="/login"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-gray-800 mb-6 leading-tight">
              Bienvenido a tu
              <span className="block text-amber-600 font-normal">espacio de tranquilidad</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Donde la mente encuentra su equilibrio y el corazón su paz. 
              Un lugar seguro para tu crecimiento personal y bienestar emocional.
            </p>
            <div className="flex justify-center">
              <Link
                to="/login"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-amber-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-200/30 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-200/30 rounded-full blur-lg"></div>
      </section>

      {/* Sección de Valores */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
              ¿Qué significa estar
              <span className="text-amber-600"> Dentro de Psyché</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Un espacio diseñado para tu bienestar integral, donde cada detalle está pensado 
              para crear un ambiente de calma, confianza y crecimiento personal.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white/70 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-4">Crecimiento Mental</h3>
              <p className="text-gray-600 leading-relaxed">
                Desarrollamos herramientas para fortalecer tu mente y enfrentar 
                los desafíos con confianza y claridad.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white/70 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">💚</span>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-4">Bienestar Emocional</h3>
              <p className="text-gray-600 leading-relaxed">
                Creamos un espacio seguro donde puedes expresar tus emociones 
                y encontrar el equilibrio que necesitas.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white/70 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-4">Transformación Personal</h3>
              <p className="text-gray-600 leading-relaxed">
                Te acompañamos en tu proceso de autoconocimiento y 
                desarrollo personal hacia una vida más plena.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Servicios */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
              Nuestros <span className="text-amber-600">Servicios</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una gama completa de servicios terapéuticos adaptados 
              a tus necesidades específicas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-amber-600 text-xl">🎯</span>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-4">Terapia Individual</h3>
              <p className="text-gray-600 leading-relaxed">
                Sesiones personalizadas enfocadas en tu crecimiento y bienestar personal.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-amber-600 text-xl">👥</span>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-4">Terapia Grupal</h3>
              <p className="text-gray-600 leading-relaxed">
                Espacios de apoyo mutuo y aprendizaje compartido en un ambiente seguro.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-amber-600 text-xl">🏠</span>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-4">Terapia Familiar</h3>
              <p className="text-gray-600 leading-relaxed">
                Fortalecemos los vínculos familiares y mejoramos la comunicación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
            ¿Listo para comenzar tu transformación?
          </h2>
          <p className="text-xl text-amber-100 mb-8 leading-relaxed">
            Tu bienestar es nuestra prioridad. Te acompañamos en cada paso del camino.
          </p>
          <Link
            to="/login"
            className="inline-block bg-white text-amber-600 hover:bg-amber-50 px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Iniciar Sesión
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="/logo-de-psyche.svg" alt="Dentro de Psyché" className="h-12 w-auto filter brightness-0 invert" />
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 mb-2">Centro Terapéutico Dentro de Psyché</p>
              <p className="text-sm text-gray-500">
                Un espacio de tranquilidad, crecimiento y bienestar
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PanelPrincipal;