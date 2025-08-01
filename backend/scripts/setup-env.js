const fs = require('fs');
const path = require('path');

const envContent = `# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=psyche_db
DB_USER=postgres
DB_PASSWORD=postgres

# Configuración del servidor
PORT=3002
NODE_ENV=development

# JWT Secret
JWT_SECRET=tu_secreto_super_seguro_para_jwt_tokens_2024

# Configuración de CORS
CORS_ORIGIN=http://localhost:3000

# Configuración de logs
LOG_LEVEL=info

# Configuración de Email (Gmail)
# EMAIL_USER=tu_email@gmail.com
# EMAIL_PASSWORD=tu_password_de_aplicacion
# FRONTEND_URL=http://localhost:3000
`;

const envPath = path.join(__dirname, '..', '.env');

try {
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado exitosamente');
  } else {
    console.log('ℹ️  El archivo .env ya existe');
  }
} catch (error) {
  console.error('❌ Error al crear el archivo .env:', error.message);
} 