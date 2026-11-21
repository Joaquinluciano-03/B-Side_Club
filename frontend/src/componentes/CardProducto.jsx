// card del catálogo: la tapa como una funda con el disco que asoma y sale al pasar el mouse.
// Todas tienen la misma estructura para que se lean parejas (estado como sticker en la tapa, precio al pie)

import { Link } from 'react-router-dom';
import ArteProducto, { ObjetoInterior } from './ArteProducto';
import Precio from './Precio';
import IconoCategoria from './IconoCategoria';
import { etiquetaStock, esAConsultar, separarNombre } from '../lib/formato';
import estilos from './CardProducto.module.css';

export default function CardProducto({ producto, prioridad = false }) {
  const { id, nombre, anio, precio, estado_stock, categoria, esActivo } = producto;
  const { titulo, artista } = separarNombre(nombre);
  const consultar = esAConsultar(precio);
  // "a consultar" ya lo dice el precio, no se repite en un badge
  const mostrarEstado = estado_stock !== 'disponible' && !(estado_stock === 'a_consultar' && consultar);

  return (
    <Link
      to={`/producto/${id}`}
      className={`${estilos.card} ${estado_stock === 'vendido' ? estilos.vendido : ''}`}
    >
      <div className={estilos.arte}>
        <ObjetoInterior producto={producto} />
        <div className={estilos.funda}>
          <ArteProducto producto={producto} prioridad={prioridad} />
          {(mostrarEstado || esActivo === false) && (
            <div className={estilos.stickers}>
              {/* inactivo: solo lo ve el staff con sesion iniciada */}
              {esActivo === false && <span className="badge badge-neutro">Oculto al público</span>}
              {mostrarEstado && (
                <span className={`badge badge-${estado_stock}`}>{etiquetaStock(estado_stock)}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={estilos.pie}>
        <div className={estilos.encabezado}>
          <div className={estilos.texto}>
            <h3 className={estilos.titulo}>{titulo}</h3>
            {artista && <p className={estilos.artista}>{artista}</p>}
            <p className={estilos.meta}>
              {categoria?.nombre}
              {anio ? ` · ${anio}` : ''}
            </p>
          </div>
          {/* decorativo: el nombre de la categoria ya esta escrito en la meta */}
          {categoria && (
            <span className={estilos.icono}>
              <IconoCategoria categoria={categoria} />
            </span>
          )}
        </div>

        <p className={`${estilos.precio} ${consultar ? estilos.consultar : ''}`}>
          {consultar ? 'A consultar' : <Precio producto={producto} variante="card" />}
        </p>
      </div>
    </Link>
  );
}
