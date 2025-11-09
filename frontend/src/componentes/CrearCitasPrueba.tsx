import React, { useState } from 'react';
import { citasService } from '../servicios/citas.service';
import { authService } from '../servicios/auth.service';

const CrearCitasPrueba: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string>('');

  const crearCitasPrueba = async () => {
    setLoading(true);
    setResultado('');
    
    try {
      // Obtener usuario actual
      const user = await authService.getCurrentUser();
      if (!user) {
        setResultado('❌ No hay usuario logueado');
        return;
      }
      
      console.log('👤 Usuario actual:', user);
      
      // Obtener fecha de hoy y mañana
      const hoy = new Date();
      const mañana = new Date(hoy);
      mañana.setDate(hoy.getDate() + 1);
      const pasadoMañana = new Date(hoy);
      pasadoMañana.setDate(hoy.getDate() + 2);
      
      // Crear fechas para los próximos 7 días
      const fechas = [];
      for (let i = 0; i < 7; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + i);
        fechas.push(fecha.toISOString().split('T')[0]);
      }
      
      console.log('📅 Fechas para crear citas:', fechas);
      
      // Buscar pacientes existentes de la Dra. Laura Fernández
      // Vamos a usar los pacientes que ya existen en el sistema con sus IDs reales
      const pacientesExistentes = [
        { id: 'eb645828-696b-43a9-b82b-2ac06b5785ee', nombre: 'Test Laura' },
        { id: '38467e1c-c66a-4f5d-b3d4-5b4ffdfc82b5', nombre: 'Sofía Martínez' }
      ];
      
      // Usar el primer paciente disponible
      const pacienteSeleccionado = pacientesExistentes[0];
      console.log('👤 Usando paciente:', pacienteSeleccionado);
      
      // Crear citas para los próximos 7 días con diferentes pacientes y horarios
      const citasPrueba = [];
      const horarios = [
        { inicio: '09:00:00', fin: '10:00:00' },
        { inicio: '10:00:00', fin: '11:00:00' },
        { inicio: '11:00:00', fin: '12:00:00' },
        { inicio: '14:00:00', fin: '15:00:00' },
        { inicio: '15:00:00', fin: '16:00:00' },
        { inicio: '16:00:00', fin: '17:00:00' },
        { inicio: '17:00:00', fin: '18:00:00' }
      ];
      
      for (let i = 0; i < fechas.length; i++) {
        const paciente = pacientesExistentes[i % pacientesExistentes.length];
        const horario = horarios[i % horarios.length];
        
        citasPrueba.push({
          paciente_id: paciente.id,
          psicologo_id: user.id,
          fecha: fechas[i],
          hora_inicio: horario.inicio,
          hora_fin: horario.fin,
          duracion_minutos: 60,
          tipo_sesion: 'individual',
          modalidad: 'presencial' as const,
          notas_paciente: `Cita de prueba - ${paciente.nombre} - Día ${i + 1}`
        });
      }
      
      let citasCreadas = 0;
      let errores = 0;
      const erroresDetalle: string[] = [];
      
      for (const cita of citasPrueba) {
        try {
          console.log('🔄 Creando cita:', cita);
          const citaCreada = await citasService.crearCita(cita);
          console.log('✅ Cita creada exitosamente:', citaCreada);
          citasCreadas++;
        } catch (error: any) {
          console.error('❌ Error al crear cita:', error);
          errores++;
          erroresDetalle.push(`${cita.fecha} ${cita.hora_inicio}: ${error.message || 'Error desconocido'}`);
        }
      }
      
      let resultadoTexto = `✅ Citas creadas: ${citasCreadas}\n❌ Errores: ${errores}\n\n📅 Fechas: ${fechas.join(', ')}`;
      
      if (erroresDetalle.length > 0) {
        resultadoTexto += `\n\n🔍 Detalles de errores:\n${erroresDetalle.join('\n')}`;
      }
      
      setResultado(resultadoTexto);
      
    } catch (error: any) {
      console.error('Error general:', error);
      setResultado(`❌ Error al crear citas de prueba: ${error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        🧪 Crear Citas de Prueba
      </h3>
      
      <p className="text-gray-600 mb-4">
        Este componente creará citas de prueba para los próximos 7 días con los pacientes existentes de la Dra. Laura Fernández (Test Laura, Sofía Martínez). Las citas se crearán con estado "programada" y luego podrás confirmarlas para probar el botón de sesión terapéutica. Se alternarán entre pacientes con diferentes horarios.
      </p>
      
      <button
        onClick={crearCitasPrueba}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creando...' : 'Crear Citas de Prueba'}
      </button>
      
      {resultado && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{resultado}</pre>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        <p><strong>Nota:</strong> Este es un componente temporal para testing. Las citas se crearán con:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Paciente: Test Laura (paciente existente de la Dra. Laura Fernández)</li>
          <li>Estado: "programada" (necesitarás confirmarlas)</li>
          <li>Fechas: Hoy, mañana y pasado mañana</li>
          <li>Horarios: 10:00, 11:00 y 14:00</li>
        </ul>
        <p className="mt-2 text-blue-600">
          <strong>Instrucciones:</strong> Después de crear las citas, ve a la pestaña "Citas" y confirma las citas para que aparezca el botón de sesión terapéutica.
        </p>
      </div>
    </div>
  );
};

export default CrearCitasPrueba;
