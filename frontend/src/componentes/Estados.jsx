// Estados compartidos: carga, vacio y error.
// El skeleton tiene la misma forma que la card (funda + texto suelto), asi
// cuando llegan los productos no se mueve nada de lugar.

import { Disc, WarningCircle } from '@phosphor-icons/react';
import estilos from './Estados.module.css';

export function SkeletonGrilla({ cantidad = 8 }) {
  return (
    <div className="grilla-productos" aria-busy="true" aria-label="Cargando productos">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className={estilos.skelCard} aria-hidden="true">
          <div className={`skel ${estilos.skelFunda}`} />
          <div className={estilos.skelTexto}>
            <div className="skel-linea" style={{ width: '82%', height: 14 }} />
            <div className="skel-linea" style={{ width: '56%' }} />
            <div className="skel-linea" style={{ width: '34%', height: 16, marginTop: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Vacio({ titulo, texto, children }) {
  return (
    <div className={estilos.vacio}>
      <Disc size={40} weight="duotone" className={estilos.icono} aria-hidden="true" />
      <h2 className={estilos.titulo}>{titulo}</h2>
      {texto && <p className={estilos.texto}>{texto}</p>}
      {children && <div className={estilos.acciones}>{children}</div>}
    </div>
  );
}

// OJO con el nombre: si este componente se llamara "Error", taparia el
// constructor global Error en todos los modulos que lo importen, y un
// throw new Error(...) ahi adentro reventaria de forma muy confusa.
export function ErrorCarga({ mensaje, onReintentar }) {
  return (
    <div className={`${estilos.vacio} ${estilos.error}`} role="alert">
      <WarningCircle size={40} weight="duotone" className={estilos.icono} aria-hidden="true" />
      <h2 className={estilos.titulo}>No se pudo cargar</h2>
      <p className={estilos.texto}>{mensaje}</p>
      {onReintentar && (
        <div className={estilos.acciones}>
          <button className="btn btn-secundario" onClick={onReintentar}>
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}

// carga de una pantalla entera (panel): un disco chico girando
export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className={estilos.cargando} role="status">
      <span className={estilos.discoCargando} aria-hidden="true" />
      <span>{texto}</span>
    </div>
  );
}
