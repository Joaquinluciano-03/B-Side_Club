// Alta y edicion de producto. Sirve para las dos cosas: si hay :id en la URL
// edita, si no crea. Las imagenes se suben aparte (POST /productos/:id/imagenes)
// porque necesitan un producto ya existente al que colgarse: al crear, las
// fotos elegidas quedan "pendientes" en el navegador y se suben apenas el
// producto se guarda.
//
// El backend tiene un solo campo "nombre": aca se carga en dos (titulo y
// artista) y se guarda como "Titulo — Artista", que es lo que el sitio
// separa despues (lib/formato.js, separarNombre).

import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UploadSimple, Star, Trash, ImageBroken } from '@phosphor-icons/react';
import { get, post, put, patch, del, api, urlImagen } from '../../lib/api';
import { CabeceraPanel, CuerpoPanel } from '../../layouts/LayoutPanel';
import { Cargando } from '../../componentes/Estados';
import Confirmar from '../../componentes/Confirmar';
import CardProducto from '../../componentes/CardProducto';
import CamposDescuento, { errorDescuento } from '../../componentes/CamposDescuento';
import { useToast } from '../../lib/toast';
import { ESTADOS_STOCK, etiquetaStock, mensajeDeError, separarNombre } from '../../lib/formato';
import estilos from './FormProducto.module.css';

const VACIO = {
  titulo: '',
  artista: '',
  anio: '',
  precio: '',
  stock: '1',
  estado_stock: 'disponible',
  condicion: '',
  descripcion: '',
  categoriaId: '',
  destacado: false,
  esActivo: true,
  descuento_tipo: '', // '' = sin descuento
  descuento_valor: '',
};

const MAX_IMAGENES = 5;
const MAX_MB = 5;

// sugerencias para "condicion": la escala Goldmine (la que entiende la ficha
// publica) y las que se usan para equipos
const CONDICIONES = [
  'Nuevo (M)',
  'Casi nuevo (NM)',
  'Muy bueno (VG+)',
  'Bueno (VG)',
  'Aceptable (G)',
  'Revisado en taller',
  'Funcional',
  'Coleccionista',
];

function unirNombre(titulo, artista) {
  const t = titulo.trim();
  const a = artista.trim();
  return a ? `${t} — ${a}` : t;
}

function Interruptor({ id, checked, onChange, titulo, ayuda }) {
  return (
    <label className={estilos.interruptor} htmlFor={id}>
      <span className={estilos.interruptorTexto}>
        <strong>{titulo}</strong>
        <span>{ayuda}</span>
      </span>
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={estilos.pista} aria-hidden="true" />
    </label>
  );
}

export default function FormProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const editando = Boolean(id);
  const inputArchivos = useRef(null);

  const [form, setForm] = useState(VACIO);
  const [categorias, setCategorias] = useState([]);
  const [imagenes, setImagenes] = useState([]);
  const [cargando, setCargando] = useState(editando);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [errores, setErrores] = useState({});
  const [imagenABorrar, setImagenABorrar] = useState(null);
  // fotos elegidas antes de crear el producto: { archivo, url } con una URL
  // local (blob:) para mostrarlas hasta que se suban
  const [pendientes, setPendientes] = useState([]);

  // las URLs locales ocupan memoria hasta que se liberan
  const pendientesRef = useRef(pendientes);
  pendientesRef.current = pendientes;
  useEffect(() => () => pendientesRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  useEffect(() => {
    get('/categorias')
      .then(setCategorias)
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    if (!editando) return;
    get(`/productos/${id}`)
      .then((p) => {
        const { titulo, artista } = separarNombre(p.nombre);
        setForm({
          titulo,
          artista: artista ?? '',
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
          descuento_tipo: p.descuento_tipo ?? '',
          // Decimal: llega como string ("15.00"); Number lo deja en "15"
          descuento_valor: p.descuento_valor != null ? String(Number(p.descuento_valor)) : '',
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
    if (!form.titulo.trim()) e.titulo = 'Poné el título del disco o el nombre del equipo.';
    if (!form.descripcion.trim()) e.descripcion = 'Contá el estado real del ejemplar.';
    if (!form.categoriaId) e.categoriaId = 'Elegí una categoría.';
    // el backend toma anio 0 como faltante
    if (!Number.isFinite(Number(form.anio)) || Number(form.anio) <= 0) e.anio = 'Poné el año (por ejemplo 1973).';
    if (form.stock === '' || !Number.isFinite(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = 'Tiene que ser un número, 0 o más.';
    if (form.precio !== '' && !Number.isFinite(Number(form.precio)))
      e.precio = 'Tiene que ser un número, o vacío para "a consultar".';
    // sin precio el descuento no se manda (ver guardar), asi que no se valida
    if (!e.precio && form.precio !== '') {
      e.descuento = errorDescuento(form.precio, form.descuento_tipo, form.descuento_valor);
    }
    setErrores(e);
    const primero = ['titulo', 'categoriaId', 'anio', 'stock', 'precio', 'descuento', 'descripcion'].find((k) => e[k]);
    // el foco del descuento va a su campo de valor
    if (primero) document.getElementById(primero === 'descuento' ? 'p-descuento-valor' : `p-${primero}`)?.focus();
    return !primero;
  }

  async function guardar(ev) {
    ev.preventDefault();
    if (!validar()) return;

    // precio vacio = "a consultar": se manda null, no "" ni 0. Y sin precio
    // (o con "Sin descuento") el descuento se manda en null, o sea se quita
    const conDescuento = form.precio !== '' && form.descuento_tipo !== '';
    const cuerpo = {
      nombre: unirNombre(form.titulo, form.artista),
      anio: Number(form.anio),
      precio: form.precio === '' ? null : Number(form.precio),
      descuento_tipo: conDescuento ? form.descuento_tipo : null,
      descuento_valor: conDescuento ? Number(form.descuento_valor) : null,
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
        if (pendientes.length) {
          // el producto ya existe: ahora si se pueden subir las fotos elegidas,
          // en el orden en que se ven (la primera queda de portada)
          const fd = new FormData();
          pendientes.forEach((p) => fd.append('imagenes', p.archivo));
          try {
            await api(`/productos/${creado.id}/imagenes`, { method: 'POST', body: fd });
            toast.exito(pendientes.length === 1 ? 'Producto creado con su foto.' : 'Producto creado con sus fotos.');
          } catch (err) {
            toast.error(`El producto se creó, pero las fotos no se subieron: ${mensajeDeError(err)} Probá de nuevo desde acá.`);
          }
        } else {
          toast.exito('Producto creado.');
        }
        // pasamos a la edicion del producto recien creado
        navigate(`/panel/productos/${creado.id}`, { replace: true });
      }
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  // filtra lo elegido y avisa si no se puede subir. El backend acepta hasta 5
  // por tanda y 5 MB cada una: avisamos antes de gastar el pedido y que vuelva
  // un 400. "yaHay" cuenta las pendientes, que despues van en la misma tanda.
  function revisarArchivos(lista, yaHay = 0) {
    const archivos = Array.from(lista || []).filter((a) => a.type.startsWith('image/'));
    if (!archivos.length) {
      if (lista?.length) toast.error('Solo se pueden subir imágenes.');
      return null;
    }
    if (yaHay + archivos.length > MAX_IMAGENES) {
      toast.error(`Se pueden subir hasta ${MAX_IMAGENES} imágenes por vez.`);
      return null;
    }
    const pesada = archivos.find((a) => a.size > MAX_MB * 1024 * 1024);
    if (pesada) {
      toast.error(`"${pesada.name}" supera los ${MAX_MB} MB.`);
      return null;
    }
    return archivos;
  }

  // editando se suben en el momento; creando quedan pendientes hasta guardar
  function elegirFotos(lista) {
    if (editando) {
      subirImagenes(lista);
      return;
    }
    const archivos = revisarArchivos(lista, pendientes.length);
    if (!archivos) return;
    setPendientes((prev) => [...prev, ...archivos.map((archivo) => ({ archivo, url: URL.createObjectURL(archivo) }))]);
  }

  function quitarPendiente(p) {
    URL.revokeObjectURL(p.url);
    setPendientes((prev) => prev.filter((x) => x !== p));
  }

  // la portada es la primera de la lista: se pasa adelante
  function pendienteDePortada(p) {
    setPendientes((prev) => [p, ...prev.filter((x) => x !== p)]);
  }

  async function subirImagenes(lista) {
    const archivos = revisarArchivos(lista);
    if (!archivos) return;

    const fd = new FormData();
    archivos.forEach((a) => fd.append('imagenes', a));

    setSubiendo(true);
    try {
      const nuevas = await api(`/productos/${id}/imagenes`, { method: 'POST', body: fd });
      setImagenes((prev) => [...prev, ...nuevas]);
      toast.exito(nuevas.length === 1 ? 'Foto subida.' : `${nuevas.length} fotos subidas.`);
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setSubiendo(false);
    }
  }

  function soltar(ev) {
    ev.preventDefault();
    setArrastrando(false);
    if (!subiendo) elegirFotos(ev.dataTransfer.files);
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
      toast.exito('Portada cambiada.');
    } catch (err) {
      toast.error(mensajeDeError(err));
    }
  }

  if (cargando) return <Cargando />;

  const ordenadas = [...imagenes].sort((a, b) => a.orden - b.orden);
  const categoria = categorias.find((c) => String(c.id) === form.categoriaId);
  // producto armado con lo que hay en el formulario, para la vista previa
  const previa = {
    id: id || 0,
    nombre: unirNombre(form.titulo || 'Título del disco', form.artista),
    anio: Number(form.anio) || null,
    precio: form.precio === '' ? null : form.precio,
    descuento_tipo: form.descuento_tipo,
    descuento_valor: form.descuento_valor,
    estado_stock: form.estado_stock,
    esActivo: form.esActivo,
    categoria: categoria || { nombre: '' },
    imagenes: editando ? ordenadas : pendientes.map((p, i) => ({ id: i, url: p.url, alt: '', orden: i })),
  };

  return (
    <>
      <CabeceraPanel
        kicker={editando ? 'Editar producto' : 'Nuevo producto'}
        titulo={editando ? form.titulo || 'Producto' : 'Cargar un disco'}
        accion={
          <Link to="/panel/productos" className="btn btn-secundario btn-chico">
            <ArrowLeft size={16} weight="bold" /> Volver al listado
          </Link>
        }
      />
      <CuerpoPanel>
        <div className={estilos.grilla}>
          {/* ---------- Datos ---------- */}
          <form onSubmit={guardar} noValidate className={estilos.formulario}>
            <fieldset className={estilos.bloque}>
              <legend>Qué es</legend>
              <div className={estilos.dos}>
                <div className={`campo ${errores.titulo ? 'con-error' : ''}`}>
                  <label htmlFor="p-titulo">Título</label>
                  <input
                    id="p-titulo"
                    value={form.titulo}
                    onChange={(e) => campo('titulo', e.target.value)}
                    placeholder="The Dark Side of the Moon"
                    aria-invalid={Boolean(errores.titulo)}
                  />
                  {errores.titulo && <div className="campo-error">{errores.titulo}</div>}
                </div>
                <div className="campo">
                  <label htmlFor="p-artista">Artista o marca</label>
                  <input
                    id="p-artista"
                    value={form.artista}
                    onChange={(e) => campo('artista', e.target.value)}
                    placeholder="Pink Floyd"
                  />
                  <div className="campo-ayuda">En equipos, la marca o el tipo (Technics, bandeja).</div>
                </div>
              </div>

              <div className={estilos.dos}>
                <div className={`campo ${errores.categoriaId ? 'con-error' : ''}`}>
                  <label htmlFor="p-categoriaId">Categoría</label>
                  <select
                    id="p-categoriaId"
                    value={form.categoriaId}
                    onChange={(e) => campo('categoriaId', e.target.value)}
                    aria-invalid={Boolean(errores.categoriaId)}
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
                <div className={`campo ${errores.anio ? 'con-error' : ''}`}>
                  <label htmlFor="p-anio">Año</label>
                  <input
                    id="p-anio"
                    inputMode="numeric"
                    value={form.anio}
                    onChange={(e) => campo('anio', e.target.value)}
                    placeholder="1973"
                    aria-invalid={Boolean(errores.anio)}
                  />
                  {errores.anio && <div className="campo-error">{errores.anio}</div>}
                </div>
              </div>
            </fieldset>

            <fieldset className={estilos.bloque}>
              <legend>Precio y stock</legend>
              <div className={estilos.tres}>
                <div className={`campo ${errores.precio ? 'con-error' : ''}`}>
                  <label htmlFor="p-precio">Precio ($)</label>
                  <input
                    id="p-precio"
                    inputMode="decimal"
                    value={form.precio}
                    onChange={(e) => campo('precio', e.target.value)}
                    placeholder="145000"
                    aria-invalid={Boolean(errores.precio)}
                  />
                  {errores.precio ? (
                    <div className="campo-error">{errores.precio}</div>
                  ) : (
                    <div className="campo-ayuda">Vacío = "a consultar".</div>
                  )}
                </div>
                <div className={`campo ${errores.stock ? 'con-error' : ''}`}>
                  <label htmlFor="p-stock">Stock</label>
                  <input
                    id="p-stock"
                    inputMode="numeric"
                    value={form.stock}
                    onChange={(e) => campo('stock', e.target.value)}
                    aria-invalid={Boolean(errores.stock)}
                  />
                  {errores.stock && <div className="campo-error">{errores.stock}</div>}
                </div>
                <div className="campo">
                  <label htmlFor="p-estado">Disponibilidad</label>
                  <select id="p-estado" value={form.estado_stock} onChange={(e) => campo('estado_stock', e.target.value)}>
                    {ESTADOS_STOCK.map((e) => (
                      <option key={e} value={e}>
                        {etiquetaStock(e)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <CamposDescuento
                id="p-descuento"
                precio={form.precio}
                tipo={form.descuento_tipo}
                valor={form.descuento_valor}
                error={errores.descuento}
                onCambiar={({ tipo, valor }) => {
                  setForm((f) => ({ ...f, descuento_tipo: tipo, descuento_valor: valor }));
                  if (errores.descuento) setErrores((e) => ({ ...e, descuento: null }));
                }}
              />
            </fieldset>

            <fieldset className={estilos.bloque}>
              <legend>Estado del ejemplar</legend>
              <div className="campo">
                <label htmlFor="p-cond">Condición</label>
                <input
                  id="p-cond"
                  list="condiciones"
                  value={form.condicion}
                  onChange={(e) => campo('condicion', e.target.value)}
                  placeholder="Muy bueno (VG+)"
                />
                <datalist id="condiciones">
                  {CONDICIONES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <div className="campo-ayuda">
                  Con el código entre paréntesis (M, NM, VG+, VG, G) la ficha muestra la escala Goldmine.
                </div>
              </div>
              <div className={`campo ${errores.descripcion ? 'con-error' : ''}`}>
                <label htmlFor="p-descripcion">Descripción</label>
                <textarea
                  id="p-descripcion"
                  value={form.descripcion}
                  onChange={(e) => campo('descripcion', e.target.value)}
                  placeholder="Contá el estado real: si salta, si la tapa está gastada, qué trae…"
                  aria-invalid={Boolean(errores.descripcion)}
                />
                {errores.descripcion && <div className="campo-error">{errores.descripcion}</div>}
              </div>
            </fieldset>

            <fieldset className={estilos.bloque}>
              <legend>Publicación</legend>
              <Interruptor
                id="p-activo"
                checked={form.esActivo}
                onChange={(v) => campo('esActivo', v)}
                titulo="Publicado en el catálogo"
                ayuda="Apagado, el producto queda guardado pero el público no lo ve."
              />
              <Interruptor
                id="p-destacado"
                checked={form.destacado}
                onChange={(v) => campo('destacado', v)}
                titulo="Destacado en la home"
                ayuda="Aparece en “Destacados y ofertas”."
              />
            </fieldset>

            <div className={estilos.guardar}>
              <button type="submit" className="btn btn-primario" disabled={guardando}>
                {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </form>

          {/* ---------- Columna derecha: vista previa e imagenes ---------- */}
          <aside className={estilos.lateral}>
            <section className={estilos.panelLateral} aria-labelledby="previa-titulo">
              <h2 id="previa-titulo" className={estilos.lateralTitulo}>
                Así se ve en el catálogo
              </h2>
              {/* inert: es solo una muestra, no se puede clickear */}
              <div className={estilos.previa} inert>
                <CardProducto producto={previa} />
              </div>
            </section>

            <section className={estilos.panelLateral} aria-labelledby="fotos-titulo">
              <h2 id="fotos-titulo" className={estilos.lateralTitulo}>
                Fotos del ejemplar
              </h2>

              <button
                type="button"
                className={`${estilos.zona} ${arrastrando ? estilos.zonaActiva : ''}`}
                onClick={() => inputArchivos.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setArrastrando(true);
                }}
                onDragLeave={() => setArrastrando(false)}
                onDrop={soltar}
                disabled={subiendo || guardando}
              >
                <UploadSimple size={28} weight="duotone" aria-hidden="true" />
                <strong>{subiendo ? 'Subiendo…' : 'Arrastrá las fotos acá o tocá para elegir'}</strong>
                <span>
                  Hasta {MAX_IMAGENES} por vez, {MAX_MB} MB cada una. La primera es la portada.
                </span>
              </button>
              <input
                ref={inputArchivos}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  elegirFotos(e.target.files);
                  e.target.value = ''; // permite volver a elegir el mismo archivo
                }}
              />

              {!editando && pendientes.length > 0 && (
                <>
                  <p className={estilos.nota}>Se suben cuando tocás “Crear producto”.</p>
                  <ul className={estilos.fotos}>
                    {pendientes.map((p, i) => (
                      <li key={p.url} className={i === 0 ? estilos.portada : undefined}>
                        <img src={p.url} alt={p.archivo.name} />
                        <div className={estilos.fotoAcciones}>
                          {i === 0 ? (
                            <span className={estilos.etiquetaPortada}>Portada</span>
                          ) : (
                            <button type="button" onClick={() => pendienteDePortada(p)} aria-label="Usar como portada">
                              <Star size={16} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => quitarPendiente(p)}
                            aria-label="Quitar foto"
                            className={estilos.borrarFoto}
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {editando && (
                <>
                  {ordenadas.length > 0 && (
                    <ul className={estilos.fotos}>
                      {ordenadas.map((img, i) => {
                        const url = urlImagen(img.url);
                        return (
                          <li key={img.id} className={i === 0 ? estilos.portada : undefined}>
                            {url ? (
                              <img src={url} alt={img.alt || ''} loading="lazy" />
                            ) : (
                              // filas viejas (placehold.co o /uploads): no cargan, conviene borrarlas
                              <span className={estilos.rota}>
                                <ImageBroken size={22} aria-hidden="true" />
                                Imagen vieja
                              </span>
                            )}
                            <div className={estilos.fotoAcciones}>
                              {i === 0 ? (
                                <span className={estilos.etiquetaPortada}>Portada</span>
                              ) : (
                                <button type="button" onClick={() => hacerPortada(img)} aria-label="Usar como portada">
                                  <Star size={16} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setImagenABorrar(img)}
                                aria-label="Borrar foto"
                                className={estilos.borrarFoto}
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              )}
            </section>
          </aside>
        </div>

        <Confirmar
          abierto={Boolean(imagenABorrar)}
          titulo="¿Borrar la foto?"
          texto="Se elimina el archivo y no se puede deshacer."
          onConfirmar={borrarImagen}
          onCancelar={() => setImagenABorrar(null)}
        />
      </CuerpoPanel>
    </>
  );
}
