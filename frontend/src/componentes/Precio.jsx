// precio de un producto: con descuento muestra el original tachado, el nuevo y un badge ("-15%"); en la ficha suma cuánto se ahorra.
// Todo va en em, así que el tamaño lo pone el contenedor. variante: "card" | "ficha" | "compacto".
// "A consultar" lo resuelve quien lo usa

import { formatearPrecio, descuentoDe } from '../lib/formato';
import estilos from './Precio.module.css';

export default function Precio({ producto, variante = 'card' }) {
  const descuento = descuentoDe(producto);
  if (!descuento) return formatearPrecio(producto.precio);

  return (
    <span className={`${estilos.precio} ${estilos[variante]}`}>
      {/* los lectores de pantalla no anuncian el tachado: se dice con palabras */}
      <span className="sr-only">Precio anterior: </span>
      <del className={estilos.antes}>{formatearPrecio(producto.precio)}</del>
      <span className="sr-only">. Precio con descuento: </span>
      <ins className={estilos.ahora}>{formatearPrecio(descuento.final)}</ins>
      <span className={estilos.badge}>
        <span className="sr-only">Descuento de </span>
        {descuento.etiqueta}
      </span>
      {variante === 'ficha' && (
        <span className={estilos.ahorro}>Ahorrás {formatearPrecio(descuento.ahorro)}</span>
      )}
    </span>
  );
}
