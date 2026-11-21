// catálogo: búsqueda, categoría, filtros y paginación, todo en la URL para poder compartir y usar Atrás

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MagnifyingGlass, X, SealPercent, CaretDown, SlidersHorizontal } from '@phosphor-icons/react';
import { get, query } from '../lib/api';
import { useConteos } from '../lib/useConteos';
import CardProducto from '../componentes/CardProducto';
import Paginacion from '../componentes/Paginacion';
import FiltrosCatalogo from '../componentes/FiltrosCatalogo';
import {
  FILTROS_VACIOS,
  LISTAS,
  cantidadDeFiltros,
  escribirFiltros,
  etiquetaDe,
  etiquetaPrecio,
  filtrosAQuery,
  leerFiltros,
} from '../lib/filtrosCatalogo';
import { SkeletonGrilla, Vacio, ErrorCarga } from '../componentes/Estados';
import { mensajeDeError } from '../lib/formato';
import { cantidadCon } from '../lib/unidades';
import { irAlScroll } from '../lib/scrollSuave';
import IconoCategoria from '../componentes/IconoCategoria';
import estilos from './Catalogo.module.css';

// la búsqueda espera a que la persona deje de tipear: el backend limita a 300 pedidos cada 15 minutos
function useDebounce(valor, ms = 350) {
  const [debounced, setDebounced] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return debounced;
}

// el total mezcla discos, equipos y accesorios: se cuenta en "productos"
const SIN_CATEGORIA = { unidad_singular: 'producto', unidad_plural: 'productos' };

// formas de ordenar (el backend acepta los mismos valores en ?orden=)
const ORDENES = [
  { valor: 'recientes', label: 'Más nuevos' },
  { valor: 'precio-asc', label: 'Menor precio' },
  { valor: 'precio-desc', label: 'Mayor precio' },
  { valor: 'nombre', label: 'A–Z' },
];
const POR_PAGINA = 12;

function Separador({ activo, onClick, nombre, cantidad }) {
  return (
    <button
      role="tab"
      aria-selected={activo}
      className={`${estilos.separador} ${activo ? estilos.separadorActivo : ''}`}
      onClick={onClick}
    >
      <span className={estilos.separadorNombre}>{nombre}</span>
      {cantidad !== null && cantidad !== undefined && (
        <span className={estilos.separadorCantidad}>{cantidad}</span>
      )}
    </button>
  );
}

export default function Catalogo() {
  const [params, setParams] = useSearchParams();
  const { total, categorias } = useConteos();

  const categoriaId = params.get('categoriaId') || '';
  const page = Number(params.get('page')) || 1;
  const qUrl = params.get('q') || '';
  const orden = params.get('orden') || 'recientes';
  // ?ofertas=1: solo con descuento
  const soloOfertas = params.get('ofertas') === '1';
  // género, estado, disponibilidad, década y precio (lib/filtrosCatalogo)
  const claveFiltros = LISTAS.concat('precioMin', 'precioMax')
    .map((k) => params.get(k) || '')
    .join('|');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filtros = useMemo(() => leerFiltros(params), [claveFiltros]);
  const nFiltros = cantidadDeFiltros(filtros);
  const [verFiltros, setVerFiltros] = useState(false);
  // dónde se está mirando: el backend dice qué filtros tienen sentido
  const base = useMemo(
    () => ({ q: qUrl || undefined, categoriaId: categoriaId || undefined, conDescuento: soloOfertas ? 'true' : undefined }),
    [qUrl, categoriaId, soloOfertas]
  );
  const [opciones, setOpciones] = useState(null);

  // el input es estado local y la URL se actualiza con el debounce
  const [texto, setTexto] = useState(qUrl);
  const q = useDebounce(texto);

  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  // si la búsqueda cambia desde afuera (el buscador del hero), se sincroniza
  useEffect(() => {
    setTexto(qUrl);
  }, [qUrl]);

  // al cambiar el texto vuelve a la página 1
  useEffect(() => {
    if (q === qUrl) return;
    const nuevos = new URLSearchParams(params);
    if (q) nuevos.set('q', q);
    else nuevos.delete('q');
    nuevos.delete('page');
    setParams(nuevos, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    let vigente = true;
    setDatos(null);
    setError(null);

    get(
      `/productos${query({ ...base, ...filtrosAQuery(filtros), orden: orden === 'recientes' ? undefined : orden, page, pageSize: POR_PAGINA })}`
    )
      .then((r) => {
        if (vigente) setDatos(r);
      })
      .catch((err) => {
        if (vigente) setError(mensajeDeError(err));
      });

    return () => {
      vigente = false;
    };
  }, [base, filtros, orden, page, intento]);

  useEffect(() => {
    let vigente = true;
    setOpciones(null);
    get(`/productos/filtros${query(base)}`)
      .then((r) => vigente && setOpciones(r))
      .catch(() => vigente && setOpciones(null));
    return () => {
      vigente = false;
    };
  }, [base]);

  function aplicarFiltros(valores) {
    const nuevos = escribirFiltros(new URLSearchParams(params), valores);
    nuevos.delete('page');
    setParams(nuevos);
    setVerFiltros(false);
  }

  // saca un valor de un filtro (la "x" de las etiquetas)
  function quitarFiltro(clave, valor) {
    aplicarFiltros(
      clave === 'precio'
        ? { ...filtros, precioMin: '', precioMax: '' }
        : { ...filtros, [clave]: filtros[clave].filter((v) => v !== valor) }
    );
  }

  function cambiarCategoria(id) {
    const nuevos = new URLSearchParams(params);
    if (id) nuevos.set('categoriaId', id);
    else nuevos.delete('categoriaId');
    nuevos.delete('page');
    setParams(nuevos);
  }

  // si las pestañas no entran al lado del buscador bajan a su fila, y si tampoco entran ahí se cambian por el selector (siempre en el celular).
  // Se mide el ancho natural de las pestañas y se compara con el lugar de la barra
  const barraRef = useRef(null);
  const pestanasRef = useRef(null);
  const [noEntran, setNoEntran] = useState(false);
  useLayoutEffect(() => {
    const barra = barraRef.current;
    const pestanas = pestanasRef.current;
    if (!barra || !pestanas) return;
    let natural = 0;
    const medir = () => {
      if (pestanas.offsetParent !== null) natural = pestanas.scrollWidth;
      const cs = getComputedStyle(barra);
      const lugar = barra.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      setNoEntran(natural > lugar + 1);
    };
    medir();
    document.fonts?.ready.then(medir);
    const observador = new ResizeObserver(medir);
    observador.observe(barra);
    return () => observador.disconnect();
  }, [categorias.length]);

  // un link viejo puede traer una categoría que ya no existe: se vuelve a "Todo" sin sumar un paso al historial
  useEffect(() => {
    if (!categoriaId || categorias.length === 0) return;
    if (categorias.some((c) => String(c.id) === categoriaId)) return;
    const nuevos = new URLSearchParams(params);
    nuevos.delete('categoriaId');
    nuevos.delete('page');
    setParams(nuevos, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriaId, categorias]);

  function cambiarOrden(valor) {
    const nuevos = new URLSearchParams(params);
    if (valor === 'recientes') nuevos.delete('orden');
    else nuevos.set('orden', valor);
    nuevos.delete('page');
    setParams(nuevos);
  }

  // la barra pegada lleva sombra al quedar fija arriba; un elemento de 1px sobre la barra avisa cuándo pasó bajo el header
  const testigoRef = useRef(null);
  const refBarra = useRef(null);
  const [pegada, setPegada] = useState(false);
  useEffect(() => {
    const testigo = testigoRef.current;
    const barra = refBarra.current;
    if (!testigo || !barra || !('IntersectionObserver' in window)) return;
    const arriba = parseFloat(getComputedStyle(barra).top) || 0;
    const obs = new IntersectionObserver(
      ([e]) => setPegada(!e.isIntersecting && e.boundingClientRect.top < arriba + 1),
      { rootMargin: `-${arriba + 1}px 0px 0px 0px` }
    );
    obs.observe(testigo);
    return () => obs.disconnect();
  }, []);

  function alternarOfertas() {
    const nuevos = new URLSearchParams(params);
    if (soloOfertas) nuevos.delete('ofertas');
    else nuevos.set('ofertas', '1');
    nuevos.delete('page');
    setParams(nuevos);
  }

  function irAPagina(n) {
    const nuevos = new URLSearchParams(params);
    nuevos.set('page', String(n));
    setParams(nuevos);
    irAlScroll(0, { suave: true });
  }

  function limpiar() {
    setTexto('');
    setParams(new URLSearchParams());
  }

  function botonFiltros(clase) {
    return (
      <button
        type="button"
        className={`${estilos.ofertas} ${clase} ${nFiltros ? estilos.conFiltros : ''}`}
        onClick={() => setVerFiltros(true)}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal size={18} weight="bold" aria-hidden="true" />
        Filtros
        {nFiltros > 0 && (
          <span className={estilos.contador}>
            {nFiltros}
            <span className="sr-only"> activos</span>
          </span>
        )}
      </button>
    );
  }

  const hayFiltros = Boolean(qUrl || categoriaId || soloOfertas || nFiltros);
  const categoriaActual = categorias.find((c) => String(c.id) === categoriaId);

  return (
    <main className={estilos.pagina}>
      {/* La cabecera acompaña a la pestaña elegida: con una categoria muestra
          su icono, su descripcion y su cantidad en su propia unidad. La key
          hace que vuelva a entrar (la cascada) al cambiar de categoria */}
      <header key={categoriaActual?.id ?? 'todo'} className={`${estilos.cabecera} cascada`}>
        {categoriaActual ? (
          <div className={estilos.cabeceraCategoria}>
            <span className={estilos.cabeceraIcono} aria-hidden="true">
              <IconoCategoria categoria={categoriaActual} />
            </span>
            <div>
              <p className={estilos.antetitulo}>Catálogo</p>
              <h1 className={estilos.titulo}>{categoriaActual.nombre}</h1>
            </div>
          </div>
        ) : (
          <h1 className={estilos.titulo}>Catálogo</h1>
        )}
        <p className={estilos.bajada}>
          {categoriaActual ? (
            <>
              {categoriaActual.descripcion ? `${categoriaActual.descripcion}. ` : ''}
              <strong className={estilos.bajadaCantidad}>{cantidadCon(categoriaActual.total, categoriaActual)}</strong>{' '}
              en el cajón, todos con garantía de calidad.
            </>
          ) : (
            <>
              {total !== null ? `${cantidadCon(total, SIN_CATEGORIA)} nuevos o usados` : 'Discos nuevos o usados'}, todos
              con garantía de calidad. Si no está, escribinos y lo buscamos.
            </>
          )}
        </p>
      </header>

      {/* barra de busqueda y separadores: queda pegada arriba al bajar */}
      <div ref={testigoRef} className={estilos.testigo} aria-hidden="true" />
      <div ref={refBarra} className={estilos.barra} data-pegada={pegada || undefined}>
        <div ref={barraRef} className={`${estilos.barraInterior} ${noEntran ? estilos.conSelector : ''}`}>
          <div className={estilos.herramientas}>
            <label className={estilos.buscador}>
              <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
              <span className="sr-only">Buscar en el catálogo</span>
              <input
                type="search"
                placeholder="Artista, disco o sello"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                autoComplete="off"
              />
              {texto && (
                <button
                  type="button"
                  className={estilos.borrar}
                  onClick={() => setTexto('')}
                  aria-label="Borrar búsqueda"
                >
                  <X size={14} weight="bold" />
                </button>
              )}
            </label>
            {/* filtro de ofertas: se prende y se apaga, como el de una tienda */}
            <button
              type="button"
              className={estilos.ofertas}
              aria-pressed={soloOfertas}
              onClick={alternarOfertas}
            >
              <SealPercent size={18} weight={soloOfertas ? 'fill' : 'regular'} aria-hidden="true" />
              Ofertas
            </button>
            {botonFiltros(estilos.filtrosArriba)}
          </div>

          {/* cuando las pestañas no entran (siempre en el celular) va este
              selector nativo en su lugar: nada se desliza con el dedo */}
          {/* en el celular el boton de filtros va al lado del selector (arriba no
              entra junto al buscador y ofertas); en escritorio, al lado de ofertas */}
          <div className={estilos.filaFormato}>
            <label className={estilos.selectorFormato}>
              <span className={estilos.selectorEtiqueta}>Formato</span>
              <select value={categoriaId} onChange={(e) => cambiarCategoria(e.target.value)}>
                <option value="">Todo{total !== null ? ` (${total})` : ''}</option>
                {categorias.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.nombre}
                    {c.total !== null && c.total !== undefined ? ` (${c.total})` : ''}
                  </option>
                ))}
              </select>
              <CaretDown size={16} weight="bold" aria-hidden="true" />
            </label>
            {botonFiltros(estilos.filtrosAbajo)}
          </div>

          <div ref={pestanasRef} className={estilos.separadores} role="tablist" aria-label="Formato">
            <Separador
              activo={!categoriaId}
              onClick={() => cambiarCategoria('')}
              nombre="Todo"
              cantidad={total}
            />
            {categorias.map((c) => (
              <Separador
                key={c.id}
                activo={String(c.id) === categoriaId}
                onClick={() => cambiarCategoria(String(c.id))}
                nombre={c.nombre}
                cantidad={c.total}
              />
            ))}
          </div>
        </div>
      </div>

      <FiltrosCatalogo
        abierto={verFiltros}
        onCerrar={() => setVerFiltros(false)}
        opciones={opciones}
        valores={filtros}
        base={base}
        categoria={categoriaActual}
        onAplicar={aplicarFiltros}
      />

      <section className={estilos.resultados} aria-live="polite" aria-busy={datos === null}>
        {/* los filtros elegidos, cada uno con su "x" para sacarlo */}
        {nFiltros > 0 && (
          <div className={estilos.activos}>
            {LISTAS.flatMap((clave) =>
              filtros[clave].map((valor) => (
                <button
                  key={`${clave}-${valor}`}
                  type="button"
                  className={estilos.activo}
                  onClick={() => quitarFiltro(clave, valor)}
                  aria-label={`Quitar filtro ${etiquetaDe(clave, valor)}`}
                >
                  {etiquetaDe(clave, valor)}
                  <X size={12} weight="bold" aria-hidden="true" />
                </button>
              ))
            )}
            {(filtros.precioMin || filtros.precioMax) && (
              <button
                type="button"
                className={estilos.activo}
                onClick={() => quitarFiltro('precio')}
                aria-label={`Quitar filtro ${etiquetaPrecio(filtros)}`}
              >
                {etiquetaPrecio(filtros)}
                <X size={12} weight="bold" aria-hidden="true" />
              </button>
            )}
            <button type="button" className="btn-enlace" onClick={() => aplicarFiltros(FILTROS_VACIOS)}>
              Limpiar filtros
            </button>
          </div>
        )}

        {/* que se esta viendo (desde-hasta de cuantos) y como se ordena */}
        {datos && datos.productos.length > 0 && (
          <div className={estilos.resumen}>
            <span>
              {(datos.page - 1) * datos.pageSize + 1}–{(datos.page - 1) * datos.pageSize + datos.productos.length} de{' '}
              {cantidadCon(datos.total, categoriaActual || SIN_CATEGORIA)}
              {soloOfertas ? ' en oferta' : ''}
              {qUrl ? ` para "${qUrl}"` : ''}
              {hayFiltros && (
                <>
                  {' · '}
                  <button className="btn-enlace" onClick={limpiar}>
                    Ver todo el catálogo
                  </button>
                </>
              )}
            </span>
            <label className={estilos.orden}>
              <span>Ordenar</span>
              <select value={orden} onChange={(e) => cambiarOrden(e.target.value)}>
                {ORDENES.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.label}
                  </option>
                ))}
              </select>
              <CaretDown size={14} weight="bold" aria-hidden="true" />
            </label>
          </div>
        )}

        {error ? (
          <ErrorCarga mensaje={error} onReintentar={() => setIntento((i) => i + 1)} />
        ) : datos === null ? (
          <SkeletonGrilla cantidad={8} />
        ) : datos.productos.length === 0 ? (
          <Vacio
            titulo={
              soloOfertas && !qUrl && !categoriaId && !nFiltros
                ? 'No hay ofertas por ahora'
                : nFiltros
                  ? 'Nada con esos filtros'
                  : hayFiltros
                  ? 'No está en el cajón'
                  : 'Todavía no hay discos'
            }
            texto={
              soloOfertas && !qUrl && !categoriaId && !nFiltros
                ? 'Las ofertas cambian seguido: volvé a pasar en unos días o mirá todo el catálogo.'
                : nFiltros
                ? 'Probá sacando alguno de los filtros de arriba, o escribinos y lo salimos a buscar.'
                : hayFiltros
                ? 'No encontramos nada con esa búsqueda. Probá con el nombre del artista, o escribinos y lo salimos a buscar.'
                : 'Todavía no hay productos cargados en el catálogo.'
            }
          >
            {hayFiltros && (
              <button className="btn btn-secundario" onClick={limpiar}>
                Ver todo el catálogo
              </button>
            )}
            <Link className="btn btn-primario" to="/contacto">
              Pedir un disco
            </Link>
          </Vacio>
        ) : (
          <>
            <div className="grilla-productos">
              {datos.productos.map((p, i) => (
                <div key={p.id} className={estilos.entra} style={{ '--i': i }}>
                  <CardProducto producto={p} prioridad={i < 4} />
                </div>
              ))}
            </div>

            <div className={estilos.paginas}>
              <Paginacion pagina={datos.page} totalPaginas={datos.totalPages} onCambiar={irAPagina} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
