# 🔒 Documentación de Seguridad - Centro Terapéutico Psyche

## 📋 Resumen de Medidas de Seguridad Implementadas

### 🛡️ **Protección contra SQL Injection**

#### **Backend (Node.js/Express)**
- ✅ **Parámetros preparados**: Todas las consultas SQL usan `replacements` para prevenir inyección
- ✅ **Validación de entrada**: Sanitización de datos antes de procesar
- ✅ **Tipos de consulta**: Uso de `QueryTypes` para especificar el tipo de consulta
- ✅ **Escape de caracteres**: Remoción de caracteres peligrosos

```typescript
// Ejemplo de consulta segura
const [usuarios] = await sequelize.query(
  'SELECT * FROM usuarios WHERE email = :email',
  { replacements: { email }, type: QueryTypes.SELECT }
);
```

#### **Frontend (React/TypeScript)**
- ✅ **Sanitización de entrada**: Función `sanitizeInput()` para limpiar datos
- ✅ **Validación en tiempo real**: Validación inmediata en campos de formulario
- ✅ **Patrones de validación**: Regex para validar formatos específicos

### 🚫 **Protección contra XSS (Cross-Site Scripting)**

#### **Backend**
- ✅ **Sanitización de headers**: Validación de headers maliciosos
- ✅ **Remoción de scripts**: Eliminación de tags `<script>` y event handlers
- ✅ **Validación de Content-Type**: Verificación de tipos de contenido

#### **Frontend**
- ✅ **Escape de HTML**: React automáticamente escapa contenido
- ✅ **Sanitización de entrada**: Limpieza de caracteres peligrosos
- ✅ **Validación de patrones**: Regex para detectar scripts

### 🔐 **Autenticación y Autorización**

#### **JWT (JSON Web Tokens)**
- ✅ **Algoritmo seguro**: HS256 para firma de tokens
- ✅ **Expiración**: Tokens expiran en 24 horas
- ✅ **Claims específicos**: `iat`, `exp`, `issuer`, `audience`
- ✅ **Secret seguro**: Variable de entorno `JWT_SECRET`

```typescript
const token = jwt.sign(
  { id, email, rol_id, iat, exp },
  secret,
  { 
    expiresIn: '24h',
    algorithm: 'HS256',
    issuer: 'psyche-api',
    audience: 'psyche-client'
  }
);
```

#### **Contraseñas**
- ✅ **Hash seguro**: bcrypt con salt de 12 rondas
- ✅ **Validación de fortaleza**: Patrones para contraseñas seguras
- ✅ **Timing constante**: Prevención de timing attacks

### 🛡️ **Validaciones de Entrada**

#### **Backend Middleware**
```typescript
// Validación de email
{ field: 'email', required: true, type: 'email', maxLength: 255, sanitize: true }

// Validación de contraseña
{ field: 'password', required: true, type: 'password', minLength: 6, maxLength: 128, sanitize: true }
```

#### **Frontend Validaciones**
- ✅ **Validación en tiempo real**: Errores inmediatos en formularios
- ✅ **Patrones de validación**: Regex para email, contraseña, nombres
- ✅ **Sanitización**: Limpieza automática de entrada

### 🚦 **Rate Limiting y Protección**

#### **Headers de Seguridad**
- ✅ **User-Agent malicioso**: Detección de herramientas de hacking
- ✅ **Content-Type**: Validación de tipos de contenido
- ✅ **Tamaño de payload**: Límite de 1MB por request

#### **Detección de Ataques**
```typescript
// Detección de herramientas maliciosas
if (userAgent.toLowerCase().includes('sqlmap') || 
    userAgent.toLowerCase().includes('nikto')) {
  return ManejadorRespuestas.errorCliente(res, 'Acceso denegado', 'SEC_004');
}
```

### 📊 **Logging y Monitoreo**

#### **Logs de Seguridad**
- ✅ **Logs de autenticación**: Intentos de login (sin datos sensibles)
- ✅ **Logs de errores**: Errores de validación y seguridad
- ✅ **Logs de actividad**: Acciones de usuarios autenticados

```typescript
log.info(`Login exitoso para usuario: ${usuario.nombres} ${usuario.apellidos} (${usuario.rol_nombre})`);
log.warn(`Login fallido para email: ${email.substring(0, 3)}***@${email.split('@')[1]}`);
```

### 🧪 **Pruebas de Seguridad**

#### **Script de Pruebas**
- ✅ **SQL Injection tests**: Pruebas de inyección SQL
- ✅ **XSS tests**: Pruebas de cross-site scripting
- ✅ **Header tests**: Pruebas de headers maliciosos
- ✅ **Rate limiting tests**: Pruebas de límites de velocidad

```bash
npm run test:security
```

### 📋 **Checklist de Seguridad**

#### **✅ Implementado**
- [x] Parámetros preparados en todas las consultas SQL
- [x] Sanitización de entrada en frontend y backend
- [x] Validación de tipos de datos
- [x] Protección contra XSS
- [x] JWT con configuración segura
- [x] Hash de contraseñas con bcrypt
- [x] Rate limiting básico
- [x] Detección de herramientas maliciosas
- [x] Logs de seguridad
- [x] Validaciones en tiempo real
- [x] Headers de seguridad
- [x] Pruebas automatizadas de seguridad

#### **🔄 En Desarrollo**
- [ ] Rate limiting avanzado con Redis
- [ ] Blacklist de IPs maliciosas
- [ ] Monitoreo en tiempo real
- [ ] Alertas automáticas
- [ ] Auditoría de seguridad

#### **📋 Pendiente**
- [ ] Certificados SSL/TLS
- [ ] CORS configurado
- [ ] Helmet.js para headers de seguridad
- [ ] Validación de CSRF tokens
- [ ] Encriptación de datos sensibles

### 🚨 **Vectores de Ataque Cubiertos**

1. **SQL Injection** ✅
   - Parámetros preparados
   - Validación de entrada
   - Escape de caracteres

2. **XSS (Cross-Site Scripting)** ✅
   - Sanitización de entrada
   - Escape de HTML
   - Validación de headers

3. **CSRF (Cross-Site Request Forgery)** 🔄
   - Tokens JWT
   - Validación de origen

4. **Brute Force** ✅
   - Rate limiting
   - Logs de intentos fallidos

5. **Session Hijacking** ✅
   - JWT con expiración
   - Tokens seguros

6. **Information Disclosure** ✅
   - Logs sin datos sensibles
   - Mensajes de error genéricos

### 📚 **Recursos de Seguridad**

#### **Documentación**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practices-security.html)

#### **Herramientas de Prueba**
- [sqlmap](https://sqlmap.org/) - Detección de SQL injection
- [nikto](https://cirt.net/Nikto2) - Scanner de vulnerabilidades web
- [OWASP ZAP](https://owasp.org/www-project-zap/) - Proxy de seguridad

### 🔧 **Configuración de Producción**

#### **Variables de Entorno Requeridas**
```env
JWT_SECRET=tu_secreto_super_seguro_para_produccion
DB_PASSWORD=contraseña_segura_de_base_de_datos
NODE_ENV=production
```

#### **Headers de Seguridad Recomendados**
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### 📞 **Contacto de Seguridad**

Para reportar vulnerabilidades de seguridad:
- Email: security@psyche.cl
- GitHub Issues: [Reportar vulnerabilidad](https://github.com/tu-usuario/centro-terapeutico-psyche/issues)

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0
**Mantenido por**: Equipo de Desarrollo Psyche 