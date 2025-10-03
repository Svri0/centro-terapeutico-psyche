const { sequelize } = require('./src/configuracion/database');
const { QueryTypes } = require('sequelize');

async function verificarUsuario() {
  try {
    console.log('🔍 Verificando usuario: 528cff4c-e298-4c69-9d78-063da4035332');
    
    // Verificar usuario
    const usuario = await sequelize.query(
      'SELECT id, nombres, apellidos, email, rol_id FROM usuarios WHERE id = \'528cff4c-e298-4c69-9d78-063da4035332\'',
      { type: QueryTypes.SELECT }
    );
    
    // Verificar si existe en pacientes
    const paciente = await sequelize.query(
      'SELECT id, usuario_id, psicologo_id FROM pacientes WHERE usuario_id = \'528cff4c-e298-4c69-9d78-063da4035332\'',
      { type: QueryTypes.SELECT }
    );
    
    // Verificar roles disponibles
    const roles = await sequelize.query(
      'SELECT id, nombre FROM roles ORDER BY id',
      { type: QueryTypes.SELECT }
    );
    
    console.log('👤 Usuario:', usuario[0]);
    console.log('🏥 Paciente:', paciente[0] || 'No encontrado');
    console.log('🎭 Roles disponibles:', roles);
    
    if (usuario[0] && paciente[0]) {
      console.log('⚠️  INCONSISTENCIA: Usuario tiene rol_id:', usuario[0].rol_id, 'pero también existe en tabla pacientes');
      console.log('💡 Solución: Cambiar rol_id a 4 (paciente) o eliminar registro de pacientes');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verificarUsuario();
