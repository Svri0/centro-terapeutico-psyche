import request from 'supertest';
import app from '../src/servidor';

describe('API de Administrador - Gestión de Psicólogos', () => {
  const baseUrl = '/api/v1/admin';
  let adminToken: string;
  let psicologoId: string;

  beforeAll(async () => {
    // TODO: Obtener token de administrador válido para las pruebas
    adminToken = 'token_simulado_para_pruebas';
  });

  describe('Autenticación y Autorización', () => {
    it('debería rechazar acceso sin token', async () => {
      const response = await request(app)
        .get(`${baseUrl}/psicologos`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.codigo).toBe('AUTH_101');
    });

    it('debería rechazar acceso con token inválido', async () => {
      const response = await request(app)
        .get(`${baseUrl}/psicologos`)
        .set('Authorization', 'Bearer token_invalido')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.codigo).toBe('AUTH_102');
    });

    it('debería rechazar acceso sin permisos de administrador', async () => {
      // TODO: Implementar prueba con token de usuario no administrador
      const response = await request(app)
        .get(`${baseUrl}/psicologos`)
        .set('Authorization', 'Bearer token_usuario_normal')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.codigo).toBe('AUTH_105');
    });
  });

  describe('Obtener Psicólogos', () => {
    it('debería obtener lista de psicólogos', async () => {
      const response = await request(app)
        .get(`${baseUrl}/psicologos`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.codigo).toBe('ADMIN_001');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('debería obtener psicólogo por ID válido', async () => {
      // TODO: Usar ID real de psicólogo existente
      const response = await request(app)
        .get(`${baseUrl}/psicologos/${psicologoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.codigo).toBe('ADMIN_010');
      expect(response.body.data.id).toBe(psicologoId);
    });

    it('debería rechazar ID inválido', async () => {
      const response = await request(app)
        .get(`${baseUrl}/psicologos/id-invalido`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.codigo).toBe('VAL_006');
    });
  });

  describe('Crear Psicólogo', () => {
    it('debería crear psicólogo con datos válidos', async () => {
      const psicologoData = {
        nombres: 'Ana María',
        apellidos: 'López García',
        email: 'ana.lopez@terapia.cl',
        password: 'ContraseñaSegura123!',
        telefono: '+56911223344',
        fecha_nacimiento: '1988-12-05',
        genero: 'femenino'
      };

      const response = await request(app)
        .post(`${baseUrl}/psicologos`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(psicologoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.codigo).toBe('ADMIN_007');
      expect(response.body.data.usuario.email).toBe(psicologoData.email);
      expect(response.body.data.token_activacion).toBeDefined();

      // Guardar ID para pruebas posteriores
      psicologoId = response.body.data.usuario.id;
    });

    it('debería rechazar datos faltantes', async () => {
      const psicologoData = {
        nombres: 'Ana María',
        // Faltan apellidos, email y password
      };

      const response = await request(app)
        .post(`${baseUrl}/psicologos`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(psicologoData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.codigo).toBe('VAL_001');
      expect(response.body.data.errores).toContain('Apellidos debe tener al menos 2 caracteres');
      expect(response.body.data.errores).toContain('Email es requerido');
      expect(response.body.data.errores).toContain('Contraseña es requerida');
    });

    it('debería rechazar email inválido', async () => {
      const psicologoData = {
        nombres: 'Ana María',
        apellidos: 'López García',
        email: 'email-invalido',
        password: 'ContraseñaSegura123!'
      };

      const response = await request(app)
        .post(`${baseUrl}/psicologos`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(psicologoData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.codigo).toBe('VAL_001');
      expect(response.body.data.errores).toContain('Formato de email inválido');
    });

    it('debería rechazar contraseña muy corta', async () => {
      const psicologoData = {
        nombres: 'Ana María',
        apellidos: 'López García',
        email: 'ana.lopez@terapia.cl',
        password: '123'
      };

      const response = await request(app)
        .post(`${baseUrl}/psicologos`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(psicologoData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.codigo).toBe('VAL_001');
      expect(response.body.data.errores).toContain('Contraseña debe tener al menos 8 caracteres');
    });

    it('debería rechazar email duplicado', async () => {
      const psicologoData = {
        nombres: 'Otro Usuario',
        apellidos: 'Apellido',
        email: 'ana.lopez@terapia.cl', // Email ya existente
        password: 'ContraseñaSegura123!'
      };

      const response = await request(app)
        .post(`${baseUrl}/psicologos`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(psicologoData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.codigo).toBe('ADMIN_005');
    });
  });

  describe('Actualizar Psicólogo', () => {
    it('debería actualizar psicólogo con datos válidos', async () => {
      const updateData = {
        telefono: '+56999887766',
        email: 'ana.lopez.nueva@terapia.cl'
      };

      const response = await request(app)
        .put(`${baseUrl}/psicologos/${psicologoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.codigo).toBe('ADMIN_016');
      expect(response.body.data.campos_actualizados).toBe(2);
    });

    it('debería rechazar actualización con email inválido', async () => {
      const updateData = {
        email: 'email-invalido'
      };

      const response = await request(app)
        .put(`${baseUrl}/psicologos/${psicologoId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.codigo).toBe('VAL_003');
      expect(response.body.data.errores).toContain('Formato de email inválido');
    });

    it('debería rechazar ID inexistente', async () => {
      const updateData = {
        telefono: '+56999887766'
      };

      const response = await request(app)
        .put(`${baseUrl}/psicologos/uuid-inexistente`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.codigo).toBe('ADMIN_012');
    });
  });

  describe('Desactivar Psicólogo', () => {
    it('debería desactivar psicólogo activo', async () => {
      const response = await request(app)
        .patch(`${baseUrl}/psicologos/${psicologoId}/desactivar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.codigo).toBe('ADMIN_020');
      expect(response.body.data.estado).toBe('desactivado');
    });

    it('debería rechazar desactivar psicólogo ya desactivado', async () => {
      const response = await request(app)
        .patch(`${baseUrl}/psicologos/${psicologoId}/desactivar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.codigo).toBe('ADMIN_019');
    });
  });

  describe('Reactivar Psicólogo', () => {
    it('debería reactivar psicólogo desactivado', async () => {
      const response = await request(app)
        .patch(`${baseUrl}/psicologos/${psicologoId}/reactivar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.codigo).toBe('ADMIN_024');
      expect(response.body.data.estado).toBe('activado');
    });

    it('debería rechazar reactivar psicólogo ya activo', async () => {
      const response = await request(app)
        .patch(`${baseUrl}/psicologos/${psicologoId}/reactivar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.codigo).toBe('ADMIN_023');
    });
  });
}); 