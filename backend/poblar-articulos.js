/**
 * Script para poblar artículos iniciales en la base de datos
 * Ejecutar con: node poblar-articulos.js
 */

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'psyche_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'Babu2001',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

// Definir modelo Articulo temporalmente
const Articulo = sequelize.define('Articulo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  resumen: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  imagen_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  autor_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  tiempo_lectura: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
  },
  publicado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  fecha_publicacion: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  vistas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  etiquetas: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'articulos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
});

// Artículos iniciales
const articulosIniciales = [
  {
    titulo: 'Técnicas de Relajación para el Día a Día',
    slug: 'tecnicas-de-relajacion-para-el-dia-a-dia',
    resumen: 'Aprende ejercicios simples de respiración y mindfulness que puedes practicar en casa o en el trabajo para reducir el estrés y mejorar tu bienestar mental.',
    contenido: `
# Técnicas de Relajación para el Día a Día

El estrés es una parte natural de la vida, pero cuando se vuelve crónico, puede afectar significativamente nuestra salud mental y física. Aprender técnicas de relajación efectivas puede ayudarnos a manejar mejor el estrés diario.

## Respiración Profunda

Una de las técnicas más simples y efectivas es la respiración profunda. Puedes practicarla en cualquier momento y lugar:

1. Siéntate cómodamente o acuéstate
2. Cierra los ojos y coloca una mano sobre tu abdomen
3. Inhala lentamente por la nariz durante 4 segundos
4. Mantén la respiración durante 4 segundos
5. Exhala lentamente por la boca durante 4 segundos
6. Repite este ciclo 5-10 veces

## Mindfulness y Meditación

El mindfulness consiste en prestar atención plena al momento presente sin juzgar. Puedes comenzar con sesiones cortas de 5-10 minutos:

- Encuentra un lugar tranquilo
- Siéntate cómodamente
- Enfócate en tu respiración
- Cuando tu mente divague, regresa suavemente a la respiración

## Relajación Muscular Progresiva

Esta técnica implica tensar y luego relajar diferentes grupos musculares:

1. Comienza con los dedos de los pies
2. Tensa los músculos durante 5 segundos
3. Relaja completamente durante 10 segundos
4. Sube gradualmente por todo el cuerpo

## Conclusión

Practicar estas técnicas regularmente puede ayudarte a reducir el estrés, mejorar el sueño y aumentar tu sensación general de bienestar. Recuerda que la consistencia es clave: incluso 5 minutos al día pueden marcar una gran diferencia.
    `.trim(),
    imagen_url: '/tecnicarelajacion.png',
    categoria: 'Bienestar',
    tiempo_lectura: 5,
    publicado: true,
    fecha_publicacion: new Date(),
    etiquetas: ['relajación', 'mindfulness', 'estrés', 'bienestar'],
  },
  {
    titulo: 'Comunicación Efectiva en la Familia',
    slug: 'comunicacion-efectiva-en-la-familia',
    resumen: 'Estrategias prácticas para mejorar la comunicación y fortalecer los vínculos familiares, creando un ambiente de confianza y comprensión mutua.',
    contenido: `
# Comunicación Efectiva en la Familia

La comunicación es la base de todas las relaciones familiares saludables. Una comunicación efectiva puede fortalecer los vínculos familiares y crear un ambiente de confianza y comprensión.

## Escucha Activa

La escucha activa es fundamental para una comunicación efectiva:

- Presta atención completa cuando alguien habla
- Evita interrumpir
- Haz preguntas para clarificar
- Refleja lo que escuchaste para confirmar comprensión

## Expresar Sentimientos de Manera Asertiva

Es importante expresar nuestros sentimientos sin culpar a otros:

- Usa frases con "Yo" en lugar de "Tú"
- Ejemplo: "Me siento frustrado cuando..." en lugar de "Tú siempre..."
- Sé específico sobre lo que te molesta
- Propón soluciones en lugar de solo quejarte

## Tiempo de Calidad

Dedicar tiempo de calidad juntos es esencial:

- Establece momentos regulares para conversar
- Apaga dispositivos electrónicos durante las comidas
- Participa en actividades que todos disfruten
- Crea tradiciones familiares

## Manejo de Conflictos

Los conflictos son normales, pero cómo los manejamos marca la diferencia:

1. Mantén la calma
2. Escucha todas las perspectivas
3. Busca soluciones que beneficien a todos
4. Acepta disculpas y perdona

## Conclusión

Mejorar la comunicación familiar requiere tiempo y esfuerzo, pero los beneficios son invaluables. Una familia que se comunica bien es más fuerte, más unida y más feliz.
    `.trim(),
    imagen_url: '/comunicacionfamilia.png',
    categoria: 'Familia',
    tiempo_lectura: 7,
    publicado: true,
    fecha_publicacion: new Date(),
    etiquetas: ['comunicación', 'familia', 'relaciones', 'vínculos'],
  },
  {
    titulo: 'Reconociendo las Señales de Ansiedad',
    slug: 'reconociendo-las-senales-de-ansiedad',
    resumen: 'Aprende a identificar los primeros síntomas de ansiedad y cuándo buscar ayuda profesional. Información importante para tu salud mental.',
    contenido: `
# Reconociendo las Señales de Ansiedad

La ansiedad es una respuesta natural al estrés, pero cuando se vuelve excesiva o persistente, puede interferir con nuestra vida diaria. Reconocer las señales tempranas es crucial para buscar ayuda a tiempo.

## Señales Físicas

La ansiedad puede manifestarse físicamente:

- Palpitaciones o ritmo cardíaco acelerado
- Sudoración excesiva
- Temblores o sacudidas
- Dificultad para respirar
- Tensión muscular
- Dolores de cabeza
- Problemas digestivos
- Fatiga

## Señales Emocionales

A nivel emocional, puedes experimentar:

- Preocupación excesiva
- Sentimientos de miedo o pánico
- Irritabilidad
- Dificultad para concentrarte
- Sensación de estar "al límite"
- Anticipación constante de peligro

## Señales Conductuales

Los cambios en el comportamiento también pueden indicar ansiedad:

- Evitar situaciones que causan ansiedad
- Dificultad para dormir
- Cambios en el apetito
- Procrastinación
- Aislamiento social
- Comportamientos compulsivos

## Cuándo Buscar Ayuda

Debes considerar buscar ayuda profesional si:

- La ansiedad interfiere con tu vida diaria
- Experimentas síntomas durante más de 2 semanas
- Tienes pensamientos de autolesión
- Usas sustancias para manejar la ansiedad
- Los síntomas son severos o incapacitantes

## Qué Hacer

Si reconoces estas señales en ti mismo o en alguien cercano:

1. Habla con alguien de confianza
2. Considera hablar con un profesional de salud mental
3. Practica técnicas de relajación
4. Mantén un estilo de vida saludable
5. Evita el consumo excesivo de cafeína y alcohol

## Conclusión

Reconocer las señales de ansiedad es el primer paso hacia el bienestar. No hay vergüenza en buscar ayuda, y el tratamiento puede ser muy efectivo. Tu salud mental es tan importante como tu salud física.
    `.trim(),
    imagen_url: '/ansiedad.png',
    categoria: 'Salud Mental',
    tiempo_lectura: 6,
    publicado: true,
    fecha_publicacion: new Date(),
    etiquetas: ['ansiedad', 'salud mental', 'síntomas', 'bienestar'],
  },
];

async function poblarArticulos() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Verificar si la tabla existe
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'articulos'
      );
    `);

    if (!results[0].exists) {
      console.log('⚠️  La tabla articulos no existe. Por favor, ejecuta las migraciones primero.');
      process.exit(1);
    }

    // Verificar artículos existentes
    for (const articuloData of articulosIniciales) {
      const existe = await Articulo.findOne({
        where: { slug: articuloData.slug },
      });

      if (existe) {
        console.log(`⏭️  Artículo "${articuloData.titulo}" ya existe, omitiendo...`);
      } else {
        await Articulo.create(articuloData);
        console.log(`✅ Artículo "${articuloData.titulo}" creado exitosamente`);
      }
    }

    console.log('\n✅ Proceso completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar artículos:', error);
    process.exit(1);
  }
}

poblarArticulos();

