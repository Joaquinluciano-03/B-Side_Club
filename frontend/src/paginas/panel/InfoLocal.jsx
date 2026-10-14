// Datos del local. PUT /api/store-info hace upsert sobre la fila unica (id=1).
// El horario es un campo Json en la base; aca se edita como pares dia/horario
// para no obligar a nadie a escribir JSON a mano.

import { useEffect, useState } from 'react';
import { get, put } from '../../lib/api';
import { CabeceraPanel, CuerpoPanel } from '../../layouts/LayoutPanel';
import { Cargando } from '../../componentes/Estados';
import { invalidarStoreInfo } from '../../lib/useStoreInfo';
import { useToast } from '../../lib/toast';
import { mensajeDeError } from '../../lib/formato';

const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

const CAMPOS = [
  { k: 'nombre', label: 'Nombre del local', req: true, ph: 'B-Side Club' },
  { k: 'direccion', label: 'Dirección', req: true, ph: 'Av. Corrientes 1234, Chacarita' },
  { k: 'telefono', label: 'Teléfono', ph: '11 5555-0142' },
  { k: 'email', label: 'Email', tipo: 'email', ph: 'hola@bsideclub.com' },
  { k: 'instagram', label: 'Instagram', ph: '@bsideclub' },
  { k: 'whatsapp', label: 'WhatsApp', ph: '5491155550142' },
];

export default function InfoLocal() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [horario, setHorario] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    get('/store-info')
      .then((info) => {
        setForm({
          nombre: info?.nombre ?? '',
          direccion: info?.direccion ?? '',
          telefono: info?.telefono ?? '',
          email: info?.email ?? '',
          instagram: info?.instagram ?? '',
          whatsapp: info?.whatsapp ?? '',
          description: info?.description ?? '',
        });
        // el horario puede venir null o con una forma vieja: solo tomamos
        // los pares que son texto, el resto se ignora
        const h = {};
        if (info?.horario && typeof info.horario === 'object') {
          for (const [dia, hs] of Object.entries(info.horario)) h[dia] = String(hs);
        }
        setHorario(h);
      })
      .catch(() => {
        // todavia no hay fila cargada: arrancamos con el formulario vacio
        setForm({
          nombre: '',
          direccion: '',
          telefono: '',
          email: '',
          instagram: '',
          whatsapp: '',
          description: '',
        });
      });
  }, []);

  function campo(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errores[k]) setErrores((e) => ({ ...e, [k]: null }));
  }

  async function guardar(ev) {
    ev.preventDefault();

    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido.';
    if (!form.direccion.trim()) e.direccion = 'Requerido.';
    setErrores(e);
    if (Object.keys(e).length) return;

    // sacamos los dias que quedaron vacios para no guardar basura en el Json
    const horarioLimpio = Object.fromEntries(
      Object.entries(horario).filter(([, hs]) => hs && hs.trim())
    );

    setGuardando(true);
    try {
      const guardada = await put('/store-info', {
        nombre: form.nombre.trim(),
        direccion: form.direccion.trim(),
        telefono: form.telefono.trim() || null,
        email: form.email.trim() || null,
        instagram: form.instagram.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        description: form.description.trim() || null,
        horario: horarioLimpio,
      });
      // el footer y las paginas publicas tienen la info cacheada: la refrescamos
      invalidarStoreInfo(guardada);
      toast.exito('Datos actualizados. Ya se ven en el sitio público.');
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  if (!form) return <Cargando />;

  return (
    <>
      <CabeceraPanel kicker="Institucional" titulo="INFO DEL LOCAL" />
      <CuerpoPanel>
        <form
          onSubmit={guardar}
          noValidate
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 18,
            alignItems: 'start',
          }}
        >
          <div className="card">
            <div className="etiqueta">Datos de contacto</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {CAMPOS.map((c) => (
                <div key={c.k} className={`campo ${errores[c.k] ? 'con-error' : ''}`}>
                  <label htmlFor={`si-${c.k}`}>
                    {c.label}
                    {c.req ? '' : ' (opcional)'}
                  </label>
                  <input
                    id={`si-${c.k}`}
                    type={c.tipo || 'text'}
                    value={form[c.k]}
                    onChange={(e) => campo(c.k, e.target.value)}
                    placeholder={c.ph}
                  />
                  {errores[c.k] && <div className="campo-error">{errores[c.k]}</div>}
                  {c.k === 'whatsapp' && !errores.whatsapp && (
                    <div className="campo-ayuda">Con código de país, sin espacios ni símbolos.</div>
                  )}
                </div>
              ))}

              <div className="campo">
                <label htmlFor="si-desc">Descripción del local</label>
                <textarea
                  id="si-desc"
                  value={form.description}
                  onChange={(e) => campo('description', e.target.value)}
                  placeholder="Disquería en Chacarita. Escuchamos todo antes de vender."
                  style={{ minHeight: 90 }}
                />
                <div className="campo-ayuda">Se muestra en el pie del sitio y en Nosotros.</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="etiqueta">Horarios de atención</div>
            <p style={{ color: 'var(--meta)', fontSize: 13, margin: '0 0 16px' }}>
              Dejá vacío el día que no abren.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DIAS.map((dia) => (
                <div key={dia} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      letterSpacing: '.14em',
                      color: 'var(--meta)',
                      width: 90,
                      flexShrink: 0,
                      textTransform: 'uppercase',
                    }}
                  >
                    {dia}
                  </span>
                  <input
                    aria-label={`Horario de ${dia}`}
                    value={horario[dia] || ''}
                    onChange={(e) => setHorario((h) => ({ ...h, [dia]: e.target.value }))}
                    placeholder="13 a 20 hs"
                    style={{
                      flex: 1,
                      background: '#fff',
                      border: '1px solid var(--borde-fuerte)',
                      borderRadius: 'var(--r-control)',
                      padding: '10px 12px',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-primario"
              disabled={guardando}
              style={{ marginTop: 22, width: '100%' }}
            >
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </CuerpoPanel>
    </>
  );
}
