// El catalogo. Busqueda + filtro por categoria + paginacion, todo reflejado en
// la URL para que un filtro se pueda compartir y el boton Atras funcione.
// Los filtros son separadores de batea, cada uno con su cantidad; la pestaña
// naranja se desliza hasta el separador elegido.

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { get, query } from '../lib/api';
import { useConteos } from '../lib/useConteos';
import CardProducto from '../componentes/CardProducto';
import Paginacion from '../componentes/Paginacion';
import { SkeletonGrilla, Vacio, ErrorCarga } from '../componentes/Estados';
import { mensajeDeError } from '../lib/formato';
import estilos from './Catalogo.module.css';

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

function Separador({ activo, onClick, nombre, cantidad }) {
  return (
    <button
      role="tab"
      aria-selected={activo}
      className={`${estilos.separador} ${activo ? estilos.separadorActivo : ''}`}
      onClick={onClick}
    >
      {/* la pestaña naranja es un solo elemento que viaja entre separadores.
          No lleva borde propio (el borde es el del separador) y el radio va
          por style: asi Motion lo corrige mientras escala y no se deforma */}
      {activo && (
        <motion.span
          layoutId="pestana-activa"
          className={estilos.pestana}
          style={{ borderRadius: '8px 8px 0 0' }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
        />
      )}
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

  // el input es estado local y la URL se actualiza recien con el debounce,
  // asi no se reescribe el historial en cada tecla
  const [texto, setTexto] = useState(qUrl);
  const q = useDebounce(texto);

  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  // si la busqueda cambia desde afuera (el buscador del hero), sincronizamos
  useEffect(() => {
    setTexto(qUrl);
  }, [qUrl]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function limpiar() {
    setTexto('');
    setParams(new URLSearchParams());
  }

  const hayFiltros = Boolean(qUrl || categoriaId);
  const categoriaActual = categorias.find((c) => String(c.id) === categoriaId);

  return (
    <main className={estilos.pagina}>
      <header className={`${estilos.cabecera} cascada`}>
        <h1 className={estilos.titulo}>Catálogo</h1>
        <p className={estilos.bajada}>
          {total !== null ? `${total} títulos` : 'Discos'} usados, escuchados enteros antes de
          llegar acá. Si no está, escribinos y lo buscamos.
        </p>
      </header>

      {/* barra de busqueda y separadores: queda pegada arriba al bajar */}
      <div className={estilos.barra}>
        <div className={estilos.barraInterior}>
          <label className={estilos.buscador}>
            <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
            <span className="sr-only">Buscar en el catálogo</span>
            <input
              type="search"
              placeholder="Buscar artista, disco o sello"
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

          <div className={estilos.separadores} role="tablist" aria-label="Formato">
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

      <section className={estilos.resultados} aria-live="polite" aria-busy={datos === null}>
        {/* sin filtros, la cantidad ya esta en el separador "Todo" */}
        {hayFiltros && datos && datos.productos.length > 0 && (
          <div className={estilos.resumen}>
            <span>
              {datos.total} {datos.total === 1 ? 'título' : 'títulos'}
              {categoriaActual ? ` en ${categoriaActual.nombre}` : ''}
              {qUrl ? ` para "${qUrl}"` : ''}
            </span>
            {hayFiltros && (
              <button className="btn-enlace" onClick={limpiar}>
                Ver todo el catálogo
              </button>
            )}
          </div>
        )}

        {error ? (
          <ErrorCarga mensaje={error} onReintentar={() => setIntento((i) => i + 1)} />
        ) : datos === null ? (
          <SkeletonGrilla cantidad={8} />
        ) : datos.productos.length === 0 ? (
          <Vacio
            titulo={hayFiltros ? 'No está en el cajón' : 'Todavía no hay discos'}
            texto={
              hayFiltros
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
