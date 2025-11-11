import 'dotenv/config';
import { RecordatoriosTareasService } from '../src/servicios/recordatorios-tareas.service';
import '../src/modelos';

async function main() {
  const resultado = await RecordatoriosTareasService.enviarRecordatoriosTareas();
  console.log('Resultado servicio:', resultado);
}

main().then(() => process.exit(0));

