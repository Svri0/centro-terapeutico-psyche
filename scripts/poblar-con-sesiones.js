const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'psyche_user',
  password: process.env.DB_PASSWORD || 'Babu2001',
  database: process.env.DB_NAME || 'psyche_db',
  logging: false
});

// Función para obtener el primer nombre
function obtenerPrimerNombre(nombres) {
  return nombres.split(' ')[0].toLowerCase();
}

// Función para generar fecha aleatoria en el pasado
function generarFechaAleatoria(diasAtras) {
  const hoy = new Date();
  const diasAleatorios = Math.floor(Math.random() * diasAtras);
  const fecha = new Date(hoy);
  fecha.setDate(fecha.getDate() - diasAleatorios);
  return fecha;
}

// Función para generar hora aleatoria de sesión
function generarHoraSesion() {
  const horas = [9, 10, 11, 12, 14, 15, 16, 17, 18];
  const hora = horas[Math.floor(Math.random() * horas.length)];
  return hora;
}

// Notas de evolución realistas
const notasEvolucion = [
  "Paciente muestra progreso significativo en el manejo de ansiedad. Practica técnicas de respiración regularmente.",
  "Sesión productiva. Paciente logra identificar patrones de pensamiento negativo y trabaja en reformulación cognitiva.",
  "Buena disposición al trabajo terapéutico. Se observa mejoría en autoestima y relaciones interpersonales.",
  "Paciente reporta disminución de síntomas depresivos. Continúa con adherencia al tratamiento.",
  "Trabajamos en técnicas de afrontamiento del estrés. Paciente muestra compromiso con tareas asignadas.",
  "Excelente sesión. Paciente logra avances en comunicación asertiva y establecimiento de límites.",
  "Se abordaron conflictos familiares. Paciente muestra mayor insight sobre dinámicas relacionales.",
  "Continúa progreso en regulación emocional. Practica mindfulness diariamente con buenos resultados.",
  "Sesión enfocada en estrategias de afrontamiento. Paciente identifica recursos personales de apoyo.",
  "Paciente muestra mayor capacidad de introspección. Trabaja activamente en objetivos terapéuticos.",
  "Avances en manejo de crisis. Paciente utiliza herramientas aprendidas de forma efectiva.",
  "Sesión centrada en técnicas cognitivo-conductuales. Paciente completa registros de pensamiento.",
  "Buena evolución. Se observa reducción en frecuencia e intensidad de síntomas ansiosos.",
  "Paciente reporta mejor calidad de sueño y mayor energía. Continúa con rutinas de autocuidado.",
  "Trabajamos en reestructuración cognitiva de creencias limitantes. Paciente muestra motivación al cambio."
];

// Objetivos de sesión
const objetivosSesion = [
  ["Reducir síntomas de ansiedad", "Practicar técnicas de respiración"],
  ["Identificar pensamientos automáticos negativos", "Desarrollar estrategias de afrontamiento"],
  ["Mejorar autoestima", "Fortalecer habilidades sociales"],
  ["Trabajar duelo y pérdida", "Expresar emociones de forma saludable"],
  ["Establecer límites personales", "Mejorar comunicación asertiva"],
  ["Reducir síntomas depresivos", "Activar conductualmente"],
  ["Manejo del estrés", "Implementar técnicas de relajación"],
  ["Resolver conflictos familiares", "Mejorar vínculos afectivos"],
  ["Desarrollar resiliencia", "Identificar fortalezas personales"],
  ["Trabajar autoconocimiento", "Fomentar insight"]
];

// Técnicas utilizadas
const tecnicasUtilizadas = [
  ["Terapia Cognitivo-Conductual", "Reestructuración cognitiva"],
  ["Mindfulness", "Técnicas de respiración"],
  ["Relajación muscular progresiva", "Visualización guiada"],
  ["Exposición gradual", "Desensibilización sistemática"],
  ["Activación conductual", "Programación de actividades"],
  ["Técnicas de comunicación asertiva", "Role-playing"],
  ["Análisis funcional de conducta", "Reforzamiento positivo"],
  ["Terapia de aceptación y compromiso", "Defusión cognitiva"],
  ["Técnicas de resolución de problemas", "Toma de decisiones"],
  ["Psicoeducación", "Registros de pensamiento"]
];

// Datos de los psicólogos (mismo array de antes)
const psicologos = [
  {
    nombres: 'María José',
    apellidos: 'González Rodríguez',
    email: 'mariajose.gonzalez@psyche.cl',
    password: 'Psyche2024!',
    telefono: '+56987654321',
    fecha_nacimiento: '1985-03-15',
    genero: 'femenino',
    especialidad: 'Psicología Clínica',
    descripcion: 'Especialista en terapia cognitivo-conductual con más de 10 años de experiencia en el tratamiento de trastornos de ansiedad y depresión. Magíster en Psicología Clínica por la Universidad de Chile.',
    codigo_sbs: 'PSC-12458',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria&backgroundColor=ffdfbf'
  },
  {
    nombres: 'Carlos Eduardo',
    apellidos: 'Muñoz Sepúlveda',
    email: 'carlos.munoz@psyche.cl',
    password: 'Psyche2024!',
    telefono: '+56912345678',
    fecha_nacimiento: '1982-07-22',
    genero: 'masculino',
    especialidad: 'Psicología Clínica',
    descripcion: 'Psicólogo clínico con enfoque en terapia breve y solución de problemas. Especializado en el tratamiento de crisis y trauma. Diplomado en Terapia Sistémica.',
    codigo_sbs: 'PSC-11234',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos&backgroundColor=bfdfff'
  },
  {
    nombres: 'Andrea Francisca',
    apellidos: 'Soto Valenzuela',
    email: 'andrea.soto@psyche.cl',
    password: 'Psyche2024!',
    telefono: '+56965432198',
    fecha_nacimiento: '1988-11-08',
    genero: 'femenino',
    especialidad: 'Psicología Clínica',
    descripcion: 'Psicóloga clínica especializada en terapia de aceptación y compromiso (ACT). Experiencia en el tratamiento de trastornos del ánimo y problemas de autoestima.',
    codigo_sbs: 'PSC-13567',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=andrea&backgroundColor=ffb6c1'
  },
  {
    nombres: 'Patricia Alejandra',
    apellidos: 'Ramírez Torres',
    email: 'patricia.ramirez@psyche.cl',
    password: 'Psyche2024!',
    telefono: '+56943218765',
    fecha_nacimiento: '1990-05-14',
    genero: 'femenino',
    especialidad: 'Psicología Infantil',
    descripcion: 'Psicóloga infantil con especialización en trastornos del desarrollo y del aprendizaje. Amplia experiencia en evaluación y tratamiento de niños con TDAH y TEA.',
    codigo_sbs: 'PSC-14892',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=patricia&backgroundColor=90ee90'
  },
  {
    nombres: 'Roberto Andrés',
    apellidos: 'Hernández Silva',
    email: 'roberto.hernandez@psyche.cl',
    password: 'Psyche2024!',
    telefono: '+56956781234',
    fecha_nacimiento: '1979-09-30',
    genero: 'masculino',
    especialidad: 'Terapia de Parejas y Familia',
    descripcion: 'Especialista en terapia de parejas y mediación familiar. Formación en terapia sistémica y enfoque Gottman. Más de 15 años ayudando a parejas.',
    codigo_sbs: 'PSC-10987',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=roberto&backgroundColor=daa520'
  },
  {
    nombres: 'Daniela Constanza',
    apellidos: 'Fuentes Morales',
    email: 'daniela.fuentes@psyche.cl',
    password: 'Psyche2024!',
    telefono: '+56978654321',
    fecha_nacimiento: '1986-12-03',
    genero: 'femenino',
    especialidad: 'Neuropsicología',
    descripcion: 'Neuropsicóloga especializada en evaluación y rehabilitación cognitiva. Experiencia en el tratamiento de pacientes con daño cerebral y deterioro cognitivo.',
    codigo_sbs: 'PSC-15678',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=daniela&backgroundColor=8b4513'
  },
  {
    nombres: 'Felipe Ignacio',
    apellidos: 'Castillo Vargas',
    email: 'felipe.castillo@psyche.cl',
    password: 'Psyche2024!',
    telefono: '+56923456789',
    fecha_nacimiento: '1984-04-18',
    genero: 'masculino',
    especialidad: 'Psicología Organizacional',
    descripcion: 'Psicólogo organizacional con expertise en coaching ejecutivo, manejo del estrés laboral y prevención del burnout.',
    codigo_sbs: 'PSC-12789',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=felipe&backgroundColor=ffff00'
  },
  {
    nombres: 'Valentina Isabel',
    apellidos: 'Cortés Pinto',
    email: 'valentina.cortes@psyche.cl',
    password: 'Psyche2024!',
    telefono: '+56945678912',
    fecha_nacimiento: '1991-08-25',
    genero: 'femenino',
    especialidad: 'Trastornos de Ansiedad y Depresión',
    descripcion: 'Especialista en el tratamiento de trastornos de ansiedad, depresión y trastornos relacionados con el estrés. Certificación en TCC.',
    codigo_sbs: 'PSC-16543',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=valentina&backgroundColor=ffffff'
  }
];

// Datos de los recepcionistas
const recepcionistas = [
  {
    nombres: 'Carolina',
    apellidos: 'Flores Jiménez',
    email: 'carolina.flores@psyche.cl',
    password: 'carolina123',
    telefono: '+56934567891',
    fecha_nacimiento: '1995-06-12',
    genero: 'femenino'
  },
  {
    nombres: 'Sebastián',
    apellidos: 'Morales Díaz',
    email: 'sebastian.morales@psyche.cl',
    password: 'sebastian123',
    telefono: '+56945678923',
    fecha_nacimiento: '1993-02-28',
    genero: 'masculino'
  },
  {
    nombres: 'Javiera',
    apellidos: 'Núñez Rojas',
    email: 'javiera.nunez@psyche.cl',
    password: 'javiera123',
    telefono: '+56956789234',
    fecha_nacimiento: '1997-10-05',
    genero: 'femenino'
  },
  {
    nombres: 'Diego',
    apellidos: 'Pérez Contreras',
    email: 'diego.perez@psyche.cl',
    password: 'diego123',
    telefono: '+56967891345',
    fecha_nacimiento: '1994-07-19',
    genero: 'masculino'
  },
  {
    nombres: 'Camila',
    apellidos: 'Reyes Bustamante',
    email: 'camila.reyes@psyche.cl',
    password: 'camila123',
    telefono: '+56978912456',
    fecha_nacimiento: '1996-04-23',
    genero: 'femenino'
  }
];

// 50 PACIENTES
const pacientes = [
  { nombres: 'Luis Alberto', apellidos: 'Gutiérrez Sánchez', email: 'luis.gutierrez@email.cl', telefono: '+56912348765', fecha_nacimiento: '1992-03-10', genero: 'masculino', rut: '18.234.567-8' },
  { nombres: 'Sofía Fernanda', apellidos: 'Lagos Ortiz', email: 'sofia.lagos@email.cl', telefono: '+56923459876', fecha_nacimiento: '1988-11-22', genero: 'femenino', rut: '17.345.678-9' },
  { nombres: 'Javier Antonio', apellidos: 'Riquelme Castro', email: 'javier.riquelme@email.cl', telefono: '+56934561234', fecha_nacimiento: '1995-07-15', genero: 'masculino', rut: '19.456.789-0' },
  { nombres: 'Francisca Beatriz', apellidos: 'Vega Moreno', email: 'francisca.vega@email.cl', telefono: '+56945672345', fecha_nacimiento: '1990-01-08', genero: 'femenino', rut: '18.567.890-1' },
  { nombres: 'Miguel Ángel', apellidos: 'Bravo Zúñiga', email: 'miguel.bravo@email.cl', telefono: '+56956783456', fecha_nacimiento: '1987-05-30', genero: 'masculino', rut: '17.678.901-2' },
  { nombres: 'Isabella Carolina', apellidos: 'Medina Paredes', email: 'isabella.medina@email.cl', telefono: '+56967894567', fecha_nacimiento: '1993-09-12', genero: 'femenino', rut: '18.789.012-3' },
  { nombres: 'Rodrigo Esteban', apellidos: 'Espinoza Campos', email: 'rodrigo.espinoza@email.cl', telefono: '+56978905678', fecha_nacimiento: '1991-12-25', genero: 'masculino', rut: '18.890.123-4' },
  { nombres: 'Valentina Ignacia', apellidos: 'Navarro Ibáñez', email: 'valentina.navarro@email.cl', telefono: '+56989016789', fecha_nacimiento: '1989-04-17', genero: 'femenino', rut: '17.901.234-5' },
  { nombres: 'Cristóbal Matías', apellidos: 'Rojas Muñoz', email: 'cristobal.rojas@email.cl', telefono: '+56990127890', fecha_nacimiento: '1994-08-03', genero: 'masculino', rut: '19.012.345-6' },
  { nombres: 'Catalina Josefa', apellidos: 'Sandoval Araya', email: 'catalina.sandoval@email.cl', telefono: '+56901238901', fecha_nacimiento: '1996-02-14', genero: 'femenino', rut: '19.123.456-7' },
  { nombres: 'Matías Ignacio', apellidos: 'Carrasco Maldonado', email: 'matias.carrasco@email.cl', telefono: '+56912349012', fecha_nacimiento: '1985-06-21', genero: 'masculino', rut: '16.234.567-8' },
  { nombres: 'Antonia Belén', apellidos: 'Vargas Tapia', email: 'antonia.vargas@email.cl', telefono: '+56923450123', fecha_nacimiento: '1998-10-09', genero: 'femenino', rut: '20.345.678-9' },
  { nombres: 'Nicolás Sebastián', apellidos: 'Parra Olivares', email: 'nicolas.parra@email.cl', telefono: '+56934561234', fecha_nacimiento: '1992-01-27', genero: 'masculino', rut: '18.456.789-K' },
  { nombres: 'Isidora Paz', apellidos: 'Álvarez Briceño', email: 'isidora.alvarez@email.cl', telefono: '+56945672345', fecha_nacimiento: '1990-11-11', genero: 'femenino', rut: '18.567.890-2' },
  { nombres: 'Tomás Eduardo', apellidos: 'Cáceres Figueroa', email: 'tomas.caceres@email.cl', telefono: '+56956783456', fecha_nacimiento: '1986-09-04', genero: 'masculino', rut: '17.678.901-3' },
  { nombres: 'Emilia Constanza', apellidos: 'Salazar Peña', email: 'emilia.salazar@email.cl', telefono: '+56967894567', fecha_nacimiento: '1994-03-19', genero: 'femenino', rut: '19.789.012-4' },
  { nombres: 'Agustín Felipe', apellidos: 'Vera Garrido', email: 'agustin.vera@email.cl', telefono: '+56978905678', fecha_nacimiento: '1991-07-08', genero: 'masculino', rut: '18.890.123-5' },
  { nombres: 'Martina Fernanda', apellidos: 'Henríquez Leiva', email: 'martina.henriquez@email.cl', telefono: '+56989016789', fecha_nacimiento: '1997-12-30', genero: 'femenino', rut: '20.901.234-6' },
  { nombres: 'Benjamín Alonso', apellidos: 'Jara Bustos', email: 'benjamin.jara@email.cl', telefono: '+56990127890', fecha_nacimiento: '1989-05-16', genero: 'masculino', rut: '17.012.345-7' },
  { nombres: 'Florencia Maite', apellidos: 'Palma Cifuentes', email: 'florencia.palma@email.cl', telefono: '+56901238901', fecha_nacimiento: '1995-08-23', genero: 'femenino', rut: '19.123.456-8' },
  { nombres: 'Maximiliano José', apellidos: 'Oyarzún Villanueva', email: 'maximiliano.oyarzun@email.cl', telefono: '+56912349012', fecha_nacimiento: '1988-02-11', genero: 'masculino', rut: '17.234.567-9' },
  { nombres: 'Amanda Cristina', apellidos: 'Yáñez Herrera', email: 'amanda.yanez@email.cl', telefono: '+56923450123', fecha_nacimiento: '1993-06-07', genero: 'femenino', rut: '18.345.678-0' },
  { nombres: 'Vicente Andrés', apellidos: 'Miranda Godoy', email: 'vicente.miranda@email.cl', telefono: '+56934561234', fecha_nacimiento: '1990-10-28', genero: 'masculino', rut: '18.456.789-1' },
  { nombres: 'Josefa Andrea', apellidos: 'Aravena Carvajal', email: 'josefa.aravena@email.cl', telefono: '+56945672345', fecha_nacimiento: '1992-04-02', genero: 'femenino', rut: '18.567.890-3' },
  { nombres: 'Gabriel Ignacio', apellidos: 'Toledo Urbina', email: 'gabriel.toledo@email.cl', telefono: '+56956783456', fecha_nacimiento: '1987-01-15', genero: 'masculino', rut: '17.678.901-4' },
  { nombres: 'Renata Sofía', apellidos: 'Valdivia Ponce', email: 'renata.valdivia@email.cl', telefono: '+56967894567', fecha_nacimiento: '1996-09-20', genero: 'femenino', rut: '19.789.012-5' },
  { nombres: 'Lucas Matías', apellidos: 'Órdenes Saavedra', email: 'lucas.ordenes@email.cl', telefono: '+56978905678', fecha_nacimiento: '1991-11-06', genero: 'masculino', rut: '18.890.123-6' },
  { nombres: 'Monserrat Ximena', apellidos: 'Durán Baeza', email: 'monserrat.duran@email.cl', telefono: '+56989016789', fecha_nacimiento: '1994-07-13', genero: 'femenino', rut: '19.901.234-7' },
  { nombres: 'Martín Alejandro', apellidos: 'Aguirre Méndez', email: 'martin.aguirre@email.cl', telefono: '+56990127890', fecha_nacimiento: '1989-03-26', genero: 'masculino', rut: '17.012.345-8' },
  { nombres: 'Daniela Paz', apellidos: 'Concha Alarcón', email: 'daniela.concha@email.cl', telefono: '+56901238901', fecha_nacimiento: '1995-12-01', genero: 'femenino', rut: '19.123.456-9' },
  { nombres: 'Sebastián Ignacio', apellidos: 'Bustos Ramírez', email: 'sebastian.bustos@email.cl', telefono: '+56912340123', fecha_nacimiento: '1990-07-14', genero: 'masculino', rut: '18.234.567-0' },
  { nombres: 'Camila Francisca', apellidos: 'Núñez Soto', email: 'camila.nunez@email.cl', telefono: '+56923451234', fecha_nacimiento: '1994-05-28', genero: 'femenino', rut: '19.345.678-1' },
  { nombres: 'Andrés Felipe', apellidos: 'Valdés Cortés', email: 'andres.valdes@email.cl', telefono: '+56934562345', fecha_nacimiento: '1988-09-19', genero: 'masculino', rut: '17.456.789-2' },
  { nombres: 'Paulina Alejandra', apellidos: 'Guerrero Pino', email: 'paulina.guerrero@email.cl', telefono: '+56945673456', fecha_nacimiento: '1992-03-07', genero: 'femenino', rut: '18.567.891-4' },
  { nombres: 'Francisco Javier', apellidos: 'Mora Campos', email: 'francisco.mora@email.cl', telefono: '+56956784567', fecha_nacimiento: '1986-11-23', genero: 'masculino', rut: '17.678.902-5' },
  { nombres: 'Constanza Belén', apellidos: 'Reyes Vásquez', email: 'constanza.reyes@email.cl', telefono: '+56967895678', fecha_nacimiento: '1995-01-16', genero: 'femenino', rut: '19.789.013-6' },
  { nombres: 'Diego Alonso', apellidos: 'Silva Morales', email: 'diego.silva@email.cl', telefono: '+56978906789', fecha_nacimiento: '1991-06-09', genero: 'masculino', rut: '18.890.124-7' },
  { nombres: 'Javiera Macarena', apellidos: 'Peña Rivas', email: 'javiera.pena@email.cl', telefono: '+56989017890', fecha_nacimiento: '1993-10-22', genero: 'femenino', rut: '18.901.235-8' },
  { nombres: 'Eduardo Andrés', apellidos: 'Saavedra Muñoz', email: 'eduardo.saavedra@email.cl', telefono: '+56990128901', fecha_nacimiento: '1989-02-15', genero: 'masculino', rut: '17.012.346-9' },
  { nombres: 'Fernanda Isabel', apellidos: 'Castillo Torres', email: 'fernanda.castillo@email.cl', telefono: '+56901239012', fecha_nacimiento: '1996-08-04', genero: 'femenino', rut: '19.123.457-0' },
  { nombres: 'Ignacio Tomás', apellidos: 'Herrera Figueroa', email: 'ignacio.herrera@email.cl', telefono: '+56912340234', fecha_nacimiento: '1987-12-29', genero: 'masculino', rut: '17.234.568-1' },
  { nombres: 'Macarena Andrea', apellidos: 'Lagos Vergara', email: 'macarena.lagos@email.cl', telefono: '+56923451345', fecha_nacimiento: '1994-04-11', genero: 'femenino', rut: '19.345.679-2' },
  { nombres: 'Pablo Andrés', apellidos: 'Ríos Garrido', email: 'pablo.rios@email.cl', telefono: '+56934562456', fecha_nacimiento: '1990-09-26', genero: 'masculino', rut: '18.456.780-3' },
  { nombres: 'Claudia Patricia', apellidos: 'Tapia Alarcón', email: 'claudia.tapia@email.cl', telefono: '+56945673567', fecha_nacimiento: '1992-01-18', genero: 'femenino', rut: '18.567.891-5' },
  { nombres: 'Ricardo Ignacio', apellidos: 'Bravo Paredes', email: 'ricardo.bravo@email.cl', telefono: '+56956784678', fecha_nacimiento: '1988-07-03', genero: 'masculino', rut: '17.678.902-6' },
  { nombres: 'Lorena Francisca', apellidos: 'Muñoz Sandoval', email: 'lorena.munoz@email.cl', telefono: '+56967895789', fecha_nacimiento: '1995-11-25', genero: 'femenino', rut: '19.789.013-7' },
  { nombres: 'Cristian Eduardo', apellidos: 'Romero Yáñez', email: 'cristian.romero@email.cl', telefono: '+56978906890', fecha_nacimiento: '1991-05-08', genero: 'masculino', rut: '18.890.124-8' },
  { nombres: 'Natalia Paz', apellidos: 'Fuentes Contreras', email: 'natalia.fuentes@email.cl', telefono: '+56989017901', fecha_nacimiento: '1993-09-21', genero: 'femenino', rut: '18.901.235-9' },
  { nombres: 'Álvaro Andrés', apellidos: 'Carrasco Leiva', email: 'alvaro.carrasco@email.cl', telefono: '+56990128012', fecha_nacimiento: '1989-03-14', genero: 'masculino', rut: '17.012.346-K' },
  { nombres: 'Bárbara Soledad', apellidos: 'Pinto Carvajal', email: 'barbara.pinto@email.cl', telefono: '+56901239123', fecha_nacimiento: '1996-07-27', genero: 'femenino', rut: '19.123.457-1' }
];

async function poblarConSesiones() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // Limpiar datos existentes
    console.log('🧹 LIMPIANDO DATOS EXISTENTES...');
    console.log('━'.repeat(60));
    
    await sequelize.query(`DELETE FROM sesiones WHERE deleted_at IS NULL`, { transaction });
    await sequelize.query(`DELETE FROM pacientes WHERE deleted_at IS NULL`, { transaction });
    await sequelize.query(`DELETE FROM usuarios WHERE rol_id = (SELECT id FROM roles WHERE nombre = 'paciente')`, { transaction });
    
    console.log(`✅ Datos anteriores eliminados\n`);

    // Obtener IDs de roles
    const [roles] = await sequelize.query(
      "SELECT id, nombre FROM roles ORDER BY id",
      { transaction }
    );
    
    const rolesMap = {};
    roles.forEach(rol => {
      rolesMap[rol.nombre] = rol.id;
    });

    // OBTENER PSICÓLOGOS EXISTENTES
    let [psicologosExistentes] = await sequelize.query(`
      SELECT id, nombres, apellidos FROM usuarios WHERE rol_id = :rol_id AND deleted_at IS NULL
    `, {
      replacements: { rol_id: rolesMap['psicologo'] },
      transaction
    });
    
    // OBTENER RECEPCIONISTAS EXISTENTES
    let [recepcionistasExistentes] = await sequelize.query(`
      SELECT id, nombres, apellidos FROM usuarios WHERE rol_id = :rol_id AND deleted_at IS NULL
    `, {
      replacements: { rol_id: rolesMap['recepcionista'] },
      transaction
    });
    
    console.log(`✅ ${recepcionistasExistentes.length} recepcionistas encontrados\n`);

    // Si no hay psicólogos, crearlos
    if (psicologosExistentes.length === 0) {
      console.log('👨‍⚕️ No se encontraron psicólogos. Creando psicólogos...');
      console.log('━'.repeat(60));
      
      for (const psicologo of psicologos) {
        const passwordHash = await bcrypt.hash(psicologo.password, 12);
        
        const [usuarioCreado] = await sequelize.query(`
          INSERT INTO usuarios (
            id, email, password_hash, nombres, apellidos, telefono,
            fecha_nacimiento, genero, rol_id, activo, email_verificado,
            configuracion, codigo_sbs, especialidad, descripcion, avatar_url,
            created_at, updated_at
          ) VALUES (
            gen_random_uuid(), :email, :passwordHash, :nombres, :apellidos, :telefono,
            :fecha_nacimiento, :genero, :rol_id, true, true,
            '{}', :codigo_sbs, :especialidad, :descripcion, :avatar_url,
            NOW(), NOW()
          ) RETURNING id, nombres, apellidos
        `, {
          replacements: {
            email: psicologo.email,
            passwordHash,
            nombres: psicologo.nombres,
            apellidos: psicologo.apellidos,
            telefono: psicologo.telefono,
            fecha_nacimiento: psicologo.fecha_nacimiento,
            genero: psicologo.genero,
            rol_id: rolesMap['psicologo'],
            codigo_sbs: psicologo.codigo_sbs,
            especialidad: psicologo.especialidad,
            descripcion: psicologo.descripcion,
            avatar_url: psicologo.avatar_url
          },
          transaction
        });
        
        psicologosExistentes.push({
          id: usuarioCreado[0].id,
          nombres: usuarioCreado[0].nombres,
          apellidos: usuarioCreado[0].apellidos
        });
        
        console.log(`✅ ${psicologo.nombres} ${psicologo.apellidos} creado`);
      }
      
      console.log('');
      console.log(`✅ ${psicologosExistentes.length} psicólogos creados\n`);
    } else {
      console.log(`✅ ${psicologosExistentes.length} psicólogos encontrados\n`);
    }
    
    // Si no hay recepcionistas, crearlos
    if (recepcionistasExistentes.length === 0) {
      console.log('👨‍💼 No se encontraron recepcionistas. Creando recepcionistas...');
      console.log('━'.repeat(60));
      
      for (const recepcionista of recepcionistas) {
        const passwordHash = await bcrypt.hash(recepcionista.password, 12);
        
        const [usuarioCreado] = await sequelize.query(`
          INSERT INTO usuarios (
            id, email, password_hash, nombres, apellidos, telefono,
            fecha_nacimiento, genero, rol_id, activo, email_verificado,
            configuracion, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), :email, :passwordHash, :nombres, :apellidos, :telefono,
            :fecha_nacimiento, :genero, :rol_id, true, true,
            '{}', NOW(), NOW()
          ) RETURNING id, nombres, apellidos
        `, {
          replacements: {
            email: recepcionista.email,
            passwordHash,
            nombres: recepcionista.nombres,
            apellidos: recepcionista.apellidos,
            telefono: recepcionista.telefono,
            fecha_nacimiento: recepcionista.fecha_nacimiento,
            genero: recepcionista.genero,
            rol_id: rolesMap['recepcionista']
          },
          transaction
        });
        
        recepcionistasExistentes.push({
          id: usuarioCreado[0].id,
          nombres: usuarioCreado[0].nombres,
          apellidos: usuarioCreado[0].apellidos
        });
        
        console.log(`✅ ${recepcionista.nombres} ${recepcionista.apellidos} creado`);
      }
      
      console.log('');
      console.log(`✅ ${recepcionistasExistentes.length} recepcionistas creados\n`);
    } else {
      console.log(`✅ ${recepcionistasExistentes.length} recepcionistas encontrados\n`);
    }

    // ====================
    // CREAR 50 PACIENTES
    // ====================
    console.log('🏥 CREANDO 50 PACIENTES...');
    console.log('━'.repeat(60));
    
    const pacientesPorPsicologo = Math.ceil(pacientes.length / psicologosExistentes.length);
    const pacientesCreados = [];
    
    for (let i = 0; i < pacientes.length; i++) {
      const pac = pacientes[i];
      
      // Asignar psicólogo
      const psicologoIndex = Math.floor(i / pacientesPorPsicologo) % psicologosExistentes.length;
      const psicologoAsignado = psicologosExistentes[psicologoIndex];
      
      // Generar password
      const primerNombre = obtenerPrimerNombre(pac.nombres);
      const password = `${primerNombre}123`;
      const passwordHash = await bcrypt.hash(password, 12);
      
      // Crear usuario paciente
      const [usuarioCreado] = await sequelize.query(`
        INSERT INTO usuarios (
          id, email, password_hash, nombres, apellidos, telefono,
          fecha_nacimiento, genero, rol_id, activo, email_verificado,
          configuracion, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), :email, :passwordHash, :nombres, :apellidos, :telefono,
          :fecha_nacimiento, :genero, :rol_id, true, true,
          '{}', NOW(), NOW()
        ) RETURNING id
      `, {
        replacements: {
          email: pac.email,
          passwordHash,
          nombres: pac.nombres,
          apellidos: pac.apellidos,
          telefono: pac.telefono,
          fecha_nacimiento: pac.fecha_nacimiento,
          genero: pac.genero,
          rol_id: rolesMap['paciente']
        },
        transaction
      });
      
      const usuarioId = usuarioCreado[0].id;
      const numeroFicha = `P${String(i + 1).padStart(6, '0')}`;
      
      // Crear registro de paciente
      const [pacienteCreado] = await sequelize.query(`
        INSERT INTO pacientes (
          id, usuario_id, psicologo_id, rut, numero_ficha, 
          estado, fecha_ingreso, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), :usuario_id, :psicologo_id, :rut, :numero_ficha,
          'activo', CURRENT_DATE, NOW(), NOW()
        ) RETURNING id
      `, {
        replacements: {
          usuario_id: usuarioId,
          psicologo_id: psicologoAsignado.id,
          rut: pac.rut,
          numero_ficha: numeroFicha
        },
        transaction
      });
      
      pacientesCreados.push({
        id: pacienteCreado[0].id,
        nombres: pac.nombres,
        apellidos: pac.apellidos,
        numero_ficha: numeroFicha,
        psicologo_id: psicologoAsignado.id,
        psicologo_nombres: psicologoAsignado.nombres,
        psicologo_apellidos: psicologoAsignado.apellidos
      });
      
      console.log(`✅ ${i + 1}. ${pac.nombres} ${pac.apellidos} (${numeroFicha})`);
    }
    
    console.log('');
    console.log(`✅ ${pacientesCreados.length} pacientes creados\n`);

    // ====================
    // CREAR SESIONES COMPLETADAS
    // ====================
    console.log('📅 CREANDO SESIONES COMPLETADAS...');
    console.log('━'.repeat(60));
    
    let totalSesiones = 0;
    const tiposSesion = ['presencial', 'virtual', 'telefonica'];
    
    for (let i = 0; i < pacientesCreados.length; i++) {
      const paciente = pacientesCreados[i];
      
      // Cada paciente tendrá entre 2 y 8 sesiones completadas (variado para realismo)
      const numSesiones = Math.floor(Math.random() * 7) + 2; // 2 a 8 sesiones
      
      for (let j = 0; j < numSesiones; j++) {
        // Generar fecha en los últimos 180 días (6 meses)
        const fechaProgramada = generarFechaAleatoria(180);
        const hora = generarHoraSesion();
        fechaProgramada.setHours(hora, 0, 0, 0);
        
        // Fecha de inicio (misma que programada)
        const fechaInicio = new Date(fechaProgramada);
        
        // Fecha fin (60 minutos después)
        const duracion = 60;
        const fechaFin = new Date(fechaInicio);
        fechaFin.setMinutes(fechaFin.getMinutes() + duracion);
        
        // Seleccionar tipo de sesión
        const tipoSesion = tiposSesion[Math.floor(Math.random() * tiposSesion.length)];
        
        // Seleccionar nota, objetivos y técnicas aleatorias
        const notaEvolucion = notasEvolucion[Math.floor(Math.random() * notasEvolucion.length)];
        const objetivos = objetivosSesion[Math.floor(Math.random() * objetivosSesion.length)];
        const tecnicas = tecnicasUtilizadas[Math.floor(Math.random() * tecnicasUtilizadas.length)];
        
        // Crear sesión completada
        await sequelize.query(`
          INSERT INTO sesiones (
            id, paciente_id, psicologo_id, fecha_programada, fecha_inicio, fecha_fin,
            duracion_minutos, tipo_sesion, estado, notas_evolucion,
            objetivos_sesion, tecnicas_utilizadas, observaciones,
            archivos_adjuntos, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), :paciente_id, :psicologo_id, :fecha_programada, :fecha_inicio, :fecha_fin,
            :duracion_minutos, :tipo_sesion, 'completada', :notas_evolucion,
            :objetivos_sesion, :tecnicas_utilizadas, 'Sesión realizada con normalidad.',
            '[]'::jsonb, :created_at, :created_at
          )
        `, {
          replacements: {
            paciente_id: paciente.id,
            psicologo_id: paciente.psicologo_id,
            fecha_programada: fechaProgramada,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            duracion_minutos: duracion,
            tipo_sesion: tipoSesion,
            notas_evolucion: notaEvolucion,
            objetivos_sesion: JSON.stringify(objetivos),
            tecnicas_utilizadas: JSON.stringify(tecnicas),
            created_at: fechaProgramada
          },
          transaction
        });
        
        totalSesiones++;
      }
      
      console.log(`✅ ${i + 1}. ${paciente.nombres} ${paciente.apellidos}: ${numSesiones} sesiones`);
    }
    
    console.log('');
    console.log(`✅ ${totalSesiones} sesiones completadas creadas\n`);

    // Confirmar transacción
    await transaction.commit();
    
    console.log('━'.repeat(60));
    console.log('🎉 PROCESO COMPLETADO EXITOSAMENTE!');
    console.log('━'.repeat(60));
    console.log('');
    console.log('📊 RESUMEN:');
    console.log(`   • Psicólogos: ${psicologosExistentes.length}`);
    console.log(`   • Pacientes: ${pacientesCreados.length}`);
    console.log(`   • Sesiones completadas: ${totalSesiones}`);
    console.log(`   • Promedio sesiones/paciente: ${(totalSesiones / pacientesCreados.length).toFixed(1)}`);
    console.log('');
    console.log('🔑 CONTRASEÑAS:');
    console.log('   Formato: [primer_nombre]123');
    console.log('   Ejemplos: luis123, sofia123, javier123');
    console.log('');
    console.log('📅 SESIONES:');
    console.log('   • Todas las sesiones están completadas');
    console.log('   • Fechas: últimos 6 meses');
    console.log('   • Tipos variados: presencial, virtual, telefónica');
    console.log('   • Con notas de evolución realistas');
    console.log('');

  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
poblarConSesiones();

