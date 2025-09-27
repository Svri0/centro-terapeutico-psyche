import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Chatbot from '../componentes/Chatbot';

const Inicio: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:opacity-80 transition-opacity duration-300"
              >
                <img src="/logo-de-psyche.svg" alt="Dentro de Psyché" className="h-12 md:h-16 lg:h-20 w-auto" />
              </button>
            </div>
            
            {/* Navegación Desktop */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <button
                onClick={() => document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-300 text-sm xl:text-lg"
              >
                NOSOTROS
              </button>
              <button
                onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-300 text-sm xl:text-lg"
              >
                SERVICIOS
              </button>
              <button
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-300 text-sm xl:text-lg"
              >
                CÓMO FUNCIONA
              </button>
              <button
                onClick={() => document.getElementById('recursos')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-300 text-sm xl:text-lg"
              >
                RECURSOS
              </button>
              <button
                onClick={() => document.getElementById('equipo')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-300 text-sm xl:text-lg"
              >
                EQUIPO
              </button>
              <button
                onClick={() => document.getElementById('testimonios')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-300 text-sm xl:text-lg"
              >
                TESTIMONIOS
              </button>
            </nav>
            
            {/* Botón de Login Desktop */}
            <div className="hidden lg:flex items-center">
              <Link
                to="/login"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 xl:px-6 py-2 xl:py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl text-sm xl:text-base"
              >
                Iniciar Sesión
              </Link>
            </div>

            {/* Menú Hamburguesa */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-amber-600 transition-colors duration-300 p-2"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Menú Móvil */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-amber-100 py-4">
              <nav className="flex flex-col space-y-4">
                <button
                  onClick={() => {
                    document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth' });
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-300 text-left py-2"
                >
                  NOSOTROS
                </button>
                <button
                  onClick={() => {
                    document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' });
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-300 text-left py-2"
                >
                  SERVICIOS
                </button>
                <button
                  onClick={() => {
                    document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-300 text-left py-2"
                >
                  CÓMO FUNCIONA
                </button>
                <button
                  onClick={() => {
                    document.getElementById('recursos')?.scrollIntoView({ behavior: 'smooth' });
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-300 text-left py-2"
                >
                  RECURSOS
                </button>
                <button
                  onClick={() => {
                    document.getElementById('equipo')?.scrollIntoView({ behavior: 'smooth' });
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-300 text-left py-2"
                >
                  EQUIPO
                </button>
                <button
                  onClick={() => {
                    document.getElementById('testimonios')?.scrollIntoView({ behavior: 'smooth' });
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-300 text-left py-2"
                >
                  TESTIMONIOS
                </button>
                <div className="pt-4 border-t border-amber-100">
                  <Link
                    to="/login"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 inline-block text-center w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-elegant font-light text-gray-800 mb-6 leading-tight animate-fade-in-up">
              Bienvenido a tu
              <span className="block text-amber-600 font-normal">espacio de tranquilidad</span>
            </h1>
            <p className="text-2xl md:text-3xl lg:text-4xl font-elegant font-light text-gray-600 mb-8 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              Dentro de Psyché
            </p>
          </div>
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-amber-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-200/30 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-200/30 rounded-full blur-lg"></div>
      </section>

      {/* Sección Nosotros */}
      <section id="nosotros" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Contenido de texto - Lado izquierdo */}
            <div className="space-y-4 lg:space-y-6 animate-fade-in-left">
              <div>
                <p className="text-amber-600 font-semibold text-xs lg:text-sm uppercase tracking-wider mb-2">NOSOTROS</p>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-elegant font-bold text-gray-800 mb-4 lg:mb-6 leading-tight">
                  Centro Terapéutico Integral
                  <span className="block text-amber-600">Dentro de Psyché</span>
                  <span className="block text-base lg:text-lg font-normal text-gray-600 mt-2">
                    Centrados en mejorar la calidad de vida en niños, jóvenes, adultos y familias
                  </span>
                </h2>
              </div>
              
              <p className="text-gray-600 leading-relaxed text-base lg:text-lg">
                <strong>Dentro de Psyché</strong> tiene años de experiencia en el cuidado de niños, 
                adolescentes y sus familias, promoviendo su desarrollo equilibrado y maduración. 
                Nuestra institución se enfoca en el individuo y su entorno en todas las etapas 
                del desarrollo, buscando comprender y mejorar comportamientos, ofreciendo un 
                espectro de atención inclusivo y amplio para mejorar la calidad de vida y 
                contribuir a la salud preventiva.
              </p>
              
            </div>
            
            {/* Imagen - Lado derecho */}
            <div className="relative lg:pt-16 animate-fade-in-right">
              <div className="shadow-2xl">
                <img 
                  src="/fotorecepcion.png" 
                  alt="Recepción de Dentro de Psyché" 
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Servicios */}
      <section id="servicios" className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-2">SERVICIOS</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Nuestros Servicios
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Realizamos atenciones individuales y/o grupales, utilizando una diversidad de técnicas y metodologías, 
              que permiten identificar el núcleo del problema, de una manera más rápida y efectiva.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Columna Izquierda */}
            <div className="space-y-6 lg:space-y-8">
              {/* Consultas */}
              <div className="flex items-start space-x-4 lg:space-x-6">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-amber-500 text-sm lg:text-lg font-bold">💬</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-2 lg:mb-3">CONSULTAS</h3>
                  <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                    Acoge la problemática que trae el paciente, acompaña delimitando el campo de acción, 
                    despeja dudas, reorienta, potencia recursos, que le permiten superar la situación actual.
                  </p>
                </div>
              </div>
              
              {/* Terapias */}
              <div className="flex items-start space-x-4 lg:space-x-6">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-amber-500 text-sm lg:text-lg font-bold">🧠</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-2 lg:mb-3">TERAPIAS</h3>
                  <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                    Un profesional especializado utiliza diferentes técnicas para estimular pensamientos, 
                    sentimientos, sensaciones y conocimientos, con el propósito de lograr un cambio que mejore la calidad de vida del paciente.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Columna Derecha */}
            <div className="space-y-6 lg:space-y-8">
              {/* Evaluaciones Psicológicas */}
              <div className="flex items-start space-x-4 lg:space-x-6">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-amber-500 text-sm lg:text-lg font-bold">🔍</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-2 lg:mb-3">EVALUACIONES PSICOLÓGICAS</h3>
                  <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                    Realización de evaluaciones de rendimiento intelectual y de personalidad, con sus respectivos informes, 
                    a solicitud de instituciones o de otros profesionales.
                  </p>
                </div>
              </div>
              
              {/* Talleres */}
              <div className="flex items-start space-x-4 lg:space-x-6">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-amber-500 text-sm lg:text-lg font-bold">👥</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-2 lg:mb-3">TALLERES</h3>
                  <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                    La idea es crear un lazo de confianza a través de conversaciones o espacios de reflexión, 
                    que faciliten la manifestación de inquietudes. Requieren de una participación activa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Cómo Funciona */}
      <section id="como-funciona" className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl text-white">📅</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-gray-700 mb-4 tracking-wide">
              ¿Cómo agendar con nosotros?
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light">
              Sigue estos 5 pasos...
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-12">
            {/* Paso 1 - Estilo de la tarjeta 3 */}
            <div className="bg-gradient-to-br from-amber-150 to-orange-100 border border-amber-400 rounded-2xl p-4 lg:p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-400 rounded-full flex items-center justify-center mr-3 lg:mr-4">
                  <span className="text-amber-900 font-bold text-lg lg:text-xl">1</span>
                </div>
                <div className="w-6 lg:w-8 h-1 bg-amber-400 rounded-full"></div>
              </div>
              <h3 className="text-base lg:text-lg font-medium text-gray-700 mb-2 lg:mb-3">Contáctanos</h3>
              <p className="text-gray-600 text-xs lg:text-sm leading-relaxed mb-3 lg:mb-4">
                Puede ser por medio de correo electrónico, WhatsApp o nuestro formulario.
              </p>
              <div className="flex space-x-2">
                <div className="w-4 h-4 lg:w-5 lg:h-5 bg-amber-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs">📱</span>
                </div>
                <div className="w-4 h-4 lg:w-5 lg:h-5 bg-amber-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs">✉️</span>
                </div>
                <div className="w-4 h-4 lg:w-5 lg:h-5 bg-amber-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs">📋</span>
                </div>
              </div>
            </div>
            
            {/* Paso 2 - Estilo de la tarjeta 3 */}
            <div className="bg-gradient-to-br from-amber-150 to-orange-100 border border-amber-400 rounded-2xl p-4 lg:p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-400 rounded-full flex items-center justify-center mr-3 lg:mr-4">
                  <span className="text-amber-900 font-bold text-lg lg:text-xl">2</span>
                </div>
                <div className="w-6 lg:w-8 h-1 bg-amber-400 rounded-full"></div>
              </div>
              <h3 className="text-base lg:text-lg font-medium text-gray-700 mb-2 lg:mb-3">Explícanos</h3>
              <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                Cuéntanos brevemente sobre tu motivo de consulta. Esto nos orienta cómo ayudarte.
              </p>
            </div>
            
            {/* Paso 3 - Estilo original (referencia) */}
            <div className="bg-gradient-to-br from-amber-150 to-orange-100 border border-amber-400 rounded-2xl p-4 lg:p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-400 rounded-full flex items-center justify-center mr-3 lg:mr-4">
                  <span className="text-amber-900 font-bold text-lg lg:text-xl">3</span>
                </div>
                <div className="w-6 lg:w-8 h-1 bg-amber-400 rounded-full"></div>
              </div>
              <h3 className="text-base lg:text-lg font-medium text-gray-700 mb-2 lg:mb-3">¡Conversemos!</h3>
              <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                Uno de nosotros te contactará lo antes posible.
              </p>
            </div>
            
            {/* Paso 4 - Estilo de la tarjeta 3 */}
            <div className="bg-gradient-to-br from-amber-150 to-orange-100 border border-amber-400 rounded-2xl p-4 lg:p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-400 rounded-full flex items-center justify-center mr-3 lg:mr-4">
                  <span className="text-amber-900 font-bold text-lg lg:text-xl">4</span>
                </div>
                <div className="w-6 lg:w-8 h-1 bg-amber-400 rounded-full"></div>
              </div>
              <h3 className="text-base lg:text-lg font-medium text-gray-700 mb-2 lg:mb-3">Reserva tu sesión</h3>
              <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                Para reservar debes pagar tu sesión vía transferencia con tu psicólogo.
              </p>
            </div>
            
            {/* Paso 5 - Estilo de la tarjeta 3 */}
            <div className="bg-gradient-to-br from-amber-150 to-orange-100 border border-amber-400 rounded-2xl p-4 lg:p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-center mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-400 rounded-full flex items-center justify-center mr-3 lg:mr-4">
                  <span className="text-amber-900 font-bold text-lg lg:text-xl">5</span>
                </div>
                <div className="w-6 lg:w-8 h-1 bg-amber-400 rounded-full"></div>
              </div>
              <h3 className="text-base lg:text-lg font-medium text-gray-700 mb-2 lg:mb-3">Primera sesión</h3>
              <p className="text-gray-600 text-xs lg:text-sm leading-relaxed">
                Procura estar cinco minutos antes de la hora acordada.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => document.getElementById('formulario-solicitud')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Solicitar mi Hora
            </button>
          </div>
        </div>
      </section>

      {/* Formulario de Solicitud */}
      <section id="formulario-solicitud" className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
              Solicita tu <span className="text-amber-600">Primera Consulta</span>
            </h2>
            <p className="text-lg text-gray-600">
              Completa este formulario y nos pondremos en contacto contigo en las próximas 24 horas.
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Tu nombre completo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="+56 9 1234 5678" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="tu@email.com" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferencia de Sesión</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                    <option>Presencial</option>
                    <option>Online</option>
                    <option>Sin preferencia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horario Preferido</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                    <option>Mañana (8:00 - 12:00)</option>
                    <option>Tarde (12:00 - 18:00)</option>
                    <option>Noche (18:00 - 20:00)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Motivo de Consulta</label>
                <textarea rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Cuéntanos brevemente qué te motiva a buscar apoyo psicológico..."></textarea>
              </div>
              
              <div className="text-center">
                <button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Sección de Testimonios */}
      <section id="testimonios" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Lo que dicen nuestros <span className="text-amber-600">pacientes</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Historias reales de transformación y crecimiento personal.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mr-3 lg:mr-4">
                  <span className="text-white font-bold text-sm lg:text-base">M</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 text-sm lg:text-base">María González</h4>
                  <p className="text-xs lg:text-sm text-gray-600">Paciente desde 2023</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                "Dentro de Psyché me ayudó a encontrar la paz que necesitaba. El ambiente es tan acogedor que desde el primer día me sentí en casa. Mi psicóloga es increíble."
              </p>
              <div className="flex text-amber-100 mt-3 lg:mt-4 text-sm lg:text-base">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mr-3 lg:mr-4">
                  <span className="text-white font-bold text-sm lg:text-base">C</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 text-sm lg:text-base">Carlos Rodríguez</h4>
                  <p className="text-xs lg:text-sm text-gray-600">Paciente desde 2022</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                "El proceso de selección de psicólogo fue perfecto. Me dieron la opción de elegir y encontré a alguien con quien realmente conecté. La terapia online también funciona excelente."
              </p>
              <div className="flex text-amber-100 mt-3 lg:mt-4 text-sm lg:text-base">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 md:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-3 lg:mb-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mr-3 lg:mr-4">
                  <span className="text-white font-bold text-sm lg:text-base">A</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 text-sm lg:text-base">Ana Silva</h4>
                  <p className="text-xs lg:text-sm text-gray-600">Paciente desde 2024</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                "La atención es excepcional. Desde el primer contacto hasta las sesiones, todo está pensado para tu bienestar. Definitivamente recomiendo Dentro de Psyché."
              </p>
              <div className="flex text-amber-100 mt-3 lg:mt-4 text-sm lg:text-base">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección del Equipo */}
      <section id="equipo" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Nuestro <span className="text-amber-600">Equipo</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Psicólogos especializados comprometidos con tu bienestar y crecimiento personal.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="text-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden mx-auto mb-4 lg:mb-6 shadow-lg">
                <img 
                  src="/psicologa1.png" 
                  alt="Dra. Carmen Morales" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg lg:text-xl font-medium text-gray-800 mb-2">Dra. Carmen Morales</h3>
              <p className="text-amber-600 mb-3 lg:mb-4 text-sm lg:text-base">Psicóloga Clínica</p>
              <p className="text-gray-600 text-xs lg:text-sm">
                Especialista en terapia cognitivo-conductual con más de 10 años de experiencia.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden mx-auto mb-4 lg:mb-6 shadow-lg">
                <img 
                  src="/psicologo.png" 
                  alt="Dr. Roberto Vega" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg lg:text-xl font-medium text-gray-800 mb-2">Dr. Roberto Vega</h3>
              <p className="text-amber-600 mb-3 lg:mb-4 text-sm lg:text-base">Psicólogo Familiar</p>
              <p className="text-gray-600 text-xs lg:text-sm">
                Experto en terapia sistémica y resolución de conflictos familiares.
              </p>
            </div>
            
            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden mx-auto mb-4 lg:mb-6 shadow-lg">
                <img 
                  src="/psicologa2.png" 
                  alt="Dra. Patricia Herrera" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg lg:text-xl font-medium text-gray-800 mb-2">Dra. Patricia Herrera</h3>
              <p className="text-amber-600 mb-3 lg:mb-4 text-sm lg:text-base">Psicóloga Infanto-Juvenil</p>
              <p className="text-gray-600 text-xs lg:text-sm">
                Especializada en terapia con niños y adolescentes, enfoque humanista.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Estadísticas */}
      <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
              Nuestros <span className="text-amber-600">Logros</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Números que respaldan nuestro compromiso con tu bienestar.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm">
              <div className="text-5xl font-bold text-amber-600 mb-4">250+</div>
              <div className="text-lg text-gray-700 font-medium">Pacientes Atendidos</div>
              <div className="text-sm text-gray-500 mt-2">Desde nuestra fundación</div>
            </div>
            
            <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm">
              <div className="text-5xl font-bold text-amber-600 mb-4">25k+</div>
              <div className="text-lg text-gray-700 font-medium">Horas de Terapia</div>
              <div className="text-sm text-gray-500 mt-2">Sesiones completadas</div>
            </div>
            
            <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm">
              <div className="text-5xl font-bold text-amber-600 mb-4">140+</div>
              <div className="text-lg text-gray-700 font-medium">Vidas Transformadas</div>
              <div className="text-sm text-gray-500 mt-2">Historias de éxito</div>
            </div>
          </div>
        </div>
      </section>

      {/* Carrusel de Previsiones */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
              Trabajamos con las mejores <span className="text-amber-600">Previsiones</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Aceptamos las principales isapres y Fonasa para tu comodidad.
            </p>
          </div>
          
          {/* Carrusel de Previsiones Infinito */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll space-x-4 sm:space-x-6 lg:space-x-8 items-center">
              {/* Primera fila de logos */}
              <div className="flex space-x-4 sm:space-x-6 lg:space-x-8 items-center flex-shrink-0">
                <div className="flex justify-center">
                  <img src="/fonasa.jpg" alt="Fonasa" className="h-12 sm:h-14 lg:h-16 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex justify-center">
                  <img src="/cruzblanca.png" alt="Cruz Blanca" className="h-12 sm:h-14 lg:h-16 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex justify-center">
                  <img src="/banmedica.png" alt="Banmédica" className="h-12 sm:h-14 lg:h-16 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex justify-center">
                  <img src="/consalud.png" alt="Consalud" className="h-12 sm:h-14 lg:h-16 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex justify-center">
                  <img src="/colmena.png" alt="Colmena" className="h-12 sm:h-14 lg:h-16 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex justify-center">
                  <img src="/vidatres.png" alt="Vida Tres" className="h-12 sm:h-14 lg:h-16 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex justify-center">
                  <img src="/masvida.png" alt="Nueva Masvida" className="h-12 sm:h-14 lg:h-16 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              
              {/* Segunda fila de logos (duplicada para efecto infinito) */}
              <div className="flex space-x-4 sm:space-x-6 lg:space-x-8 items-center flex-shrink-0">
                <div className="flex justify-center">
                  <img src="/fonasa.jpg" alt="Fonasa" className="h-12 sm:h-14 lg:h-16 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex justify-center">
                  <img src="/cruzblanca.png" alt="Cruz Blanca" className="h-12 sm:h-14 lg:h-16 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex justify-center">
                  <img src="/banmedica.png" alt="Banmédica" className="h-12 sm:h-14 lg:h-16 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex justify-center">
                  <img src="/consalud.png" alt="Consalud" className="h-12 sm:h-14 lg:h-16 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex justify-center">
                  <img src="/colmena.png" alt="Colmena" className="h-12 sm:h-14 lg:h-16 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex justify-center">
                  <img src="/vidatres.png" alt="Vida Tres" className="h-12 sm:h-14 lg:h-16 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex justify-center">
                  <img src="/masvida.png" alt="Nueva Masvida" className="h-12 sm:h-14 lg:h-16 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
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

      {/* Sección de Blog/Recursos */}
      <section id="recursos" className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl text-white">📚</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-elegant font-bold text-gray-800 mb-4">Recursos y Artículos</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Información valiosa para tu bienestar mental y crecimiento personal
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Artículo 1 */}
            <article className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className="h-72 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <img 
                  src="/tecnicarelajacion.png" 
                  alt="Técnicas de Relajación" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">Bienestar</span>
                  <span className="text-gray-500 text-sm ml-3">5 min lectura</span>
                </div>
                <h3 className="text-xl font-elegant font-semibold text-gray-800 mb-3">Técnicas de Relajación para el Día a Día</h3>
                <p className="text-gray-600 mb-4">Aprende ejercicios simples de respiración y mindfulness que puedes practicar en casa o en el trabajo.</p>
                <button className="text-amber-600 font-medium hover:text-amber-700 transition-colors">
                  Leer más →
                </button>
              </div>
            </article>

            {/* Artículo 2 */}
            <article className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className="h-72 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <img 
                  src="/comunicacionfamilia.png" 
                  alt="Comunicación Familiar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">Familia</span>
                  <span className="text-gray-500 text-sm ml-3">7 min lectura</span>
                </div>
                <h3 className="text-xl font-elegant font-semibold text-gray-800 mb-3">Comunicación Efectiva en la Familia</h3>
                <p className="text-gray-600 mb-4">Estrategias para mejorar la comunicación y fortalecer los vínculos familiares.</p>
                <button className="text-amber-600 font-medium hover:text-amber-700 transition-colors">
                  Leer más →
                </button>
              </div>
            </article>

            {/* Artículo 3 */}
            <article className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              <div className="h-72 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <img 
                  src="/ansiedad.png" 
                  alt="Señales de Ansiedad" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">Salud Mental</span>
                  <span className="text-gray-500 text-sm ml-3">6 min lectura</span>
                </div>
                <h3 className="text-xl font-elegant font-semibold text-gray-800 mb-3">Reconociendo las Señales de Ansiedad</h3>
                <p className="text-gray-600 mb-4">Aprende a identificar los primeros síntomas de ansiedad y cuándo buscar ayuda profesional.</p>
                <button className="text-amber-600 font-medium hover:text-amber-700 transition-colors">
                  Leer más →
                </button>
              </div>
            </article>
          </div>

          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Ver Todos los Artículos
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
            {/* Información del Centro */}
            <div className="space-y-4">
              <div className="flex items-center">
                <img src="/logo-de-psyche.svg" alt="Dentro de Psyché" className="h-12 w-auto filter brightness-0 invert" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Un espacio de tranquilidad, crecimiento y bienestar para niños, jóvenes, adultos y familias.
              </p>
            </div>

            {/* Servicios */}
            <div className="space-y-4">
              <h4 className="text-lg font-elegant font-semibold text-amber-100">Servicios</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-amber-200 transition-colors text-sm no-underline">Consultas Psicológicas</a></li>
                <li><a href="#" className="text-gray-300 hover:text-amber-200 transition-colors text-sm no-underline">Terapias Individuales</a></li>
                <li><a href="#" className="text-gray-300 hover:text-amber-200 transition-colors text-sm no-underline">Evaluaciones Psicológicas</a></li>
                <li><a href="#" className="text-gray-300 hover:text-amber-200 transition-colors text-sm no-underline">Talleres Especializados</a></li>
                <li><a href="#" className="text-gray-300 hover:text-amber-200 transition-colors text-sm no-underline">Terapia Familiar</a></li>
              </ul>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-4">
              <h4 className="text-lg font-elegant font-semibold text-amber-100">Contacto</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-400 text-sm">+56 9 1234 5678</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-400 text-sm">contacto@dentrodepsyche.cl</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-400 text-sm">Santiago, Chile</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-400 text-sm">Lun-Vie: 8:00-20:00</span>
                </div>
              </div>
            </div>

            {/* Enlaces Útiles */}
            <div className="space-y-4">
              <h4 className="text-lg font-elegant font-semibold text-amber-100">Enlaces Útiles</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-amber-200 transition-colors text-sm no-underline">Blog</a></li>
                <li><a href="#" className="text-gray-300 hover:text-amber-200 transition-colors text-sm no-underline">Términos y Condiciones</a></li>
                <li><a href="#" className="text-gray-300 hover:text-amber-200 transition-colors text-sm no-underline">Política de Privacidad</a></li>
                <li><a href="#" className="text-gray-300 hover:text-amber-200 transition-colors text-sm no-underline">Código de Ética</a></li>
                <li><a href="#" className="text-gray-300 hover:text-amber-200 transition-colors text-sm no-underline">Preguntas Frecuentes</a></li>
              </ul>
            </div>
          </div>

          {/* Línea divisoria */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-400">
                  © 2024 Dentro de Psyché. Todos los derechos reservados.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Made with ♥ from Chile
                </p>
              </div>
              
              {/* Métodos de pago */}
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-500">Métodos de pago:</span>
                <div className="flex space-x-2">
                  <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-800">VISA</span>
                  </div>
                  <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-800">MC</span>
                  </div>
                  <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-800">TB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Inicio;
