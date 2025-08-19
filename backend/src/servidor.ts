/* eslint-disable no-console */
// Este archivo usa console.log intencionalmente para mostrar mensajes de estado del servidor

import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { createServer } from 'http';
import { MENSAJES_GENERALES } from './utilidades/mensajes';
import { ManejadorRespuestas } from './utilidades/respuestas';
import { ChatSocketService } from './servicios/chat-socket.service';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PUERTO = process.env.PORT || 3002;

// Middleware
app.use(helmet());

// Configuración de CORS más específica
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:3003',
      'http://127.0.0.1:3004',
      'http://127.0.0.1:3005',
      'http://127.0.0.1:5173'
    ];
    
    // Permitir requests sin origin (como imágenes)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Endpoint específico para servir imágenes con CORS configurado
app.get('/api/v1/images/:filename', (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join(__dirname, '..', 'uploads', 'avatars', filename);
  
  // Configurar headers CORS específicos para imágenes
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3003',
    'http://127.0.0.1:3004',
    'http://127.0.0.1:3005',
    'http://127.0.0.1:5173'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.header('Cache-Control', 'public, max-age=31536000');
  
  // Servir la imagen
  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error('Error al servir imagen:', err);
      res.status(404).json({ error: 'Imagen no encontrada' });
    }
  });
});

// Servir archivos estáticos para avatares con CORS específico (mantener para compatibilidad)
app.use('/uploads', (req, res, next) => {
  // Configuración más específica para imágenes
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3003',
    'http://127.0.0.1:3004',
    'http://127.0.0.1:3005',
    'http://127.0.0.1:5173'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
}, express.static(path.join(__dirname, '..', 'uploads')));

// Endpoint de verificación de salud con mensaje personalizado (JSON para sistemas)
app.get('/salud', (_req, res) => {
  const infoSalud = {
    estado: 'OK',
    timestamp: new Date().toISOString(),
    servicio: 'centro-terapeutico-psyche-backend',
    version: '1.0.0',
    puerto: PUERTO,
    uptime: process.uptime(),
    memoria: {
      usada: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`
    },
    mensaje: `🏥 Centro Terapéutico Psyche - Puerto ${PUERTO} funcionando correctamente`
  };

  return ManejadorRespuestas.exito(
    res,
    `✅ Puerto ${PUERTO} funcionando correctamente`,
    infoSalud,
    'SYS_001'
  );
});

// Dashboard bonito para humanos (HTML)
app.get('/dashboard', (_req, res) => {
  const uptime = process.uptime();
  const memoria = process.memoryUsage();
  const tiempoInicio = new Date(Date.now() - uptime * 1000);

  const uptimeFormateado = {
    dias: Math.floor(uptime / 86400),
    horas: Math.floor((uptime % 86400) / 3600),
    minutos: Math.floor((uptime % 3600) / 60),
    segundos: Math.floor(uptime % 60)
  };

  const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Centro Terapéutico Psyche - Dashboard</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .dashboard {
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        padding: 40px;
        max-width: 800px;
        width: 100%;
        text-align: center;
      }
      
      .header {
        margin-bottom: 30px;
      }
      
      .logo {
        font-size: 3em;
        margin-bottom: 10px;
      }
      
      .title {
        color: #333;
        font-size: 2.5em;
        font-weight: 700;
        margin-bottom: 10px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .subtitle {
        color: #666;
        font-size: 1.2em;
        margin-bottom: 20px;
      }
      
      .status {
        display: inline-flex;
        align-items: center;
        background: #10b981;
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        font-weight: 600;
        font-size: 1.1em;
        margin-bottom: 30px;
      }
      
      .status-icon {
        margin-right: 8px;
        font-size: 1.2em;
      }
      
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .stat-card {
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 15px;
        padding: 25px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      }
      
      .stat-icon {
        font-size: 2.5em;
        margin-bottom: 10px;
      }
      
      .stat-value {
        font-size: 2em;
        font-weight: 700;
        color: #333;
        margin-bottom: 5px;
      }
      
      .stat-label {
        color: #666;
        font-size: 0.9em;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .endpoints {
        background: #f1f5f9;
        border-radius: 15px;
        padding: 25px;
        margin-top: 20px;
      }
      
      .endpoints h3 {
        color: #333;
        margin-bottom: 15px;
        font-size: 1.3em;
      }
      
      .endpoint-list {
        display: grid;
        gap: 10px;
      }
      
      .endpoint {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .endpoint-path {
        font-family: 'Courier New', monospace;
        color: #333;
        font-weight: 600;
      }
      
      .endpoint-method {
        background: #3b82f6;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8em;
        font-weight: 600;
      }
      
      .refresh-btn {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 25px;
        font-size: 1em;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.3s ease;
        margin-top: 20px;
      }
      
      .refresh-btn:hover {
        transform: scale(1.05);
      }
      
      .footer {
        margin-top: 30px;
        color: #666;
        font-size: 0.9em;
      }
    </style>
  </head>
  <body>
    <div class="dashboard">
      <div class="header">
        <div class="logo">🏥</div>
        <h1 class="title">Centro Terapéutico Psyche</h1>
        <p class="subtitle">Sistema de Gestión Terapéutica v1.0.0</p>
        <div class="status">
          <span class="status-icon">✅</span>
          Puerto ${PUERTO} funcionando correctamente
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🚀</div>
          <div class="stat-value">${PUERTO}</div>
          <div class="stat-label">Puerto Activo</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-value">${uptimeFormateado.dias}d ${uptimeFormateado.horas}h ${uptimeFormateado.minutos}m</div>
          <div class="stat-label">Tiempo Activo</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">💾</div>
          <div class="stat-value">${Math.round(memoria.heapUsed / 1024 / 1024)} MB</div>
          <div class="stat-label">Memoria Usada</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-value">${Math.round(memoria.heapTotal / 1024 / 1024)} MB</div>
          <div class="stat-label">Memoria Total</div>
        </div>
      </div>
      
      <div class="endpoints">
        <h3>🌐 Endpoints Disponibles</h3>
        <div class="endpoint-list">
          <div class="endpoint">
            <span class="endpoint-path">/dashboard</span>
            <span class="endpoint-method">GET</span>
          </div>
          <div class="endpoint">
            <span class="endpoint-path">/salud</span>
            <span class="endpoint-method">GET</span>
          </div>
          <div class="endpoint">
            <span class="endpoint-path">/api/v1/auth/login</span>
            <span class="endpoint-method">POST</span>
          </div>
          <div class="endpoint">
            <span class="endpoint-path">/api/v1/pacientes</span>
            <span class="endpoint-method">GET</span>
          </div>
          <div class="endpoint">
            <span class="endpoint-path">/api/v1/sesiones</span>
            <span class="endpoint-method">GET</span>
          </div>
          <div class="endpoint">
            <span class="endpoint-path">/api/v1/tareas</span>
            <span class="endpoint-method">GET</span>
          </div>
        </div>
      </div>
      
      <button class="refresh-btn" onclick="window.location.reload()">
        🔄 Actualizar Dashboard
      </button>
      
      <div class="footer">
        <p><strong>Iniciado:</strong> ${tiempoInicio.toLocaleString('es-CL')}</p>
        <p><strong>Última actualización:</strong> ${new Date().toLocaleString('es-CL')}</p>
        <p>Desarrollado por Equipo Centro Terapéutico Psyche</p>
      </div>
    </div>
  </body>
  </html>
  `;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Endpoint de bienvenida
app.get('/', (_req, res) => {
  const infoBienvenida = {
    aplicacion: 'Centro Terapéutico Psyche - API',
    version: '1.0.0',
    puerto: PUERTO,
    estado: 'FUNCIONANDO CORRECTAMENTE',
    descripcion: 'Sistema de gestión terapéutica con gamificación',
    endpoints: {
      dashboard: '/dashboard',
      salud: '/salud',
      documentacion: '/api/docs',
      autenticacion: '/api/v1/auth',
      pacientes: '/api/v1/pacientes',
      sesiones: '/api/v1/sesiones',
      tareas: '/api/v1/tareas'
    },
    desarrolladoPor: 'Equipo Centro Terapéutico Psyche',
    contacto: 'soporte@psyche.cl'
  };

  return ManejadorRespuestas.exito(
    res,
    `${MENSAJES_GENERALES.BIENVENIDA} - Puerto ${PUERTO} activo`,
    infoBienvenida,
    'SYS_002'
  );
});

// Rutas de la API
import rutas from './rutas';
app.use('/api/v1', rutas);

// Middleware de manejo de errores personalizado
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('🚨 Error capturado por middleware:', err);

  // Determinar el tipo de error y mensaje apropiado
  let mensaje = MENSAJES_GENERALES.ERROR_INTERNO;
  let codigo = 'SYS_003';
  let statusCode = 500;

  // Errores de validación
  if (err.name === 'ValidationError') {
    mensaje = 'Error de validación en los datos enviados';
    codigo = 'VAL_001';
    statusCode = 400;
  }

  // Errores de base de datos
  if (err.name === 'SequelizeError' || err.name === 'DatabaseError') {
    mensaje = 'Error en la base de datos';
    codigo = 'DB_001';
    statusCode = 500;
  }

  // Errores de autenticación
  if (err.name === 'UnauthorizedError' || err.message.includes('token')) {
    mensaje = 'Token de acceso inválido o expirado';
    codigo = 'AUTH_100';
    statusCode = 401;
  }

  const errorInfo = {
    timestamp: new Date().toISOString(),
    ruta: _req.originalUrl,
    metodo: _req.method,
    puerto: PUERTO,
    ...(process.env.NODE_ENV === 'development' && {
      detalleError: err.message,
      stack: err.stack
    })
  };

  return res.status(statusCode).json({
    success: false,
    mensaje,
    error: mensaje,
    codigo,
    data: errorInfo,
    timestamp: new Date().toISOString()
  });
});

// Manejador de rutas no encontradas con mensaje personalizado
app.use('*', (req, res) => {
  return ManejadorRespuestas.noEncontrado(
    res,
    `La ruta '${req.method} ${req.originalUrl}' no fue encontrada en puerto ${PUERTO}`,
    'SYS_004'
  );
});

// Función para verificar si el puerto está disponible
const verificarPuerto = (puerto: number): Promise<boolean> => {
  return new Promise(resolve => {
    const server = app
      .listen(puerto, () => {
        server.close(() => resolve(true));
      })
      .on('error', () => resolve(false));
  });
};

// Función para encontrar puerto disponible
const encontrarPuertoDisponible = async (puertoInicial: number): Promise<number> => {
  let puerto = puertoInicial;
  while (puerto < puertoInicial + 10) {
    if (await verificarPuerto(puerto)) {
      return puerto;
    }
    puerto++;
  }
  throw new Error(
    `No se encontró un puerto disponible entre ${puertoInicial} y ${puertoInicial + 9}`
  );
};

// Función para iniciar el servidor con mejor manejo de errores
const iniciarServidor = async () => {
  try {
    console.log('🔍 Verificando disponibilidad del puerto...');
    
    // Configurar modelos y asociaciones
    console.log('📦 Configurando modelos y asociaciones...');
    try {
      // Importar modelos para configurar asociaciones
      await import('./modelos');
      console.log('✅ Modelos y asociaciones configurados correctamente');
    } catch (error) {
      console.log('⚠️  Advertencia: No se pudieron configurar los modelos TypeScript');
      console.log('   Los modelos JavaScript seguirán funcionando normalmente');
    }

    // Crear servidor HTTP para Socket.IO
    const servidor = createServer(app);
    
    // Inicializar Socket.IO para chat en tiempo real
    console.log('🔌 Inicializando WebSocket Chat...');
    const chatSocketService = new ChatSocketService(servidor);
    console.log('✅ WebSocket Chat inicializado correctamente');
    
    // Hacer disponible el servicio de chat para los controladores
    (global as any).chatSocketService = chatSocketService;
    console.log('🔌 WebSocket Chat disponible globalmente');
    
    servidor.listen(PUERTO, () => {
        console.log('\n🎉 ═══════════════════════════════════════════════════════');
        console.log('✅ BACKEND FUNCIONANDO CORRECTAMENTE');
        console.log(`🚀 Puerto ${PUERTO} funcionando correctamente`);
        console.log('🏥 Centro Terapéutico Psyche API - v1.0.0');
        console.log('🔌 WebSocket Chat habilitado para tiempo real');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`🌐 Dashboard bonito: http://localhost:${PUERTO}/dashboard`);
        console.log(`📊 Salud (JSON): http://localhost:${PUERTO}/salud`);
        console.log(`🔗 API Base: http://localhost:${PUERTO}/api/v1`);
        console.log(`📄 Info (JSON): http://localhost:${PUERTO}/`);
        console.log(`⏰ Iniciado: ${new Date().toLocaleString('es-CL')}`);
        console.log('═══════════════════════════════════════════════════════════\n');
      })
      .on('error', async (err: any) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`\n❌ PUERTO ${PUERTO} OCUPADO`);
          console.log('🔧 Intentando encontrar puerto alternativo...');

          try {
            const puertoAlternativo = await encontrarPuertoDisponible(Number(PUERTO) + 1);
            console.log(`✅ Puerto alternativo encontrado: ${puertoAlternativo}`);

            // Crear servidor HTTP alternativo para Socket.IO
            const servidorAlternativo = createServer(app);
            
            // Inicializar Socket.IO para chat en tiempo real
            const chatSocketServiceAlternativo = new ChatSocketService(servidorAlternativo);
            
            // Hacer disponible el servicio de chat para los controladores
            (global as any).chatSocketService = chatSocketServiceAlternativo;
            
            servidorAlternativo.listen(puertoAlternativo, () => {
              console.log('\n🎉 ═══════════════════════════════════════════════════════');
              console.log('✅ BACKEND FUNCIONANDO CORRECTAMENTE (PUERTO ALTERNATIVO)');
              console.log(`🚀 Puerto ${puertoAlternativo} funcionando correctamente`);
              console.log('🏥 Centro Terapéutico Psyche API - v1.0.0');
              console.log('🔌 WebSocket Chat habilitado para tiempo real');
              console.log('═══════════════════════════════════════════════════════');
              console.log(`🌐 Dashboard bonito: http://localhost:${puertoAlternativo}/dashboard`);
              console.log(`📊 Salud (JSON): http://localhost:${puertoAlternativo}/salud`);
              console.log(`🔗 API Base: http://localhost:${puertoAlternativo}/api/v1`);
              console.log(`📄 Info (JSON): http://localhost:${puertoAlternativo}/`);
              console.log(`⚠️  Nota: Puerto original ${PUERTO} estaba ocupado`);
              console.log(`⏰ Iniciado: ${new Date().toLocaleString('es-CL')}`);
              console.log('═══════════════════════════════════════════════════════\n');

              configurarEventosServidor(servidorAlternativo);
            });
          } catch (error) {
            console.log('\n💥 ═══════════════════════════════════════════════════════');
            console.log('❌ ERROR CRÍTICO: NO SE PUEDE INICIAR EL SERVIDOR');
            console.log('🚨 No hay puertos disponibles en el rango 3002-3011');
            console.log('═══════════════════════════════════════════════════════');
            console.log('🛠️  SOLUCIONES SUGERIDAS:');
            console.log(`   1. Ejecuta: npx kill-port ${PUERTO}`);
            console.log('   2. Reinicia tu computadora');
            console.log('   3. Cambia el puerto en el archivo .env');
            console.log('═══════════════════════════════════════════════════════\n');
            process.exit(1);
          }
        } else {
          console.log('\n💥 ═══════════════════════════════════════════════════════');
          console.log('❌ ERROR CRÍTICO DEL SERVIDOR');
          console.log('═══════════════════════════════════════════════════════');
          console.error('🚨 Detalles del error:', err);
          console.log('═══════════════════════════════════════════════════════\n');
          process.exit(1);
        }
      });

    configurarEventosServidor(servidor);
  } catch (error) {
    console.log('\n💥 ═══════════════════════════════════════════════════════');
    console.log('❌ ERROR CRÍTICO AL INICIALIZAR EL SERVIDOR');
    console.log('═══════════════════════════════════════════════════════');
    console.error('🚨 Error:', error);
    console.log('═══════════════════════════════════════════════════════\n');
    process.exit(1);
  }
};

// Configurar eventos del servidor
const configurarEventosServidor = (servidor: any) => {
  // Cierre graceful con mensajes personalizados
  process.on('SIGTERM', () => {
    console.log('\n🛑 ═══════════════════════════════════════════════════════');
    console.log('⏹️  SIGTERM recibido - Cerrando servidor gracefully...');
    console.log('═══════════════════════════════════════════════════════');
    servidor.close(() => {
      console.log('✅ Servidor cerrado correctamente');
      console.log('👋 ¡Hasta luego!');
      console.log('═══════════════════════════════════════════════════════\n');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('\n🛑 ═══════════════════════════════════════════════════════');
    console.log('⏹️  SIGINT recibido (Ctrl+C) - Cerrando servidor gracefully...');
    console.log('═══════════════════════════════════════════════════════');
    servidor.close(() => {
      console.log('✅ Servidor cerrado correctamente');
      console.log('👋 ¡Hasta luego!');
      console.log('═══════════════════════════════════════════════════════\n');
      process.exit(0);
    });
  });

  // Manejar errores no capturados
  process.on('uncaughtException', error => {
    console.log('\n💥 ═══════════════════════════════════════════════════════');
    console.log('🚨 ERROR NO CAPTURADO');
    console.log('═══════════════════════════════════════════════════════');
    console.error('Error:', error);
    console.log('⚠️  El servidor se cerrará por seguridad');
    console.log('═══════════════════════════════════════════════════════\n');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.log('\n💥 ═══════════════════════════════════════════════════════');
    console.log('🚨 PROMISE RECHAZADA NO MANEJADA');
    console.log('═══════════════════════════════════════════════════════');
    console.error('En:', promise);
    console.error('Razón:', reason);
    console.log('⚠️  El servidor se cerrará por seguridad');
    console.log('═══════════════════════════════════════════════════════\n');
    process.exit(1);
  });
};

// Iniciar el servidor
iniciarServidor();

export default app;
