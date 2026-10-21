// Card del catalogo: la tapa como una funda con el disco adentro. Quieta, el
// disco asoma un poco por el costado; al pasar el mouse (o con foco) se
// desliza afuera, como cuando sacas un disco de la batea para mirarlo.
// Abajo, sin caja: estado (solo si no es "disponible"), titulo, artista,
// formato y año, y el precio (con el descuento, si tiene).

import { Link } from 'react-router-dom';
import ArteProducto, { ObjetoInterior } from './ArteProducto';
import Precio from './Precio';
import { etiquetaStock, esAConsultar, separarNombre } from '../lib/formato';
import estilos from './CardProducto.module.css';

export default function CardProducto({ producto, prioridad = false }) {
  const { id, nombre, anio, precio, estado_stock, categoria, esActivo } = producto;
  const { titulo, artista } = separarNombre(nombre);
  const consultar = esAConsultar(precio);
  // "a consultar" con precio null ya lo dice el precio: no repetirlo en un badge
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
        </div>
      </div>

      <div className={estilos.texto}>
        {(mostrarEstado || esActivo === false) && (
          <div className={estilos.estados}>
            {/* inactivo: solo lo ve el staff con sesion iniciada */}
            {esActivo === false && <span className="badge badge-neutro">Oculto al público</span>}
            {mostrarEstado && (
              <span className={`badge badge-${estado_stock}`}>{etiquetaStock(estado_stock)}</span>
            )}
          </div>
        )}

        <h3 className={estilos.titulo}>{titulo}</h3>
        {artista && <p className={estilos.artista}>{artista}</p>}
        <p className={estilos.meta}>
          {categoria?.nombre}
          {anio ? ` · ${anio}` : ''}
        </p>
        <p className={`${estilos.precio} ${consultar ? estilos.consultar : ''}`}>
          {consultar ? 'A consultar' : <Precio producto={producto} variante="card" />}
        </p>
      </div>
    </Link>
  );
}
