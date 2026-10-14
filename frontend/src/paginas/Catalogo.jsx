// "El cajón". Busqueda + filtro por categoria + paginacion, todo reflejado en
// la URL para que un filtro se pueda compartir y el boton Atras funcione.

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { get, query } from '../lib/api';
import CardProducto from '../componentes/CardProducto';
import { SkeletonGrilla, Vacio, ErrorCarga } from '../componentes/Estados';
import { mensajeDeError } from '../lib/formato';

// La busqueda dispara un pedido por tecla si no se la frena, y el backend
// tiene un techo de 300 pedidos cada 15 minutos: escribir "pink floyd" se
// comeria 11 de una. Esperamos a que la persona deje de tipear.
function useDebounce(valor, ms = 350) {
  const [debounced, setDebounced] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return debounced;
}

const chip = (activo) => ({
  background: activo ? 'var(--naranja)' : 'transparent',
  color: activo ? 'var(--tinta-sobre-naranja)' : 'var(--tinta-suave)',
  border: `1px solid ${activo ? 'var(--naranja)' : 'var(--borde-boton)'}`,
  fontWeight: activo ? 800 : 700,
  fontSize: 13,
  padding: '9px 16px',
  borderRadius: 999,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all .15s',
});

const botonPagina = (activo, deshabilitado) => ({
  background: activo ? 'var(--naranja)' : 'transparent',
  color: deshabilitado ? 'var(--apagado)' : activo ? 'var(--tinta-sobre-naranja)' : 'var(--tinta)',
  border: `1px solid ${activo ? 'var(--naranja)' : 'var(--borde-boton)'}`,
  fontWeight: 700,
  fontSize: 13,
  padding: '9px 14px',
  borderRadius: 'var(--r-control)',
  cursor: deshabilitado ? 'not-allowed' : 'pointer',
  minWidth: 40,
});

export default function Catalogo() {
  const [params, setParams] = useSearchParams();

  const categoriaId = params.get('categoriaId') || '';
  const page = Number(params.get('page')) || 1;
  const qUrl = params.get('q') || '';

  // el input es estado local y la URL se actualiza recien con el debounce,
  // asi no se reescribe el historial en cada tecla
  const [texto, setTexto] = useState(qUrl);
  const q = useDebounce(texto);

  const [categorias, setCategorias] = useState([]);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    get('/categorias')
      .then(setCategorias)
      .catch(() => setCategorias([]));
  }, []);

  // cuando cambia el texto buscado volvemos a la pagina 1: quedarse en la 3
  // de una busqueda nueva casi siempre deja la pantalla vacia
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

    get(`/productos${query({ q: qUrl, categoriaId, page, pageSize: 12 })}`)
      .then((r) => {
        if (vigente) setDatos(r);
      })
      .catch((err) => {
        if (vigente) setError(mensajeDeError(err));
      });

    return () => {
      vigente = false;
    };
  }, [qUrl, categoriaId, page, intento]);

  function cambiarCategoria(id) {
    const nuevos = new URLSearchParams(params);
    if (id) nuevos.set('categoriaId', id);
    else nuevos.delete('categoriaId');
    nuevos.delete('page');
    setParams(nuevos);
  }

  function irAPagina(n) {
    const nuevos = new URLSearchParams(params);
    nuevos.set('page', String(n));
    setParams(nuevos);
  }

  function limpiar() {
    setTexto('');
    setParams(new URLSearchParams());
  }

  // ventana de paginas alrededor de la actual, para no imprimir 30 botones
  const paginas = useMemo(() => {
    if (!datos) return [];
    const total = datos.totalPages;
    const desde = Math.max(1, Math.min(page - 2, total - 4));
    const hasta = Math.min(total, desde + 4);
    return Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);
  }, [datos, page]);

  const hayFiltros = Boolean(qUrl || categoriaId);

  return (
    <main className="contenido">
      <div className="kicker">02 — Catálogo</div>
      <h1 className="titulo">EL CAJÓN</h1>

      {/* buscador */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <input
            placeholder="Buscar por artista, disco o sello…"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            aria-label="Buscar en el catálogo"
            style={{
              width: '100%',
              background: '#fff',
              border: '1px solid var(--borde-fuerte)',
              borderRadius: 9,
              padding: '14px 14px 14px 42px',
              color: 'var(--tinta)',
              fontSize: 15,
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--naranja)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--borde-fuerte)')}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: 15,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 13,
              height: 13,
              border: '2px solid var(--tinta-tenue)',
              borderRadius: '50%',
            }}
          />
        </div>
        <div className="mono" style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
          {datos ? `${datos.total} ${datos.total === 1 ? 'título' : 'títulos'}` : '—'}
        </div>
      </div>

      {/* chips de categoria */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 30 }}>
        <button style={chip(!categoriaId)} onClick={() => cambiarCategoria('')}>
          Todo
        </button>
        {categorias.map((c) => (
          <button
            key={c.id}
            style={chip(String(c.id) === categoriaId)}
            onClick={() => cambiarCategoria(String(c.id))}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorCarga mensaje={error} onReintentar={() => setIntento((i) => i + 1)} />
      ) : datos === null ? (
        <SkeletonGrilla cantidad={8} />
      ) : datos.productos.length === 0 ? (
        <Vacio
          titulo="SIN RESULTADOS"
          texto={
            hayFiltros
              ? 'No encontramos nada con esa búsqueda. Probá con el artista o escribinos y lo buscamos.'
              : 'Todavía no hay productos cargados en el catálogo.'
          }
        >
          {hayFiltros && (
            <button className="btn btn-secundario" onClick={limpiar}>
              Limpiar filtros
            </button>
          )}
        </Vacio>
      ) : (
        <>
          <div className="grilla-productos">
            {datos.productos.map((p) => (
              <CardProducto key={p.id} producto={p} />
            ))}
          </div>

          {datos.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                flexWrap: 'wrap',
                marginTop: 34,
              }}
            >
              <div className="mono">
                PÁGINA {datos.page} DE {datos.totalPages}
              </div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  style={botonPagina(false, page <= 1)}
                  disabled={page <= 1}
                  onClick={() => irAPagina(page - 1)}
                >
                  ← Anterior
                </button>
                {paginas.map((n) => (
                  <button key={n} style={botonPagina(n === page, false)} onClick={() => irAPagina(n)}>
                    {n}
                  </button>
                ))}
                <button
                  style={botonPagina(false, page >= datos.totalPages)}
                  disabled={page >= datos.totalPages}
                  onClick={() => irAPagina(page + 1)}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
