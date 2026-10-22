// Datos del local. PUT /api/store-info hace upsert sobre la fila unica (id=1).
// El horario es un campo Json en la base; aca se edita como filas
// "etiqueta / horario" para no obligar a nadie a escribir JSON a mano, y se
// guarda siempre como arreglo [{ label, value }] (ver lib/horario.js).

import { useEffect, useState } from 'react';
import { get, put } from '../../lib/api';
import { CabeceraPanel, CuerpoPanel } from '../../layouts/LayoutPanel';
import { Cargando } from '../../componentes/Estados';
import { invalidarStoreInfo } from '../../lib/useStoreInfo';
import { useToast } from '../../lib/toast';
import { mensajeDeError } from '../../lib/formato';
import { normalizarHorario } from '../../lib/horario';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// cada fila lleva un id propio para que React no confunda filas al borrar una
let proximoId = 1;
const nuevaFila = (label = '', value = '') => ({ id: proximoId++, label, value });

const estiloInputFila = {
  flex: 1,
  minWidth: 0,
  background: '#fff',
  border: '1px solid var(--borde-fuerte)',
  borderRadius: 'var(--r-control)',
  padding: '10px 12px',
  fontSize: 14,
};

const CAMPOS = [
  { k: 'nombre', label: 'Nombre del local', req: true, ph: 'Nombre del local' },
  { k: 'direccion', label: 'Dirección', req: true, ph: 'Calle 1234, Barrio, Ciudad' },
  { k: 'telefono', label: 'Teléfono', ph: '11 5555-0142' },
  { k: 'email', label: 'Email', tipo: 'email', ph: 'hola@bsideclub.com' },
  { k: 'instagram', label: 'Instagram', ph: '@bsideclub' },
  { k: 'whatsapp', label: 'WhatsApp', ph: '5491155550142' },
];

export default function InfoLocal() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [horario, setHorario] = useState([]);
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
        // el horario puede venir null, como arreglo o con la forma vieja de
        // objeto: normalizarHorario lo deja siempre como arreglo
        const filas = normalizarHorario(info?.horario).map((f) => nuevaFila(f.label, f.value));
        setHorario(filas.length ? filas : DIAS.map((d) => nuevaFila(d)));
      })
      .catch(() => {
        // todavia no hay fila cargada: arrancamos con el formulario vacio
        setHorario(DIAS.map((d) => nuevaFila(d)));
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

  function editarFila(id, clave, valor) {
    setHorario((h) => h.map((f) => (f.id === id ? { ...f, [clave]: valor } : f)));
  }

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

    // sacamos las filas incompletas para no guardar basura en el Json
    const horarioLimpio = horario
      .map((f) => ({ label: f.label.trim(), value: f.value.trim() }))
      .filter((f) => f.label && f.value);

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
                  {c.k === 'direccion' && !errores.direccion && (
                    <div className="campo-ayuda">
                      Separada por comas: calle, barrio y ciudad. El barrio se usa en todo el sitio (el hero,
                      Nosotros, el título de la pestaña y los mails).
                    </div>
                  )}
                  {c.k === 'whatsapp' && !errores.whatsapp && (
                    <div className="campo-ayuda">
                      Como lo escribirías en el celular. Si no tiene código de país, se toma Argentina (+54 9).
                    </div>
                  )}
                </div>
              ))}

              <div className="campo">
                <label htmlFor="si-desc">Descripción del local</label>
                <textarea
                  id="si-desc"
                  value={form.description}
                  onChange={(e) => campo('description', e.target.value)}
                  placeholder="Disquería de barrio. Discos nuevos o usados con garantía de calidad."
                  style={{ minHeight: 90 }}
                />
                <div className="campo-ayuda">Se muestra en el pie del sitio y en Nosotros.</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="etiqueta">Horarios de atención</div>
            <p style={{ color: 'var(--meta)', fontSize: 13, margin: '0 0 16px' }}>
              Se muestra en el orden de la lista. Podés agrupar días (&quot;Miér a Vie&quot;) o
              escribir &quot;Cerrado&quot;. Las filas incompletas no se guardan.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {horario.map((fila) => (
                <div key={fila.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    aria-label="Día o días"
                    value={fila.label}
                    onChange={(e) => editarFila(fila.id, 'label', e.target.value)}
                    placeholder="Martes"
                    style={{ ...estiloInputFila, width: 130, flex: 'none' }}
                  />
                  <input
                    aria-label={`Horario de ${fila.label || 'esta fila'}`}
                    value={fila.value}
                    onChange={(e) => editarFila(fila.id, 'value', e.target.value)}
                    placeholder="13 a 20 hs"
                    style={estiloInputFila}
                  />
                  <button
                    type="button"
                    className="btn btn-peligro btn-chico"
                    aria-label={`Quitar la fila ${fila.label}`}
                    onClick={() => setHorario((h) => h.filter((f) => f.id !== fila.id))}
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn-enlace"
              style={{ marginTop: 12 }}
              onClick={() => setHorario((h) => [...h, nuevaFila()])}
            >
              + Agregar fila
            </button>

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
