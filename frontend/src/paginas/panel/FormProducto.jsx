// Alta y edicion de producto. Sirve para las dos cosas: si hay :id en la URL
// edita, si no crea. Las imagenes se suben aparte (POST /productos/:id/imagenes)
// porque necesitan un producto ya existente al que colgarse.

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { get, post, put, patch, del, api, urlImagen } from '../../lib/api';
import { CabeceraPanel, CuerpoPanel } from '../../layouts/LayoutPanel';
import { Cargando } from '../../componentes/Estados';
import Confirmar from '../../componentes/Confirmar';
import { useToast } from '../../lib/toast';
import { ESTADOS_STOCK, etiquetaStock, mensajeDeError } from '../../lib/formato';

const VACIO = {
  nombre: '',
  anio: '',
  precio: '',
  stock: '1',
  estado_stock: 'disponible',
  condicion: '',
  descripcion: '',
  categoriaId: '',
  destacado: false,
  esActivo: true,
};

const MAX_IMAGENES = 5;
const MAX_MB = 5;

export default function FormProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const editando = Boolean(id);

  const [form, setForm] = useState(VACIO);
  const [categorias, setCategorias] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  const [cargando, setCargando] = useState(editando);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [errores, setErrores] = useState({});
  const [imagenABorrar, setImagenABorrar] = useState(null);

  useEffect(() => {
    get('/categorias')
      .then(setCategorias)
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    if (!editando) return;
    get(`/productos/${id}`)
      .then((p) => {
        setForm({
          nombre: p.nombre ?? '',
          anio: p.anio ?? '',
          // precio es Decimal: llega como string, y el input lo quiere como string igual
          precio: p.precio ?? '',
          stock: String(p.stock ?? 0),
          estado_stock: p.estado_stock ?? 'disponible',
          condicion: p.condicion ?? '',
          descripcion: p.descripcion ?? '',
          categoriaId: String(p.categoriaId ?? ''),
          destacado: Boolean(p.destacado),
          esActivo: p.esActivo !== false,
        });
        setImagenes(p.imagenes || []);
      })
      .catch((err) => toast.error(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }, [id, editando]);

  function campo(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errores[k]) setErrores((e) => ({ ...e, [k]: null }));
  }

  function validar() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido.';
    if (!form.descripcion.trim()) e.descripcion = 'Requerido.';
    if (!form.categoriaId) e.categoriaId = 'Elegí una categoría.';
    if (form.anio === '' || !Number.isFinite(Number(form.anio))) e.anio = 'Tiene que ser un número.';
    if (form.stock === '' || !Number.isFinite(Number(form.stock))) e.stock = 'Tiene que ser un número.';
    if (form.precio !== '' && !Number.isFinite(Number(form.precio)))
      e.precio = 'Tiene que ser un número, o vacío para "a consultar".';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function guardar(ev) {
    ev.preventDefault();
    if (!validar()) return;

    // precio vacio = "a consultar": se manda null, no "" ni 0
    const cuerpo = {
      nombre: form.nombre.trim(),
      anio: Number(form.anio),
      precio: form.precio === '' ? null : Number(form.precio),
      stock: Number(form.stock),
      estado_stock: form.estado_stock,
      condicion: form.condicion.trim() || null,
      descripcion: form.descripcion.trim(),
      categoriaId: Number(form.categoriaId),
      destacado: form.destacado,
      esActivo: form.esActivo,
    };

    setGuardando(true);
    try {
      if (editando) {
        await put(`/productos/${id}`, cuerpo);
        toast.exito('Cambios guardados.');
      } else {
        const creado = await post('/productos', cuerpo);
        toast.exito('Producto creado. Ahora podés subirle las fotos.');
        // vamos a la edicion para poder cargarle las fotos
        navigate(`/panel/productos/${creado.id}`, { replace: true });
      }
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  async function subirImagenes(ev) {
    const archivos = Array.from(ev.target.files || []);
    ev.target.value = ''; // permite volver a elegir el mismo archivo
    if (!archivos.length) return;

    // el backend acepta hasta 5 por tanda y 5 MB cada una: avisamos antes de
    // gastar el pedido y que vuelva un 400
    if (archivos.length > MAX_IMAGENES) {
      toast.error(`Se pueden subir hasta ${MAX_IMAGENES} imágenes por vez.`);
      return;
    }
    const pesada = archivos.find((a) => a.size > MAX_MB * 1024 * 1024);
    if (pesada) {
      toast.error(`"${pesada.name}" supera los ${MAX_MB} MB.`);
      return;
    }

    const fd = new FormData();
    archivos.forEach((a) => fd.append('imagenes', a));

    setSubiendo(true);
    try {
      const nuevas = await api(`/productos/${id}/imagenes`, { method: 'POST', body: fd });
      setImagenes((prev) => [...prev, ...nuevas]);
      toast.exito(`${nuevas.length} imagen(es) subidas.`);
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setSubiendo(false);
    }
  }

  async function borrarImagen() {
    const img = imagenABorrar;
    setImagenABorrar(null);
    try {
      await del(`/imagenes/${img.id}`);
      setImagenes((prev) => prev.filter((i) => i.id !== img.id));
    } catch (err) {
      toast.error(mensajeDeError(err));
    }
  }

  // la portada es la imagen de orden mas bajo: para cambiarla le damos un
  // orden menor a todas las demas
  async function hacerPortada(img) {
    const minimo = Math.min(...imagenes.map((i) => i.orden));
    if (img.orden === minimo) return;
    try {
      const actualizada = await patch(`/imagenes/${img.id}`, { orden: minimo - 1 });
      setImagenes((prev) =>
        [...prev.map((i) => (i.id === img.id ? actualizada : i))].sort((a, b) => a.orden - b.orden)
      );
    } catch (err) {
      toast.error(mensajeDeError(err));
    }
  }

  if (cargando) return <Cargando />;

  return (
    <>
      <CabeceraPanel
        kicker={editando ? 'Editar' : 'Nuevo'}
        titulo={editando ? form.nombre.toUpperCase() || 'PRODUCTO' : 'NUEVO PRODUCTO'}
        accion={
          <Link to="/panel/productos" className="btn btn-secundario btn-chico">
            Volver al listado
          </Link>
        }
      />
      <CuerpoPanel>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 18,
            alignItems: 'start',
          }}
        >
          {/* ---------- Datos ---------- */}
          <form onSubmit={guardar} noValidate className="card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className={`campo ${errores.nombre ? 'con-error' : ''}`}>
                <label htmlFor="p-nombre">Nombre</label>
                <input
                  id="p-nombre"
                  value={form.nombre}
                  onChange={(e) => campo('nombre', e.target.value)}
                  placeholder="The Dark Side of the Moon"
                />
                {errores.nombre && <div className="campo-error">{errores.nombre}</div>}
              </div>

              <div className={`campo ${errores.categoriaId ? 'con-error' : ''}`}>
                <label htmlFor="p-cat">Categoría</label>
                <select
                  id="p-cat"
                  value={form.categoriaId}
                  onChange={(e) => campo('categoriaId', e.target.value)}
                >
                  <option value="">Elegí una…</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                {errores.categoriaId && <div className="campo-error">{errores.categoriaId}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className={`campo ${errores.anio ? 'con-error' : ''}`}>
                  <label htmlFor="p-anio">Año</label>
                  <input
                    id="p-anio"
                    inputMode="numeric"
                    value={form.anio}
                    onChange={(e) => campo('anio', e.target.value)}
                    placeholder="1973"
                  />
                  {errores.anio && <div className="campo-error">{errores.anio}</div>}
                </div>

                <div className={`campo ${errores.stock ? 'con-error' : ''}`}>
                  <label htmlFor="p-stock">Stock</label>
                  <input
                    id="p-stock"
                    inputMode="numeric"
                    value={form.stock}
                    onChange={(e) => campo('stock', e.target.value)}
                  />
                  {errores.stock && <div className="campo-error">{errores.stock}</div>}
                </div>
              </div>

              <div className={`campo ${errores.precio ? 'con-error' : ''}`}>
                <label htmlFor="p-precio">Precio</label>
                <input
                  id="p-precio"
                  inputMode="decimal"
                  value={form.precio}
                  onChange={(e) => campo('precio', e.target.value)}
                  placeholder="145000"
                />
                {errores.precio ? (
                  <div className="campo-error">{errores.precio}</div>
                ) : (
                  <div className="campo-ayuda">Dejalo vacío para que figure como "a consultar".</div>
                )}
              </div>

              <div className="campo">
                <label htmlFor="p-estado">Disponibilidad</label>
                <select
                  id="p-estado"
                  value={form.estado_stock}
                  onChange={(e) => campo('estado_stock', e.target.value)}
                >
                  {ESTADOS_STOCK.map((e) => (
                    <option key={e} value={e}>
                      {etiquetaStock(e)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label htmlFor="p-cond">Condición</label>
                <input
                  id="p-cond"
                  value={form.condicion}
                  onChange={(e) => campo('condicion', e.target.value)}
                  placeholder="Muy bueno (VG+)"
                />
              </div>

              <div className={`campo ${errores.descripcion ? 'con-error' : ''}`}>
                <label htmlFor="p-desc">Descripción</label>
                <textarea
                  id="p-desc"
                  value={form.descripcion}
                  onChange={(e) => campo('descripcion', e.target.value)}
                  placeholder="Contá el estado real: si salta, si la tapa está gastada, qué trae…"
                />
                {errores.descripcion && <div className="campo-error">{errores.descripcion}</div>}
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.destacado}
                  onChange={(e) => campo('destacado', e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--naranja)' }}
                />
                <span style={{ fontSize: 14, fontWeight: 700 }}>Mostrar en destacados de la home</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.esActivo}
                  onChange={(e) => campo('esActivo', e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--naranja)' }}
                />
                <span style={{ fontSize: 14, fontWeight: 700 }}>Publicado en el catálogo</span>
              </label>

              <button type="submit" className="btn btn-primario" disabled={guardando}>
                {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </form>

          {/* ---------- Imagenes ---------- */}
          <div className="card">
            <div className="etiqueta">Imágenes</div>

            {!editando ? (
              <p style={{ color: 'var(--meta)', fontSize: 14, margin: 0 }}>
                Primero creá el producto. Después vas a poder subirle las fotos acá.
              </p>
            ) : (
              <>
                <p style={{ color: 'var(--meta)', fontSize: 13, margin: '0 0 16px' }}>
                  Hasta {MAX_IMAGENES} por vez, {MAX_MB} MB cada una. La primera es la portada.
                </p>

                <label
                  className="btn btn-secundario"
                  style={{ display: 'inline-block', marginBottom: 18, cursor: 'pointer' }}
                >
                  {subiendo ? 'Subiendo…' : '+ Subir imágenes'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={subirImagenes}
                    disabled={subiendo}
                    style={{ display: 'none' }}
                  />
                </label>

                {imagenes.length === 0 ? (
                  <div
                    style={{
                      border: '1px dashed var(--borde-fuerte)',
                      borderRadius: 'var(--r-control)',
                      padding: 28,
                      textAlign: 'center',
                      color: 'var(--meta)',
                      fontSize: 14,
                    }}
                  >
                    Sin fotos todavía. Mientras tanto el catálogo muestra el arte generado.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                      gap: 10,
                    }}
                  >
                    {[...imagenes]
                      .sort((a, b) => a.orden - b.orden)
                      .map((img, i) => (
                        <div
                          key={img.id}
                          style={{
                            border: `2px solid ${i === 0 ? 'var(--naranja)' : 'var(--borde)'}`,
                            borderRadius: 10,
                            overflow: 'hidden',
                            background: 'var(--carbon)',
                          }}
                        >
                          <img
                            src={urlImagen(img.url)}
                            alt={img.alt || ''}
                            style={{
                              width: '100%',
                              aspectRatio: '1 / 1',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                          <div style={{ display: 'flex', gap: 4, padding: 6, background: 'var(--superficie)' }}>
                            {i === 0 ? (
                              <span
                                style={{
                                  fontFamily: 'var(--mono)',
                                  fontSize: 9,
                                  letterSpacing: '.1em',
                                  color: 'var(--naranja)',
                                  flex: 1,
                                  alignSelf: 'center',
                                  textTransform: 'uppercase',
                                }}
                              >
                                Portada
                              </span>
                            ) : (
                              <button
                                onClick={() => hacerPortada(img)}
                                style={{
                                  flex: 1,
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--teal)',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  padding: 2,
                                }}
                              >
                                Hacer portada
                              </button>
                            )}
                            <button
                              onClick={() => setImagenABorrar(img)}
                              aria-label="Borrar imagen"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--error)',
                                fontSize: 13,
                                cursor: 'pointer',
                                padding: '2px 6px',
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <Confirmar
          abierto={Boolean(imagenABorrar)}
          titulo="¿Borrar la imagen?"
          texto="Se elimina el archivo del servidor y no se puede deshacer."
          onConfirmar={borrarImagen}
          onCancelar={() => setImagenABorrar(null)}
        />
      </CuerpoPanel>
    </>
  );
}
