import 'dotenv/config';
import Tarea from '../src/modelos/Tarea';
import Paciente from '../src/modelos/Paciente';

async function main() {
  const tareas = await Tarea.findAll();
  for (const tarea of tareas) {
    const paciente = await Paciente.findByPk(tarea.paciente_id);
    console.log({
      id: tarea.id,
      paciente_id: tarea.paciente_id,
      paciente_email: paciente?.email,
      paciente_estado: paciente?.estado,
      titulo: tarea.titulo,
      estado: tarea.estado,
      es_borrador: tarea.es_borrador,
      fecha_vencimiento: tarea.fecha_vencimiento,
    });
  }
  process.exit(0);
}

main();

