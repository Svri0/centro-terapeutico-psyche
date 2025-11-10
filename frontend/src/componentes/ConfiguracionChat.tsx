import React, { useEffect, useState } from 'react';
import { configuracionService } from '../servicios/configuracion.service';

const ConfiguracionChat: React.FC = () => {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [respuestasDesactivadas, setRespuestasDesactivadas] = useState(false);
  const [tokensHabilitados, setTokensHabilitados] = useState(false);
  const [tokensPorDefecto, setTokensPorDefecto] = useState<number>(0);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);
        const configuraciones = await configuracionService.listar('chat');
        const byClave = (clave: string) => configuraciones.find(c => c.clave === clave);
        setRespuestasDesactivadas(byClave('chat.respuestas_pacientes_desactivadas')?.valor === 'true');
        setTokensHabilitados(byClave('chat.tokens_mensajes_habilitados')?.valor === 'true');
        setTokensPorDefecto(parseInt(byClave('chat.tokens_mensajes_por_defecto')?.valor || '0', 10));
      } catch (e: any) {
        setError(e?.message || 'Error al cargar configuraciones');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const guardar = async () => {
    try {
      setGuardando(true);
      setError(null);

      const upsert = async (clave: string, valor: string, tipo: 'boolean' | 'number' | 'string' | 'json', descripcion: string) => {
        try {
          await configuracionService.actualizar(clave, { valor });
        } catch (e: any) {
          // Si no existe, creamos
          await configuracionService.crear({
            clave,
            valor,
            descripcion,
            tipo,
            categoria: 'chat',
            activo: true
          });
        }
      };

      await upsert(
        'chat.respuestas_pacientes_desactivadas',
        String(respuestasDesactivadas),
        'boolean',
        'Desactiva que los pacientes puedan enviar mensajes en el chat'
      );

      await upsert(
        'chat.tokens_mensajes_habilitados',
        String(tokensHabilitados),
        'boolean',
        'Habilita sistema de tokens para limitar respuestas de pacientes'
      );

      await upsert(
        'chat.tokens_mensajes_por_defecto',
        String(tokensPorDefecto),
        'number',
        'Cantidad de tokens por defecto asignada a pacientes'
      );

      alert('Configuración guardada');
    } catch (e: any) {
      setError(e?.message || 'Error al guardar configuraciones');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="p-4 text-gray-600">Cargando configuración...</div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Configuración de Chat</h3>

      {error && (
        <div className="mb-3 text-red-600 text-sm">{error}</div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Desactivar respuestas de pacientes</p>
            <p className="text-sm text-gray-600">Bloquea que los pacientes envíen mensajes</p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={respuestasDesactivadas}
              onChange={(e) => setRespuestasDesactivadas(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-amber-500 transition-colors"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Habilitar tokens de mensajes</p>
            <p className="text-sm text-gray-600">Limita la cantidad de respuestas de pacientes</p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={tokensHabilitados}
              onChange={(e) => setTokensHabilitados(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-2 00 rounded-full peer peer-checked:bg-amber-500 transition-colors"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Tokens por defecto</p>
            <p className="text-sm text-gray-600">Cantidad asignada al crear un paciente</p>
          </div>
          <input
            type="number"
            value={tokensPorDefecto}
            onChange={(e) => setTokensPorDefecto(parseInt(e.target.value || '0', 10))}
            className="w-24 px-2 py-1 border border-gray-300 rounded-md"
            min={0}
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={guardar}
          disabled={guardando}
          className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
};

export default ConfiguracionChat;


