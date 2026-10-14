// Ficha del producto. Un producto dado de baja da 404 al visitante (lo filtra
// el backend); el staff logueado si lo ve, con un aviso de que no esta publico.

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { get, query, urlImagen } from '../lib/api';
import { useAuth } from '../lib/auth';
import ArteProducto from '../componentes/ArteProducto';
import CardProducto from '../componentes/CardProducto';
import { Cargando, Vacio } from '../componentes/Estados';
import { formatearPrecio, esAConsultar, etiquetaStock, mensajeDeError } from '../lib/formato';

export default function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { esStaff } = useAuth();

  const [producto, setProducto] = useState(null);
  const [error, setError] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [imagenActiva, setImagenActiva] = useState(0);

  useEffect(() => {
    let vigente = true;
    setProducto(null);
    setError(null);
    setImagenActiva(0);

    get(`/productos/${id}`)
      .then((p) => {
        if (!vigente) return;
        setProducto(p);
        // otros de la misma categoria, sacando el actual
        return get(`/productos${query({ categoriaId: p.categoriaId, pageSize: 5 })}`).then((r) => {
          if (vigente) setRelacionados(r.productos.filter((x) => x.id !== p.id).slice(0, 4));
        });
      })
      .catch((err) => {
        if (vigente) setError(err);
      });

    return () => {
      vigente = false;
    };
  }, [id]);

  if (error) {
    return (
      <main className="contenido">
        <Vacio
          titulo={error.status === 404 ? 'NO ENCONTRAMOS ESE DISCO' : 'NO CARGÓ'}
          texto={
            error.status === 404
              ? 'Puede que se haya vendido o que ya no esté publicado.'
              : mensajeDeError(error)
          }
        >
          <button className="btn btn-secundario" onClick={() => navigate('/catalogo')}>
            Volver al catálogo
          </button>
        </Vacio>
      </main>
    );
  }

  if (!producto) return <Cargando texto="Buscando el disco…" />;

  const imagenes = producto.imagenes || [];
  const portada = imagenes[imagenActiva];
  const sinStock = producto.estado_stock === 'vendido';

  return (
    <main className="contenido">
      <Link to="/catalogo" className="btn-enlace" style={{ marginBottom: 22, display: 'inline-block' }}>
        ← Volver al catálogo
      </Link>

      {producto.esActivo === false && (
        <div className="aviso aviso-error">
          Este producto está dado de baja: no aparece en el catálogo público. Lo ves porque tenés
          sesión iniciada.
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 34,
          alignItems: 'start',
        }}
      >
        {/* ---------- Arte ---------- */}
        <div>
          <div
            style={{
              borderRadius: 'var(--r-card)',
              overflow: 'hidden',
              border: '1px solid var(--borde)',
              background: 'var(--carbon)',
            }}
          >
            {portada ? (
              <img
                src={urlImagen(portada.url)}
                alt={portada.alt || producto.nombre}
                style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <ArteProducto
                producto={producto}
                categoria={producto.categoria?.nombre}
                girando
                mostrarTag={false}
              />
            )}
          </div>

          {imagenes.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {imagenes.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setImagenActiva(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  style={{
                    width: 64,
                    height: 64,
                    padding: 0,
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: `2px solid ${i === imagenActiva ? 'var(--naranja)' : 'var(--borde)'}`,
                    background: 'var(--carbon)',
                  }}
                >
                  <img
                    src={urlImagen(img.url)}
                    alt={img.alt || ''}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---------- Datos ---------- */}
        <div>
          <div className="kicker">{producto.categoria?.nombre}</div>

          <h1
            style={{
              fontFamily: 'var(--display)',
              fontSize: 'clamp(26px, 4.5vw, 42px)',
              lineHeight: 1.08,
              margin: '0 0 14px',
              fontWeight: 400,
            }}
          >
            {producto.nombre}
          </h1>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            <span className={`badge badge-${producto.estado_stock}`}>
              {etiquetaStock(producto.estado_stock)}
            </span>
            {producto.anio && (
              <span className="badge badge-neutro">{producto.anio}</span>
            )}
            {producto.destacado && (
              <span
                className="badge"
                style={{
                  background: 'var(--naranja)',
                  color: 'var(--tinta-sobre-naranja)',
                  border: '1px solid var(--naranja)',
                }}
              >
                Destacado
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: esAConsultar(producto.precio) ? 22 : 34,
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: 6,
              color: esAConsultar(producto.precio) ? 'var(--teal)' : 'var(--tinta)',
              fontFamily: esAConsultar(producto.precio) ? 'var(--mono)' : 'var(--cuerpo)',
              letterSpacing: esAConsultar(producto.precio) ? '.06em' : 'normal',
            }}
          >
            {esAConsultar(producto.precio) ? 'A CONSULTAR' : formatearPrecio(producto.precio)}
          </div>

          {esAConsultar(producto.precio) && (
            <div style={{ color: 'var(--meta)', fontSize: 13, marginBottom: 18 }}>
              Es una pieza especial: el precio lo charlamos.
            </div>
          )}

          <p
            style={{
              color: 'var(--tinta-cuerpo)',
              fontSize: 16,
              margin: '20px 0',
              textWrap: 'pretty',
            }}
          >
            {producto.descripcion}
          </p>

          {/* ficha tecnica */}
          <div
            className="card"
            style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}
          >
            {[
              ['Categoría', producto.categoria?.nombre],
              ['Año', producto.anio],
              ['Condición', producto.condicion],
              ['Disponibilidad', etiquetaStock(producto.estado_stock)],
              esStaff ? ['Stock', producto.stock] : null,
            ]
              .filter((f) => f && f[1] !== null && f[1] !== undefined && f[1] !== '')
              .map(([k, v], i, arr) => (
                <div
                  key={k}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '13px 18px',
                    borderBottom: i < arr.length - 1 ? '1px solid #c2cacd' : 'none',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 10,
                      letterSpacing: '.18em',
                      color: 'var(--meta)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {k}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="btn btn-primario"
              disabled={sinStock}
              onClick={() => navigate(`/contacto?productoId=${producto.id}`)}
            >
              {sinStock ? 'Vendido' : 'Consultar por este disco'}
            </button>
            {esStaff && (
              <Link to={`/panel/productos/${producto.id}`} className="btn btn-secundario">
                Editar
              </Link>
            )}
          </div>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section style={{ marginTop: 70 }}>
          <div className="divisor">Más en {producto.categoria?.nombre}</div>
          <div className="grilla-productos">
            {relacionados.map((p) => (
              <CardProducto key={p.id} producto={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
