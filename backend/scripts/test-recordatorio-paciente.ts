import 'dotenv/config';
import { RecordatoriosTareasService } from '../src/servicios/recordatorios-tareas.service';

async function main() {
  const pacienteId = process.argv[2];
  if (!pacienteId) {
    console.error('Debe proporcionar un ID de paciente');
    process.exit(1);
  }

  const enviado = await RecordatoriosTareasService.enviarRecordatorioPaciente(pacienteId);
  console.log('Resultado enviarRecordatorioPaciente:', enviado);
}

main().then(() => process.exit(0));

