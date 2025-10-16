import express, { Router } from 'express';
import {
  obtenerDisponibilidadMensual,
  crearDisponibilidadMensual,
  actualizarDisponibilidadMensual,
  actualizarDisponibilidadMensualMultiple,
  eliminarDisponibilidadMensual,
  verificarDisponibilidadFecha,
  generarDisponibilidadRecurrente
} from '../controladores/disponibilidadMensual.controlador';
import { verificarToken, verificarRol } from '../middleware/auth.middleware';

const router = Router();

// Rutas para psicólogos y pacientes
router.get('/psicologo/:psicologoId', verificarToken, verificarRol(['psicologo', 'admin', 'paciente']), obtenerDisponibilidadMensual);
router.post('/', verificarToken, verificarRol(['psicologo', 'admin']), crearDisponibilidadMensual);
router.put('/:id', verificarToken, verificarRol(['psicologo', 'admin']), actualizarDisponibilidadMensual);
router.put('/psicologo/:psicologoId', verificarToken, verificarRol(['psicologo', 'admin']), actualizarDisponibilidadMensualMultiple);
router.delete('/:id', verificarToken, verificarRol(['psicologo', 'admin']), eliminarDisponibilidadMensual);

// Ruta para generar disponibilidad recurrente
router.post('/psicologo/:psicologoId/recurrente', verificarToken, verificarRol(['psicologo', 'admin']), generarDisponibilidadRecurrente);

// Ruta para verificar disponibilidad (pueden usar pacientes y psicólogos)
router.get('/verificar/:psicologoId', verificarToken, verificarRol(['psicologo', 'admin', 'paciente']), verificarDisponibilidadFecha);

export default router;
