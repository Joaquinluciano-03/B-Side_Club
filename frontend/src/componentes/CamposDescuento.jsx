// Campos para cargar el descuento de un producto en el panel: el tipo (sin
// descuento, porcentaje o monto fijo), el valor y, abajo, como queda el
// precio. Lo usan el formulario del producto y el atajo del listado.
//
// Es controlado: recibe tipo ('' | 'porcentaje' | 'monto') y valor (string)
// y avisa los cambios con onCambiar({ tipo, valor }).

import Segmentos from './Segmentos';
import { calcularDescuento, esAConsultar, formatearPrecio } from '../lib/formato';
import estilos from './CamposDescuento.module.css';

const TIPOS = [
  { valor: '', label: 'Sin descuento' },
  { valor: 'porcentaje', label: 'Porcentaje' },
  { valor: 'monto', label: 'Monto fijo' },
];

// mismas reglas que el backend (src/services/producto.service.js): asi el
// error aparece al lado del campo en vez de volver como 400 al guardar
export function errorDescuento(precio, tipo, valor) {
  if (!tipo) return null;
  if (esAConsultar(precio)) return 'Poné un precio para poder aplicar un descuento.';
  const v = Number(valor);
  if (valor === '' || !Number.isFinite(v)) return 'Poné cuánto se descuenta.';
  if (v <= 0) return 'El descuento tiene que ser mayor a 0.';
  if (tipo === 'porcentaje' && v >= 100) return 'El porcentaje tiene que ser menor a 100.';
  if (tipo === 'monto' && v >= Number(precio)) return 'El descuento no puede ser igual o mayor que el precio.';
  return null;
}

export default function CamposDescuento({ id, precio, tipo, valor, onCambiar, error }) {
  const sinPrecio = esAConsultar(precio);
  const descuento = calcularDescuento(precio, tipo, valor);

  return (
    <div className={`campo ${error ? 'con-error' : ''}`}>
      <span className="etiqueta">Descuento</span>
      {sinPrecio ? (
        <div className="campo-ayuda">Un producto “a consultar” no lleva descuento: primero poné un precio.</div>
      ) : (
        <>
          {/* el div evita que .campo (flex en columna) estire los segmentos */}
          <div>
            <Segmentos
              id={id}
              etiqueta="Tipo de descuento"
              opciones={TIPOS}
              valor={tipo}
              onCambiar={(t) => onCambiar({ tipo: t, valor: t === tipo ? valor : '' })}
            />
          </div>

          {tipo && (
            <div className={estilos.fila}>
              <label htmlFor={`${id}-valor`} className="sr-only">
                {tipo === 'porcentaje' ? 'Porcentaje de descuento' : 'Monto a descontar en pesos'}
              </label>
              <div className={estilos.entrada}>
                {tipo === 'monto' && <span aria-hidden="true">$</span>}
                <input
                  id={`${id}-valor`}
                  inputMode="decimal"
                  value={valor}
                  onChange={(e) => onCambiar({ tipo, valor: e.target.value })}
                  placeholder={tipo === 'porcentaje' ? '15' : '20000'}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${id}-resumen`}
                />
                {tipo === 'porcentaje' && <span aria-hidden="true">%</span>}
              </div>

              <p className={estilos.resumen} id={`${id}-resumen`} aria-live="polite">
                {descuento ? (
                  <>
                    <del>{formatearPrecio(precio)}</del>
                    <strong>{formatearPrecio(descuento.final)}</strong>
                    <span className={estilos.descuento}>{descuento.etiqueta}</span>
                  </>
                ) : (
                  'El precio final aparece acá.'
                )}
              </p>
            </div>
          )}
        </>
      )}
      {error && <div className="campo-error">{error}</div>}
    </div>
  );
}
