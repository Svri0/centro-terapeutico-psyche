const { io } = require('socket.io-client');

console.log('🧪 Test exacto del frontend - Simulando comportamiento real...');

// IDs reales de los usuarios
const laura = {
  id: '559a9710-7a5b-48a5-bd7a-055ec9c114d6',
  nombre: 'Laura (Psicóloga)'
};

const pacienteTestLaura = {
  id: 'eb645828-696b-43a9-b82b-2ac06b5785ee',
  nombre: 'Paciente Test Laura'
};

// Simular conversaciones activas como en el frontend
const conversacionActivaLaura = `paciente_${pacienteTestLaura.id}`;
const conversacionActivaPaciente = `psicologo_${laura.id}`;

console.log('🔍 Conversación activa Laura:', conversacionActivaLaura);
console.log('🔍 Conversación activa Paciente:', conversacionActivaPaciente);

// Crear WebSocket para Laura
const lauraSocket = io('http://localhost:3005', {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: false,
  timeout: 5000
});

// Crear WebSocket para Paciente Test Laura
const pacienteSocket = io('http://localhost:3005', {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: false,
  timeout: 5000
});

let lauraConectada = false;
let pacienteConectada = false;

// Configurar Laura
lauraSocket.on('connect', () => {
  console.log('✅ Laura conectada:', lauraSocket.id);
  lauraConectada = true;
  
  // Unirse a sala de usuario
  console.log('🔍 Laura se une a sala:', `user_${laura.id}`);
  lauraSocket.emit('join-user', laura.id);
});

lauraSocket.on('disconnect', () => {
  console.log('❌ Laura desconectada');
  lauraConectada = false;
});

lauraSocket.on('new-message', (data) => {
  console.log('📨 Laura recibió mensaje:', {
    de: data.senderId,
    mensaje: data.message,
    timestamp: data.timestamp,
    chatId: data.chatId
  });
  
  // Simular lógica exacta del frontend
  const chatIdEsperado = [laura.id, pacienteTestLaura.id].sort().join('_');
  console.log('📨 ChatId esperado por Laura:', chatIdEsperado);
  console.log('📨 ¿Coinciden?', chatIdEsperado === data.chatId);
  
  if (chatIdEsperado === data.chatId) {
    console.log('✅ Laura: Mensaje agregado a conversación activa');
  } else {
    console.log('❌ Laura: Mensaje no coincide con conversación activa');
  }
});

// Configurar Paciente Test Laura
pacienteSocket.on('connect', () => {
  console.log('✅ Paciente Test Laura conectada:', pacienteSocket.id);
  pacienteConectada = true;
  
  // Unirse a sala de usuario
  console.log('🔍 Paciente Test Laura se une a sala:', `user_${pacienteTestLaura.id}`);
  pacienteSocket.emit('join-user', pacienteTestLaura.id);
});

pacienteSocket.on('disconnect', () => {
  console.log('❌ Paciente Test Laura desconectada');
  pacienteConectada = false;
});

pacienteSocket.on('new-message', (data) => {
  console.log('📨 Paciente Test Laura recibió mensaje:', {
    de: data.senderId,
    mensaje: data.message,
    timestamp: data.timestamp,
    chatId: data.chatId
  });
  
  // Simular lógica exacta del frontend
  const chatIdEsperado = [pacienteTestLaura.id, laura.id].sort().join('_');
  console.log('📨 ChatId esperado por paciente:', chatIdEsperado);
  console.log('📨 ¿Coinciden?', chatIdEsperado === data.chatId);
  
  if (chatIdEsperado === data.chatId) {
    console.log('✅ Paciente: Mensaje agregado a conversación activa');
  } else {
    console.log('❌ Paciente: Mensaje no coincide con conversación activa');
  }
});

// Función para enviar mensaje como lo hace el frontend
function enviarMensaje(emisor, receptor, mensaje, socket) {
  console.log(`\n📤 ${emisor.nombre} envía: "${mensaje}"`);
  
  // Crear ID de chat (como hace el frontend)
  const chatId = [emisor.id, receptor.id].sort().join('_');
  console.log('🔍 Chat ID:', chatId);
  
  // Enviar via WebSocket (como hace el frontend)
  socket.emit('send-message', {
    chatId,
    message: mensaje,
    senderId: emisor.id
  });
}

// Esperar conexiones
setTimeout(() => {
  if (lauraConectada && pacienteConectada) {
    console.log('\n💬 Iniciando prueba de mensajes...\n');
    
    // Laura envía mensaje
    setTimeout(() => {
      enviarMensaje(laura, pacienteTestLaura, 'Hola, ¿cómo estás?', lauraSocket);
    }, 2000);
    
    // Paciente responde
    setTimeout(() => {
      enviarMensaje(pacienteTestLaura, laura, 'Hola Laura, estoy bien, gracias', pacienteSocket);
    }, 4000);
    
    // Terminar después de 6 segundos
    setTimeout(() => {
      console.log('\n🏁 Prueba completada');
      lauraSocket.disconnect();
      pacienteSocket.disconnect();
      process.exit(0);
    }, 6000);
    
  } else {
    console.log('❌ No se pudieron conectar ambos usuarios');
    console.log('Laura conectada:', lauraConectada);
    console.log('Paciente conectada:', pacienteConectada);
    process.exit(1);
  }
}, 3000);
