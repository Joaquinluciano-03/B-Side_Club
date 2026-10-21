// Promociones y novedades. Es lo que se muestra en la banda de la home.
// Tienen vigencia opcional: si no se cargan fechas, la promo vale mientras
// este activa.

import { useEffect, useState } from 'react';
import { get, post, put, del } from '../../lib/api';
import { CabeceraPanel, CuerpoPanel } from '../../layouts/LayoutPanel';
import { Cargando, ErrorCarga, Vacio } from '../../componentes/Estados';
import Confirmar from '../../componentes/Confirmar';
import { useToast } from '../../lib/toast';
import { formatearDia, mensajeDeError } from '../../lib/formato';
import { estadoVigencia } from '../../lib/promociones';

const MAX_MB = 5; // mismo limite que el backend (config/multer.js)

const VACIA = {
  titulo: '',
  descripcion: '',
  imagenUrl: '',
  fechaInicio: '',
  fechaFin: '',
  activa: true,
};

// la base guarda DateTime y el <input type="date"> quiere "YYYY-MM-DD"
function aInputDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function Promociones() {
  const toast = useToast();

  const [promociones, setPromociones] = useState(null);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(null); // null | 'nueva' | id
  const [form, setForm] = useState(VACIA);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [aBorrar, setABorrar] = useState(null);
  const [recargar, setRecargar] = useState(0);
  const [archivo, setArchivo] = useState(null); // imagen elegida, se sube al guardar
  const [previa, setPrevia] = useState(null);

  // vista previa local del archivo elegido; se libera al cambiarlo
  useEffect(() => {
    if (!archivo) {
      setPrevia(null);
      return;
    }
    const url = URL.createObjectURL(archivo);
    setPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  useEffect(() => {
    setError(null);
    // sin ?soloActivas el panel las ve todas, incluidas las apagadas
    get('/promociones')
      .then(setPromociones)
      .catch((err) => setError(mensajeDeError(err)));
  }, [recargar]);

  function abrirNueva() {
    setEditando('nueva');
    setForm(VACIA);
    setArchivo(null);
    setErrores({});
  }

  function abrirEdicion(p) {
    setEditando(p.id);
    setArchivo(null);
    setForm({
      titulo: p.titulo ?? '',
      descripcion: p.descripcion ?? '',
      imagenUrl: p.imagenUrl ?? '',
      fechaInicio: aInputDate(p.fechaInicio),
      fechaFin: aInputDate(p.fechaFin),
      activa: p.activa !== false,
    });
    setErrores({});
  }

  function campo(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errores[k]) setErrores((e) => ({ ...e, [k]: null }));
  }

  async function guardar(ev) {
    ev.preventDefault();

    const e = {};
    if (!form.titulo.trim()) e.titulo = 'Requerido.';
    // una promo que termina antes de empezar no se mostraria nunca
    if (form.fechaInicio && form.fechaFin && form.fechaFin < form.fechaInicio) {
      e.fechaFin = 'La fecha de fin es anterior a la de inicio.';
    }
    setErrores(e);
    if (Object.keys(e).length) return;

    const cuerpo = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim() || null,
      imagenUrl: form.imagenUrl.trim() || null,
      fechaInicio: form.fechaInicio || null,
      fechaFin: form.fechaFin || null,
      activa: form.activa,
    };

    setGuardando(true);
    try {
      const guardada =
        editando === 'nueva'
          ? await post('/promociones', cuerpo)
          : await put(`/promociones/${editando}`, cuerpo);

      // la imagen va en un segundo pedido (multipart) una vez que la promo
      // ya existe y tiene id. Si falla, los datos quedaron guardados igual.
      if (archivo) {
        const fd = new FormData();
        fd.append('imagen', archivo);
        try {
          await post(`/promociones/${guardada.id}/imagen`, fd);
        } catch (err) {
          toast.error(`Se guardó la promoción, pero no la imagen: ${mensajeDeError(err)}`);
          setEditando(null);
          setRecargar((r) => r + 1);
          return;
        }
      }

      toast.exito(editando === 'nueva' ? 'Promoción creada.' : 'Cambios guardados.');
      setEditando(null);
      setRecargar((r) => r + 1);
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  function elegirImagen(file) {
    setErrores((e) => ({ ...e, imagen: null }));
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      setErrores((e) => ({ ...e, imagen: `La imagen supera los ${MAX_MB} MB.` }));
      return;
    }
    setArchivo(file);
  }

  function quitarImagen() {
    setArchivo(null);
    campo('imagenUrl', '');
  }

  async function alternarActiva(p) {
    try {
      await put(`/promociones/${p.id}`, { activa: !p.activa });
      setPromociones((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, activa: !p.activa } : x))
      );
      toast.exito(p.activa ? 'Promoción apagada.' : 'Promoción encendida.');
    } catch (err) {
      toast.error(mensajeDeError(err));
    }
  }

  async function borrar() {
    const p = aBorrar;
    setABorrar(null);
    try {
      await del(`/promociones/${p.id}`);
      setPromociones((prev) => prev.filter((x) => x.id !== p.id));
      toast.exito(`"${p.titulo}" se eliminó.`);
    } catch (err) {
      toast.error(mensajeDeError(err));
    }
  }

  return (
    <>
      <CabeceraPanel
        kicker="Novedades"
        titulo="PROMOCIONES"
        accion={
          <button className="btn btn-primario btn-chico" onClick={abrirNueva}>
            + Nueva promoción
          </button>
        }
      />
      <CuerpoPanel>
        {editando !== null && (
          <form onSubmit={guardar} noValidate className="card" style={{ marginBottom: 18, maxWidth: 680 }}>
            <div className="etiqueta">
              {editando === 'nueva' ? 'Nueva promoción' : 'Editar promoción'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className={`campo ${errores.titulo ? 'con-error' : ''}`}>
                <label htmlFor="pr-titulo">Título</label>
                <input
                  id="pr-titulo"
                  value={form.titulo}
                  onChange={(e) => campo('titulo', e.target.value)}
                  placeholder="2x1 en cassettes todo noviembre"
                  autoFocus
                />
                {errores.titulo && <div className="campo-error">{errores.titulo}</div>}
              </div>

              <div className="campo">
                <label htmlFor="pr-desc">Descripción</label>
                <textarea
                  id="pr-desc"
                  value={form.descripcion}
                  onChange={(e) => campo('descripcion', e.target.value)}
                  placeholder="Contá de qué se trata y hasta cuándo vale."
                  style={{ minHeight: 90 }}
                />
              </div>

              <div className={`campo ${errores.imagen ? 'con-error' : ''}`}>
                <label htmlFor="pr-img">Imagen</label>
                {(previa || form.imagenUrl) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <img
                      src={previa || form.imagenUrl}
                      alt="Vista previa de la imagen de la promoción"
                      style={{
                        width: 120,
                        height: 68,
                        objectFit: 'cover',
                        borderRadius: 'var(--r-control)',
                        border: '1px solid var(--borde)',
                      }}
                    />
                    <button type="button" className="btn btn-peligro btn-chico" onClick={quitarImagen}>
                      Quitar imagen
                    </button>
                  </div>
                )}
                <input
                  id="pr-img"
                  type="file"
                  accept="image/*"
                  onChange={(e) => elegirImagen(e.target.files?.[0])}
                />
                {errores.imagen ? (
                  <div className="campo-error">{errores.imagen}</div>
                ) : (
                  <div className="campo-ayuda">
                    Opcional, hasta {MAX_MB} MB. Si no subís ninguna, la banda usa el fondo con la
                    trama del sitio.
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="campo">
                  <label htmlFor="pr-desde">Desde</label>
                  <input
                    id="pr-desde"
                    type="date"
                    value={form.fechaInicio}
                    onChange={(e) => campo('fechaInicio', e.target.value)}
                  />
                </div>
                <div className={`campo ${errores.fechaFin ? 'con-error' : ''}`}>
                  <label htmlFor="pr-hasta">Hasta</label>
                  <input
                    id="pr-hasta"
                    type="date"
                    value={form.fechaFin}
                    onChange={(e) => campo('fechaFin', e.target.value)}
                  />
                  {errores.fechaFin && <div className="campo-error">{errores.fechaFin}</div>}
                </div>
              </div>
              <div className="campo-ayuda" style={{ marginTop: -6 }}>
                Las dos fechas son opcionales: sin fechas, la promo vale mientras esté encendida.
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.activa}
                  onChange={(e) => campo('activa', e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--naranja)' }}
                />
                <span style={{ fontSize: 14, fontWeight: 700 }}>Encendida (se ve en el sitio)</span>
              </label>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primario btn-chico" disabled={guardando}>
                  {guardando ? 'Guardando…' : 'Guardar'}
                </button>
                <button
                  type="button"
                  className="btn btn-secundario btn-chico"
                  onClick={() => setEditando(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}

        {error ? (
          <ErrorCarga mensaje={error} onReintentar={() => setRecargar((r) => r + 1)} />
        ) : !promociones ? (
          <Cargando />
        ) : promociones.length === 0 ? (
          <Vacio
            titulo="SIN PROMOCIONES"
            texto="Creá una para que aparezca en la banda de novedades de la home."
          >
            <button className="btn btn-primario" onClick={abrirNueva}>
              Crear la primera
            </button>
          </Vacio>
        ) : (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  {/* la descripcion puede ser larga: le ponemos techo para que
                      la columna de acciones no se vaya fuera de pantalla */}
                  <th style={{ maxWidth: 340 }}>Promoción</th>
                  <th>Vigencia</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {promociones.map((p) => {
                  const vig = estadoVigencia(p);
                  return (
                    <tr key={p.id} style={{ opacity: p.activa ? 1 : 0.55 }}>
                      <td style={{ maxWidth: 340 }}>
                        <div style={{ fontWeight: 700 }}>{p.titulo}</div>
                        {p.descripcion && (
                          <div
                            style={{
                              color: 'var(--meta)',
                              fontSize: 12,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {p.descripcion}
                          </div>
                        )}
                      </td>
                      {/* el mono con tracking ancho hacia que esta columna se
                          comiera la fila entera y empujara las acciones afuera */}
                      <td
                        style={{
                          fontFamily: 'var(--mono)',
                          fontSize: 11,
                          color: 'var(--tinta-tenue)',
                          lineHeight: 1.6,
                        }}
                      >
                        {p.fechaInicio || p.fechaFin ? (
                          <>
                            <div>{p.fechaInicio ? formatearDia(p.fechaInicio) : 'sin inicio'}</div>
                            <div>→ {p.fechaFin ? formatearDia(p.fechaFin) : 'sin fin'}</div>
                          </>
                        ) : (
                          'Sin fechas'
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${vig.badge}`}>{vig.label}</span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            gap: 6,
                            justifyContent: 'flex-end',
                            flexWrap: 'wrap',
                            minWidth: 230,
                          }}
                        >
                          <button
                            className="btn btn-secundario btn-chico"
                            onClick={() => abrirEdicion(p)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-secundario btn-chico"
                            onClick={() => alternarActiva(p)}
                          >
                            {p.activa ? 'Apagar' : 'Encender'}
                          </button>
                          <button className="btn btn-peligro btn-chico" onClick={() => setABorrar(p)}>
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Confirmar
          abierto={Boolean(aBorrar)}
          titulo="¿Borrar la promoción?"
          texto={`"${aBorrar?.titulo}" se elimina y no se puede deshacer. Si solo querés sacarla del sitio, usá "Apagar".`}
          onConfirmar={borrar}
          onCancelar={() => setABorrar(null)}
        />
      </CuerpoPanel>
    </>
  );
}
