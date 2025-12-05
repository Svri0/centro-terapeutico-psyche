import { Router } from 'express';
import { crearSolicitudConsulta } from '../controladores/solicitudes-publicas.controlador';

const router = Router();

// Ruta pública para crear solicitud de consulta desde el homepage
// NO requiere autenticación
router.post('/solicitud-consulta', crearSolicitudConsulta);

export default router;

