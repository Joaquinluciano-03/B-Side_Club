// Galeria de fotos de la ficha de producto. La tapa (funda con el disco
// asomando) muestra la foto activa y se puede recorrer de varias formas:
//   - flechas sobre la foto (con el mouse encima; en pantallas tactiles
//     estan siempre a la vista)
//   - deslizando con el dedo
//   - con las flechas del teclado, con el foco en la galeria
//   - tocando una miniatura
// Al tocar la foto se abre en grande (para ver el estado del ejemplar de
// cerca), con la misma navegacion. Sin fotos se ve la tapa generica y nada mas.

import { useEffect, useRef, useState } from 'react';
import { CaretLeft, CaretRight, X, MagnifyingGlassPlus } from '@phosphor-icons/react';
import ArteProducto, { ObjetoInterior } from './ArteProducto';
import { urlImagen } from '../lib/api';
import estilos from './GaleriaProducto.module.css';

// Deslizar con el dedo (o arrastrar con el mouse): pasado cierto recorrido
// horizontal cambia de foto. Devuelve los handlers para el elemento y una
// funcion que dice si el ultimo gesto fue un deslizamiento (asi el click que
// viene despues no abre la foto en grande).
function useDeslizar(alDeslizar) {
  const inicio = useRef(null);
  const deslizo = useRef(false);
  return {
    handlers: {
      onPointerDown: (e) => {
        inicio.current = { x: e.clientX, y: e.clientY };
        deslizo.current = false;
      },
      onPointerUp: (e) => {
        if (!inicio.current) return;
        const dx = e.clientX - inicio.current.x;
        const dy = e.clientY - inicio.current.y;
        inicio.current = null;
        // horizontal y de al menos 40px: si no, es un toque o un scroll
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          deslizo.current = true;
          alDeslizar(dx < 0 ? 1 : -1);
        }
      },
      onPointerCancel: () => {
        inicio.current = null;
      },
    },
    fueDeslizamiento: () => deslizo.current,
  };
}

function Flechas({ total, onIr, clase }) {
  if (total < 2) return null;
  return (
    <>
      <button type="button" className={`${estilos.flecha} ${estilos.anterior} ${clase || ''}`} onClick={() => onIr(-1)} aria-label="Foto anterior">
        <CaretLeft size={20} weight="bold" />
      </button>
      <button type="button" className={`${estilos.flecha} ${estilos.siguiente} ${clase || ''}`} onClick={() => onIr(1)} aria-label="Foto siguiente">
        <CaretRight size={20} weight="bold" />
      </button>
    </>
  );
}

export default function GaleriaProducto({ producto, vendido = false, className = '' }) {
  const imagenes = (producto.imagenes || []).filter((img) => urlImagen(img.url));
  const total = imagenes.length;
  const [activa, setActiva] = useState(0);
  // hacia donde se movio (1 o -1): la foto nueva entra desde ese lado
  const [direccion, setDireccion] = useState(0);
  const [ampliada, setAmpliada] = useState(false);
  const dialogo = useRef(null);
  const tira = useRef(null);

  function ir(paso) {
    if (total < 2) return;
    setDireccion(paso);
    setActiva((i) => (i + paso + total) % total);
  }
  function elegir(i) {
    setDireccion(i > activa ? 1 : -1);
    setActiva(i);
  }

  const deslizar = useDeslizar(ir);
  const deslizarGrande = useDeslizar(ir);

  // precarga la anterior y la siguiente: al pasar, la foto ya esta
  useEffect(() => {
    if (total < 2) return;
    for (const i of [activa + 1, activa - 1]) {
      const img = new Image();
      img.src = urlImagen(imagenes[(i + total) % total].url);
    }
  }, [activa, total]); // eslint-disable-line react-hooks/exhaustive-deps

  // la miniatura activa siempre a la vista en la tira (sin mover la pagina)
  useEffect(() => {
    const el = tira.current?.children[activa];
    if (!el) return;
    const t = tira.current;
    const izq = el.offsetLeft - t.offsetLeft;
    if (izq < t.scrollLeft || izq + el.offsetWidth > t.scrollLeft + t.clientWidth) {
      t.scrollTo({ left: izq - (t.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' });
    }
  }, [activa]);

  // abrir y cerrar la vista grande (dialog nativo: foco, Escape y fondo)
  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (ampliada && !d.open) d.showModal();
    if (!ampliada && d.open) d.close();
  }, [ampliada]);

  function alTeclear(e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      ir(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      ir(-1);
    }
  }

  const foto = imagenes[activa];
  const contador = total > 1 && (
    <span className={estilos.contador} aria-hidden="true">
      {activa + 1} / {total}
    </span>
  );

  return (
    <div
      className={`${estilos.galeria} ${className}`}
      role={total > 1 ? 'region' : undefined}
      aria-roledescription={total > 1 ? 'carrusel' : undefined}
      aria-label={total > 1 ? `Fotos de ${producto.nombre}` : undefined}
      onKeyDown={total > 1 ? alTeclear : undefined}
    >
      <div className={`${estilos.tapa} ${vendido ? estilos.vendido : ''}`}>
        <ObjetoInterior producto={producto} />
        <div className={estilos.funda}>
          {foto ? (
            <>
              {/* tocar la foto la abre en grande (mouse y dedo); con teclado
                  se usa el boton de la lupa, que hace lo mismo */}
              <div
                className={estilos.visor}
                onClick={() => !deslizar.fueDeslizamiento() && setAmpliada(true)}
                {...deslizar.handlers}
              >
                {/* la key cambia con la foto: asi entra con su animacion (y si
                    una foto no carga, la siguiente no hereda el error) */}
                <div key={foto.id} className={estilos.cuadro} data-direccion={direccion}>
                  <ArteProducto producto={producto} imagen={foto} prioridad />
                </div>
              </div>
              <button
                type="button"
                className={estilos.lupa}
                onClick={() => setAmpliada(true)}
                aria-label={`Ver la foto ${activa + 1} en grande`}
              >
                <MagnifyingGlassPlus size={18} weight="bold" />
              </button>
            </>
          ) : (
            <ArteProducto producto={producto} prioridad />
          )}
          <Flechas total={total} onIr={ir} />
          {contador}
        </div>
      </div>

      {total > 1 && (
        <div className={estilos.miniaturas} ref={tira}>
          {imagenes.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => elegir(i)}
              aria-label={`Ver foto ${i + 1} de ${total}`}
              aria-current={i === activa ? 'true' : undefined}
              className={i === activa ? estilos.miniaturaActiva : undefined}
            >
              <img src={urlImagen(img.url)} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
      {total > 0 && <p className={estilos.nota}>Fotos del ejemplar exacto que te llevás.</p>}

      {/* la anunciamos para lectores de pantalla al cambiar de foto */}
      {total > 1 && (
        <p className="sr-only" aria-live="polite">
          Foto {activa + 1} de {total}
        </p>
      )}

      {foto && (
        <dialog
          ref={dialogo}
          className={estilos.grande}
          aria-label={`Foto ${activa + 1} de ${producto.nombre}`}
          onCancel={(e) => {
            e.preventDefault();
            setAmpliada(false);
          }}
          onClose={() => setAmpliada(false)}
          onClick={(e) => {
            // un click en el fondo (fuera de la foto y de los botones) cierra
            if (e.target === e.currentTarget || e.target.dataset.fondo !== undefined) setAmpliada(false);
          }}
          onKeyDown={(e) => {
            // el dialog esta adentro de la galeria: sin esto la flecha llega
            // tambien a la galeria y avanza dos fotos
            e.stopPropagation();
            if (total > 1) alTeclear(e);
          }}
        >
          <div className={estilos.grandeMarco} data-fondo {...deslizarGrande.handlers}>
            <img
              key={foto.id}
              className={estilos.grandeFoto}
              data-direccion={direccion}
              src={urlImagen(foto.url)}
              alt={foto.alt || producto.nombre}
            />
          </div>
          <button type="button" className={estilos.cerrar} onClick={() => setAmpliada(false)} aria-label="Cerrar">
            <X size={22} weight="bold" />
          </button>
          <Flechas total={total} onIr={ir} clase={estilos.flechaGrande} />
          {contador}
        </dialog>
      )}
    </div>
  );
}
