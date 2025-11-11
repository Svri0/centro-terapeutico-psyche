import 'dotenv/config';
import { enviarEmail } from '../src/utilidades/email.service';

async function main() {
  try {
    const ok = await enviarEmail({
      to: 'Baironcod89@gmail.com',
      subject: 'Prueba Recordatorio',
      html: '<p>Correo de prueba desde el script.</p>',
    });

    console.log('Resultado envío:', ok);
  } catch (error) {
    console.error('Error en script:', error);
  }
}

main().then(() => process.exit(0));

