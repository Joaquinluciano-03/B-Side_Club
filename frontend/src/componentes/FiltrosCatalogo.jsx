// Panel de filtros del catalogo: genero, estado del ejemplar, disponibilidad,
// decada y precio. Es un <dialog> (foco adentro, Escape y clic afuera
// cierran): en escritorio entra desde la derecha, en el celular sube desde
// abajo como una hoja.
//
// Se eligen los filtros "en borrador" y se aplican con el boton de abajo, que
// va diciendo cuantos resultados quedan ("Ver 12 títulos"). Solo aparecen los
// filtros que tienen sentido para lo que se esta mirando (los manda el
// backend en /productos/filtros): en Equipos no hay genero.

import { useEffect, useRef, useState } from 'react';
import { X } from '@phosphor-icons/react';
import { get, query } from '../lib/api';
import { etiquetaStock, formatearPrecio } from '../lib/formato';
import { cantidadCon } from '../lib/unidades';
import { FILTROS_VACIOS, cantidadDeFiltros, etiquetaDecada, filtrosAQuery } from '../lib/filtrosCatalogo';
import estilos from './FiltrosCatalogo.module.css';

function Seccion({ titulo, opciones, elegidos, etiqueta = (v) => v, onCambiar }) {
  // una sola opcion no filtra nada; si ya estaba elegida se muestra igual,
  // para poder sacarla
  if (opciones.length < 2 && elegidos.length === 0) return null;
  const alternar = (valor) =>
    onCambiar(elegidos.includes(valor) ? elegidos.filter((v) => v !== valor) : [...elegidos, valor]);

  return (
    <fieldset className={estilos.seccion}>
      <legend className={estilos.seccionTitulo}>{titulo}</legend>
      <div className={estilos.chips}>
        {opciones.map(({ valor, total }) => {
          const v = String(valor);
          return (
            <button
              key={v}
              type="button"
              className={estilos.chip}
              aria-pressed={elegidos.includes(v)}
              onClick={() => alternar(v)}
            >
              {etiqueta(v)}
              <span className={estilos.chipCantidad}>{total}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

// solo digitos: "$ 20.000" o "20000" quedan en "20000"
const soloNumero = (texto) => texto.replace(/\D/g, '').slice(0, 10);

export default function FiltrosCatalogo({ abierto, onCerrar, opciones, valores, base, categoria, onAplicar }) {
  const dialogo = useRef(null);
  const [borrador, setBorrador] = useState(valores);
  const [total, setTotal] = useState(null);

  // abrir y cerrar el dialog nativo; al abrir, el borrador arranca de lo aplicado
  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (abierto && !d.open) {
      setBorrador(valores);
      d.showModal();
    } else if (!abierto && d.open) {
      d.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  // cuantos resultados daria el borrador (con una pausa, para no pedir por
  // cada toque: el backend tiene un techo de pedidos)
  useEffect(() => {
    if (!abierto) return;
    let vigente = true;
    const t = setTimeout(() => {
      get(`/productos${query({ ...base, ...filtrosAQuery(borrador), pageSize: 1 })}`)
        .then((r) => vigente && setTotal(r.total))
        .catch(() => vigente && setTotal(null));
    }, 300);
    return () => {
      vigente = false;
      clearTimeout(t);
    };
  }, [abierto, borrador, base]);

  const cambiar = (clave) => (valor) => setBorrador((b) => ({ ...b, [clave]: valor }));
  const precioInvertido =
    borrador.precioMin && borrador.precioMax && Number(borrador.precioMin) > Number(borrador.precioMax);

  function aplicar() {
    if (precioInvertido) return;
    onAplicar(borrador);
  }

  const o = opciones;
  const hayPrecio = o?.precio?.min !== null && o?.precio?.min !== undefined && o.precio.max > o.precio.min;
  const sinNada =
    o &&
    !hayPrecio &&
    [o.generos, o.condiciones, o.disponibilidad, o.decadas].every((lista) => lista.length < 2);

  return (
    <dialog
      ref={dialogo}
      className={estilos.panel}
      aria-labelledby="filtros-titulo"
      onClose={onCerrar}
      // clic en el fondo oscuro (fuera de la hoja): cierra
      onClick={(e) => e.target === dialogo.current && onCerrar()}
    >
      <div className={estilos.hoja}>
        <header className={estilos.cabecera}>
          <h2 id="filtros-titulo" className={estilos.titulo}>
            Filtros
          </h2>
          <button type="button" className={estilos.cerrar} onClick={onCerrar} aria-label="Cerrar filtros">
            <X size={18} weight="bold" />
          </button>
        </header>

        <div className={estilos.cuerpo}>
          {!o ? (
            <p className={estilos.nota}>Cargando filtros…</p>
          ) : sinNada ? (
            <p className={estilos.nota}>Con lo que estás mirando no hay nada más para filtrar.</p>
          ) : (
            <>
              <Seccion titulo="Género" opciones={o.generos} elegidos={borrador.genero} onCambiar={cambiar('genero')} />
              <Seccion
                titulo="Estado del ejemplar"
                opciones={o.condiciones}
                elegidos={borrador.condicion}
                onCambiar={cambiar('condicion')}
              />
              <Seccion
                titulo="Disponibilidad"
                opciones={o.disponibilidad}
                elegidos={borrador.disponibilidad}
                etiqueta={etiquetaStock}
                onCambiar={cambiar('disponibilidad')}
              />
              <Seccion
                titulo="Década"
                opciones={o.decadas}
                elegidos={borrador.decada}
                etiqueta={etiquetaDecada}
                onCambiar={cambiar('decada')}
              />

              {(hayPrecio || borrador.precioMin || borrador.precioMax) && (
                <fieldset className={estilos.seccion}>
                  <legend className={estilos.seccionTitulo}>Precio</legend>
                  <div className={estilos.precios}>
                    <div className={`campo ${precioInvertido ? 'con-error' : ''}`}>
                      <label htmlFor="filtro-min">Desde</label>
                      <div className={estilos.precioCampo}>
                        <span aria-hidden="true">$</span>
                        <input
                          id="filtro-min"
                          inputMode="numeric"
                          autoComplete="off"
                          value={borrador.precioMin}
                          onChange={(e) => cambiar('precioMin')(soloNumero(e.target.value))}
                          placeholder={hayPrecio ? Math.floor(o.precio.min).toLocaleString('es-AR') : ''}
                        />
                      </div>
                    </div>
                    <div className={`campo ${precioInvertido ? 'con-error' : ''}`}>
                      <label htmlFor="filtro-max">Hasta</label>
                      <div className={estilos.precioCampo}>
                        <span aria-hidden="true">$</span>
                        <input
                          id="filtro-max"
                          inputMode="numeric"
                          autoComplete="off"
                          value={borrador.precioMax}
                          onChange={(e) => cambiar('precioMax')(soloNumero(e.target.value))}
                          placeholder={hayPrecio ? Math.ceil(o.precio.max).toLocaleString('es-AR') : ''}
                        />
                      </div>
                    </div>
                  </div>
                  {precioInvertido ? (
                    <div className="campo-error">El “desde” es mayor que el “hasta”.</div>
                  ) : (
                    hayPrecio && (
                      <div className="campo-ayuda">
                        Van de {formatearPrecio(o.precio.min)} a {formatearPrecio(o.precio.max)}, con el descuento
                        aplicado. Los “a consultar” no tienen precio y quedan afuera.
                      </div>
                    )
                  )}
                </fieldset>
              )}
            </>
          )}
        </div>

        <footer className={estilos.pie}>
          <button
            type="button"
            className="btn-enlace"
            onClick={() => setBorrador(FILTROS_VACIOS)}
            disabled={cantidadDeFiltros(borrador) === 0}
          >
            Limpiar filtros
          </button>
          <button type="button" className="btn btn-primario" onClick={aplicar} disabled={precioInvertido}>
            {total === null ? 'Ver resultados' : total === 0 ? 'Sin resultados' : `Ver ${cantidadCon(total, categoria)}`}
          </button>
        </footer>
      </div>
    </dialog>
  );
}
