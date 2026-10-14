// Listado de productos del panel. A diferencia del catalogo publico, aca se
// ven tambien los dados de baja (el backend los muestra cuando hay token).

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get, del, put, query, urlImagen } from '../../lib/api';
import { CabeceraPanel, CuerpoPanel } from '../../layouts/LayoutPanel';
import { Cargando, ErrorCarga, Vacio } from '../../componentes/Estados';
import Confirmar from '../../componentes/Confirmar';
import { useToast } from '../../lib/toast';
import { formatearPrecio, etiquetaStock, mensajeDeError } from '../../lib/formato';

const FILTROS = [
  { v: '', label: 'Todos' },
  { v: 'true', label: 'Publicados' },
  { v: 'false', label: 'Dados de baja' },
];

const chip = (activo) => ({
  background: activo ? 'var(--naranja)' : 'transparent',
  color: activo ? 'var(--tinta-sobre-naranja)' : 'var(--tinta-suave)',
  border: `1px solid ${activo ? 'var(--naranja)' : 'var(--borde-boton)'}`,
  fontWeight: 700,
  fontSize: 12,
  padding: '7px 14px',
  borderRadius: 999,
  cursor: 'pointer',
});

export default function Productos() {
  const navigate = useNavigate();
  const toast = useToast();

  const [texto, setTexto] = useState('');
  const [q, setQ] = useState('');
  const [esActivo, setEsActivo] = useState('');
  const [page, setPage] = useState(1);

  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [aBorrar, setABorrar] = useState(null);
  const [recargar, setRecargar] = useState(0);

  // mismo debounce que el catalogo publico: un pedido por tecla se come el
  // limite de 300 cada 15 minutos
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(texto);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [texto]);

  useEffect(() => {
    let vigente = true;
    setDatos(null);
    setError(null);
    get(`/productos${query({ q, esActivo, page, pageSize: 20 })}`)
      .then((r) => vigente && setDatos(r))
      .catch((err) => vigente && setError(mensajeDeError(err)));
    return () => {
      vigente = false;
    };
  }, [q, esActivo, page, recargar]);

  async function borrar() {
    const p = aBorrar;
    setABorrar(null);
    try {
      await del(`/productos/${p.id}`);
      toast.exito(`"${p.nombre}" se eliminó.`);
      setRecargar((r) => r + 1);
    } catch (err) {
      toast.error(mensajeDeError(err));
    }
  }

  // dar de baja no borra: deja el producto fuera del catalogo publico pero
  // conserva su historial y sus consultas asociadas
  async function alternarActivo(p) {
    try {
      await put(`/productos/${p.id}`, { esActivo: !p.esActivo });
      toast.exito(p.esActivo ? `"${p.nombre}" salió del catálogo.` : `"${p.nombre}" ya está publicado.`);
      setRecargar((r) => r + 1);
    } catch (err) {
      toast.error(mensajeDeError(err));
    }
  }

  return (
    <>
      <CabeceraPanel
        kicker="Catálogo"
        titulo="PRODUCTOS"
        accion={
          <Link to="/panel/productos/nuevo" className="btn btn-primario btn-chico">
            + Nuevo producto
          </Link>
        }
      />
      <CuerpoPanel>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <input
            placeholder="Buscar producto…"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            style={{
              background: '#fff',
              border: '1px solid var(--borde-fuerte)',
              borderRadius: 'var(--r-control)',
              padding: '13px 14px',
              fontSize: 15,
              outline: 'none',
              maxWidth: 320,
              flex: 1,
              minWidth: 200,
            }}
          />
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {FILTROS.map((f) => (
              <button
                key={f.v}
                style={chip(esActivo === f.v)}
                onClick={() => {
                  setEsActivo(f.v);
                  setPage(1);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="mono" style={{ marginLeft: 'auto' }}>
            {datos ? `${datos.total} en total` : ''}
          </div>
        </div>

        {error ? (
          <ErrorCarga mensaje={error} onReintentar={() => setRecargar((r) => r + 1)} />
        ) : !datos ? (
          <Cargando />
        ) : datos.productos.length === 0 ? (
          <Vacio
            titulo="NADA POR ACÁ"
            texto={q || esActivo ? 'Ningún producto coincide con ese filtro.' : 'Todavía no cargaste productos.'}
          >
            <Link to="/panel/productos/nuevo" className="btn btn-primario">
              Cargar el primero
            </Link>
          </Vacio>
        ) : (
          <>
            <div className="tabla-scroll">
              <table className="tabla">
                <thead>
                  <tr>
                    <th style={{ width: 54 }} />
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.productos.map((p) => (
                    <tr key={p.id} style={{ opacity: p.esActivo ? 1 : 0.55 }}>
                      <td>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 6,
                            overflow: 'hidden',
                            background: 'var(--carbon)',
                          }}
                        >
                          {p.imagenes?.[0] && (
                            <img
                              src={urlImagen(p.imagenes[0].url)}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                        </div>
                      </td>
                      <td>
                        <Link to={`/panel/productos/${p.id}`} style={{ fontWeight: 700, color: 'inherit' }}>
                          {p.nombre}
                        </Link>
                        <div style={{ color: 'var(--meta)', fontSize: 12 }}>
                          {p.anio}
                          {p.destacado && ' · destacado'}
                          {!p.esActivo && ' · dado de baja'}
                        </div>
                      </td>
                      <td style={{ color: 'var(--tinta-dim)' }}>{p.categoria?.nombre}</td>
                      <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {formatearPrecio(p.precio)}
                      </td>
                      <td>{p.stock}</td>
                      <td>
                        <span className={`badge badge-${p.estado_stock}`}>
                          {etiquetaStock(p.estado_stock)}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}
                        >
                          <button
                            className="btn btn-secundario btn-chico"
                            onClick={() => navigate(`/panel/productos/${p.id}`)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-secundario btn-chico"
                            onClick={() => alternarActivo(p)}
                          >
                            {p.esActivo ? 'Dar de baja' : 'Publicar'}
                          </button>
                          <button className="btn btn-peligro btn-chico" onClick={() => setABorrar(p)}>
                            Borrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {datos.totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 20,
                  flexWrap: 'wrap',
                }}
              >
                <div className="mono">
                  PÁGINA {datos.page} DE {datos.totalPages}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-secundario btn-chico"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ← Anterior
                  </button>
                  <button
                    className="btn btn-secundario btn-chico"
                    disabled={page >= datos.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <Confirmar
          abierto={Boolean(aBorrar)}
          titulo="¿Borrar el producto?"
          texto={`"${aBorrar?.nombre}" se elimina junto con sus imágenes y no se puede deshacer. Si solo querés sacarlo del catálogo, usá "Dar de baja".`}
          onConfirmar={borrar}
          onCancelar={() => setABorrar(null)}
        />
      </CuerpoPanel>
    </>
  );
}
