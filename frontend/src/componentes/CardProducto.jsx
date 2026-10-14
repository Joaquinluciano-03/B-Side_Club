// Card del catalogo. La forma sale de "CARD DE PRODUCTO" en la demo:
// arte cuadrado arriba, badge de stock, titulo, meta y precio.

import { Link } from 'react-router-dom';
import ArteProducto from './ArteProducto';
import { formatearPrecio, etiquetaStock, esAConsultar } from '../lib/formato';

export default function CardProducto({ producto }) {
  const { id, nombre, anio, precio, estado_stock, categoria, esActivo } = producto;

  return (
    <Link
      to={`/producto/${id}`}
      className="card-producto"
      style={{
        background: 'var(--superficie)',
        border: '1px solid var(--borde)',
        borderRadius: 'var(--r-card)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        color: 'inherit',
        transition: 'border-color .15s, transform .15s',
        // un producto inactivo solo lo ve el staff: lo marcamos para que se
        // note de un vistazo que el publico no lo esta viendo
        opacity: esActivo === false ? 0.55 : 1,
      }}
    >
      <ArteProducto producto={producto} categoria={categoria?.nombre} />

      <div
        style={{
          padding: '14px 15px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 7,
          flex: 1,
        }}
      >
        <span className={`badge badge-${estado_stock}`}>{etiquetaStock(estado_stock)}</span>

        <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.25 }}>{nombre}</div>

        <div style={{ color: 'var(--meta)', fontSize: 13 }}>
          {categoria?.nombre}
          {anio ? ` · ${anio}` : ''}
        </div>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: 4,
            fontWeight: 800,
            fontSize: 16,
            color: esAConsultar(precio) ? 'var(--teal)' : 'var(--tinta)',
            fontFamily: esAConsultar(precio) ? 'var(--mono)' : 'var(--cuerpo)',
            letterSpacing: esAConsultar(precio) ? '.08em' : 'normal',
          }}
        >
          {esAConsultar(precio) ? 'A CONSULTAR' : formatearPrecio(precio)}
        </div>
      </div>
    </Link>
  );
}
