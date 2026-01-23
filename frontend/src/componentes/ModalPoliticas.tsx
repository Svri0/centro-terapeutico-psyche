import React, { useState } from 'react';

interface ModalPoliticasProps {
  isOpen: boolean;
  onAceptar: () => void;
  onAceptarLoading?: boolean;
  modoPublico?: boolean; // Si es true, permite cerrar el modal sin aceptar
  onCerrar?: () => void; // Función para cerrar el modal en modo público
}

const ModalPoliticas: React.FC<ModalPoliticasProps> = ({ 
  isOpen, 
  onAceptar,
  onAceptarLoading = false,
  modoPublico = false,
  onCerrar
}) => {
  const [politicaSeguridadLeida, setPoliticaSeguridadLeida] = useState(false);
  const [politicaPrivacidadLeida, setPoliticaPrivacidadLeida] = useState(false);
  const [activeTab, setActiveTab] = useState<'seguridad' | 'privacidad'>('seguridad');

  if (!isOpen) return null;

  // En modo público, se puede aceptar sin leer todo (opcional)
  // En modo autenticado, se requiere leer ambas políticas
  const puedeAceptar = modoPublico ? true : (politicaSeguridadLeida && politicaPrivacidadLeida);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop - se puede cerrar solo en modo público */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75"
        onClick={modoPublico && onCerrar ? onCerrar : undefined}
      />
      
      {/* Contenido del modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out">
          {/* Header del modal */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Políticas de Seguridad y Privacidad
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {modoPublico 
                  ? 'Revisa nuestras políticas de seguridad y privacidad'
                  : 'Por favor, lee y acepta nuestras políticas para continuar'
                }
              </p>
            </div>
            {modoPublico && onCerrar && (
              <button
                onClick={onCerrar}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                aria-label="Cerrar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('seguridad')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'seguridad'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Política de Seguridad
            </button>
            <button
              onClick={() => setActiveTab('privacidad')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'privacidad'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Política de Privacidad
            </button>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'seguridad' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Política de Seguridad de Datos
                </h3>
                
                <div className="prose max-w-none text-gray-700 space-y-4">
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">1. Compromiso con la Seguridad</h4>
                    <p className="text-sm leading-relaxed">
                      En Centro Terapéutico Psyche, nos comprometemos a proteger la seguridad y confidencialidad 
                      de todos los datos personales y de salud mental que manejamos. Implementamos medidas técnicas 
                      y organizativas apropiadas para garantizar un nivel de seguridad adecuado.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">2. Medidas de Seguridad Implementadas</h4>
                    <ul className="list-disc pl-6 space-y-2 text-sm">
                      <li>Encriptación de datos en tránsito y en reposo</li>
                      <li>Autenticación segura mediante tokens JWT</li>
                      <li>Acceso restringido a información sensible solo a personal autorizado</li>
                      <li>Monitoreo continuo de sistemas y detección de amenazas</li>
                      <li>Copias de seguridad regulares y planes de recuperación</li>
                      <li>Actualizaciones periódicas de seguridad</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">3. Protección de Datos Sensibles</h4>
                    <p className="text-sm leading-relaxed">
                      Todos los datos relacionados con tu salud mental, historial clínico, sesiones terapéuticas 
                      y comunicaciones son tratados con el máximo nivel de confidencialidad. Estos datos solo 
                      son accesibles por el personal autorizado directamente involucrado en tu tratamiento.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">4. Responsabilidades del Usuario</h4>
                    <p className="text-sm leading-relaxed">
                      Como usuario, eres responsable de mantener la confidencialidad de tus credenciales de acceso. 
                      No compartas tu contraseña con terceros y notifica inmediatamente cualquier uso no autorizado 
                      de tu cuenta.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">5. Notificación de Incidentes</h4>
                    <p className="text-sm leading-relaxed">
                      En caso de detectar cualquier brecha de seguridad que pueda afectar tus datos, te notificaremos 
                      de manera oportuna y tomaremos las medidas necesarias para mitigar cualquier riesgo.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">6. Base Legal y Marco Normativo</h4>
                    <p className="text-sm leading-relaxed">
                      Nuestras prácticas de seguridad de datos se rigen por la normativa chilena vigente, 
                      especialmente:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm mt-2">
                      <li><strong>Ley 19.628 sobre Protección de la Vida Privada:</strong> Regula el tratamiento de datos personales y establece las obligaciones de seguridad que debemos cumplir.</li>
                      <li><strong>Ley 20.584 sobre Derechos y Deberes de los Pacientes:</strong> Establece los derechos de los pacientes en relación con su información de salud, incluyendo confidencialidad, acceso a la ficha clínica y protección de datos personales en el ámbito sanitario.</li>
                      <li><strong>Reglamento de Fichas Clínicas (Decreto 41/2012):</strong> Establece los requisitos de seguridad y confidencialidad para el almacenamiento y manejo de información clínica, incluyendo acceso controlado y registro de accesos.</li>
                      <li><strong>Código Sanitario (DFL N° 725):</strong> Regula la confidencialidad de la información de salud y el secreto profesional en el ámbito sanitario.</li>
                    </ul>
                  </section>
                </div>

                {!modoPublico && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={politicaSeguridadLeida}
                        onChange={(e) => setPoliticaSeguridadLeida(e.target.checked)}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        He leído y comprendo la Política de Seguridad de Datos
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'privacidad' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Política de Privacidad
                </h3>
                
                <div className="prose max-w-none text-gray-700 space-y-4">
                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">1. Información que Recopilamos</h4>
                    <p className="text-sm leading-relaxed">
                      Recopilamos información personal necesaria para brindarte servicios de salud mental de calidad, 
                      incluyendo datos de identificación, información de contacto, historial médico y psicológico, 
                      notas de sesiones terapéuticas, y cualquier otra información relevante para tu tratamiento.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">2. Uso de la Información</h4>
                    <p className="text-sm leading-relaxed">
                      Utilizamos tu información personal exclusivamente para:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm mt-2">
                      <li>Proporcionar servicios de atención psicológica y terapéutica</li>
                      <li>Gestionar citas y sesiones</li>
                      <li>Mantener registros clínicos y de tratamiento</li>
                      <li>Comunicarnos contigo sobre tu tratamiento</li>
                      <li>Cumplir con obligaciones legales y regulatorias establecidas en la <strong>Ley 19.628</strong>, 
                          la <strong>Ley 20.584</strong>, el <strong>Reglamento de Fichas Clínicas</strong> y el <strong>Código Sanitario (DFL N° 725)</strong></li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">3. Confidencialidad y Secreto Profesional</h4>
                    <p className="text-sm leading-relaxed">
                      Todos los profesionales de salud mental adheridos a nuestro centro están sujetos al secreto 
                      profesional, establecido en el <strong>Código de Ética Profesional del Colegio de Psicólogos de Chile</strong> 
                      y protegido por el <strong>Código Sanitario (DFL N° 725)</strong> y la <strong>Ley 20.584</strong>. Tu información no será compartida 
                      con terceros sin tu consentimiento explícito, excepto en los casos legalmente requeridos (como orden judicial 
                      o autorización expresa) o cuando sea necesario para proteger tu seguridad o la de otros.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">4. Compartir Información</h4>
                    <p className="text-sm leading-relaxed">
                      No vendemos, alquilamos ni compartimos tu información personal con terceros para fines comerciales. 
                      Solo compartimos información cuando es necesario para tu tratamiento, con tu consentimiento, 
                      o cuando la ley lo requiere.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">5. Tus Derechos</h4>
                    <p className="text-sm leading-relaxed">
                      Tienes derecho a acceder, rectificar, eliminar o limitar el tratamiento de tus datos personales. 
                      También puedes solicitar una copia de tu información o retirar tu consentimiento en cualquier 
                      momento, sujeto a las limitaciones legales aplicables.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">6. Retención de Datos</h4>
                    <p className="text-sm leading-relaxed">
                      Conservamos tu información personal durante el tiempo necesario para cumplir con los fines 
                      para los que fue recopilada. Conforme al <strong>Reglamento de Fichas Clínicas (Decreto 41/2012)</strong>, 
                      mantenemos un plazo mínimo de conservación de <strong>15 años desde el último ingreso de información</strong> 
                      en tu ficha clínica. Este reglamento también exige acceso controlado y registro de quién accede a la ficha, 
                      lo cual implementamos mediante nuestro sistema de auditoría y logs de acceso.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-gray-900 mb-2">7. Base Legal y Marco Normativo</h4>
                    <p className="text-sm leading-relaxed">
                      Esta política de privacidad se rige por la normativa chilena vigente:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm mt-2">
                      <li><strong>Ley 19.628 sobre Protección de la Vida Privada:</strong> Establece los principios 
                          y derechos sobre el tratamiento de datos personales, incluyendo el derecho de acceso, 
                          rectificación, cancelación y oposición al tratamiento de tus datos.</li>
                      <li><strong>Ley 20.584 sobre Derechos y Deberes de los Pacientes:</strong> Regula los derechos 
                          de los pacientes en relación con su información de salud, incluyendo confidencialidad, acceso 
                          a la ficha clínica, protección de datos personales en el ámbito sanitario y atención a distancia/telemedicina.</li>
                      <li><strong>Reglamento de Fichas Clínicas (Decreto 41/2012):</strong> Regula la creación, 
                          mantenimiento, confidencialidad y conservación de las fichas clínicas (mínimo 15 años desde el último ingreso), 
                          garantizando el secreto profesional, acceso controlado y registro de accesos para la protección de tu información de salud.</li>
                      <li><strong>Código Sanitario (DFL N° 725):</strong> Establece el secreto profesional 
                          médico y psicológico, y las excepciones legales para su revelación.</li>
                      <li><strong>Código de Ética Profesional del Colegio de Psicólogos de Chile:</strong> Define las 
                          obligaciones éticas de confidencialidad y protección de la información de los pacientes, incluyendo 
                          el deber de secreto profesional y sus excepciones (orden judicial, autorización del paciente, etc.).</li>
                    </ul>
                  </section>
                </div>

                {!modoPublico && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={politicaPrivacidadLeida}
                        onChange={(e) => setPoliticaPrivacidadLeida(e.target.checked)}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        He leído y comprendo la Política de Privacidad
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer con botón de aceptar */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {!modoPublico && !puedeAceptar && (
                  <span className="text-amber-600 font-medium">
                    Por favor, lee y acepta ambas políticas para continuar
                  </span>
                )}
                {modoPublico && (
                  <span className="text-gray-600">
                    Puedes leer nuestras políticas completas o aceptar directamente
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                {modoPublico && onCerrar && (
                  <button
                    onClick={onCerrar}
                    className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                )}
                <button
                  onClick={onAceptar}
                  disabled={(!modoPublico && !puedeAceptar) || onAceptarLoading}
                  className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                    (modoPublico || puedeAceptar) && !onAceptarLoading
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {onAceptarLoading ? 'Procesando...' : 'Aceptar Políticas'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalPoliticas;

