// Precio de un producto. Sin descuento es el precio formateado, tal cual.
// Con descuento muestra el precio original tachado, el precio nuevo y un
// badge con el descuento aplicado ("-15%" o "-$ 20.000"); en la ficha suma
// cuanto se ahorra. El tamaño de la letra lo pone el contenedor (todo va en
// em), asi sirve igual en la card, en la ficha y en el panel.
//
// variante: "card" | "ficha" | "compacto" (barra mobile y listado del panel)
// "A consultar" lo resuelve quien lo usa, porque cada lugar lo pinta distinto.

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
