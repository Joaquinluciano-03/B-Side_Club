// Listado de productos del panel. A diferencia del catalogo publico, aca se
// ven tambien los dados de baja (el backend los muestra cuando hay token).
// Lo de todos los dias se hace desde la fila: ajustar stock, destacar,
// publicar o dar de baja. Editar abre el formulario completo.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlass, Plus, Minus, Star, Trash, PencilSimple, SealPercent } from '@phosphor-icons/react';
import { get, del, put, query } from '../../lib/api';
import { CabeceraPanel, CuerpoPanel } from '../../layouts/LayoutPanel';
import { Cargando, ErrorCarga, Vacio } from '../../componentes/Estados';
import Confirmar from '../../componentes/Confirmar';
import Modal from '../../componentes/Modal';
import Segmentos from '../../componentes/Segmentos';
import Paginacion from '../../componentes/Paginacion';
import ArteProducto from '../../componentes/ArteProducto';
import Precio from '../../componentes/Precio';
import CamposDescuento, { errorDescuento } from '../../componentes/CamposDescuento';
import { useToast } from '../../lib/toast';
import { olvidarConteos } from '../../lib/useConteos';
import { esAConsultar, etiquetaStock, mensajeDeError, separarNombre } from '../../lib/formato';
import estilos from './Productos.module.css';

const FILTROS = [
  { valor: '', label: 'Todos' },
  { valor: 'true', label: 'Publicados' },
  { valor: 'false', label: 'Dados de baja' },
];

export default function Productos() {
  const toast = useToast();

  const [texto, setTexto] = useState('');
  const [q, setQ] = useState('');
  const [esActivo, setEsActivo] = useState('');
  const [page, setPage] = useState(1);

  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [aBorrar, setABorrar] = useState(null);
  const [recargar, setRecargar] = useState(0);
  // atajo de descuento: el producto que se esta editando y lo que se carga
  const [aDescontar, setADescontar] = useState(null);
  const [descuento, setDescuento] = useState({ tipo: '', valor: '' });
  const [errorDesc, setErrorDesc] = useState(null);

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

  // cambia un campo en la lista sin recargar todo (y vuelve atras si falla)
  async function actualizar(p, cambios, mensaje) {
    const antes = datos.productos;
    setDatos((d) => ({ ...d, productos: d.productos.map((x) => (x.id === p.id ? { ...x, ...cambios } : x)) }));
    try {
      await put(`/productos/${p.id}`, cambios);
      olvidarConteos();
      if (mensaje) toast.exito(mensaje);
    } catch (err) {
      setDatos((d) => ({ ...d, productos: antes }));
      toast.error(mensajeDeError(err));
    }
  }

  function abrirDescuento(p) {
    setADescontar(p);
    setDescuento({
      tipo: p.descuento_tipo ?? '',
      valor: p.descuento_valor != null ? String(Number(p.descuento_valor)) : '',
    });
    setErrorDesc(null);
  }

  // guarda lo cargado en el modal; quitar=true lo saca sin importar lo cargado
  function guardarDescuento(ev, quitar = false) {
    ev?.preventDefault();
    const p = aDescontar;
    const tipo = quitar ? '' : descuento.tipo;
    const error = errorDescuento(p.precio, tipo, descuento.valor);
    if (error) {
      setErrorDesc(error);
      document.getElementById('lista-descuento-valor')?.focus();
      return;
    }
    setADescontar(null);
    const { titulo } = separarNombre(p.nombre);
    actualizar(
      p,
      { descuento_tipo: tipo || null, descuento_valor: tipo ? Number(descuento.valor) : null },
      tipo ? `Descuento aplicado a "${titulo}".` : `"${titulo}" quedó sin descuento.`
    );
  }

  async function borrar() {
    const p = aBorrar;
    setABorrar(null);
    try {
      await del(`/productos/${p.id}`);
      olvidarConteos();
      toast.exito(`"${p.nombre}" se eliminó.`);
      setRecargar((r) => r + 1);
    } catch (err) {
      toast.error(mensajeDeError(err));
    }
  }

  return (
    <>
      <CabeceraPanel
        kicker="Catálogo"
        titulo="Productos"
        accion={
          <Link to="/panel/productos/nuevo" className="btn btn-primario btn-chico">
            <Plus size={16} weight="bold" /> Nuevo producto
          </Link>
        }
      />
      <CuerpoPanel>
        <div className={estilos.barra}>
          <label className={estilos.buscador}>
            <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
            <span className="sr-only">Buscar producto</span>
            <input
              type="search"
              placeholder="Buscar por título, artista o descripción"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </label>
          <Segmentos
            id="productos"
            etiqueta="Filtrar por estado de publicación"
            opciones={FILTROS}
            valor={esActivo}
            onCambiar={(v) => {
              setEsActivo(v);
              setPage(1);
            }}
          />
          <span className={estilos.total}>{datos ? `${datos.total} en total` : ''}</span>
        </div>

        {error ? (
          <ErrorCarga mensaje={error} onReintentar={() => setRecargar((r) => r + 1)} />
        ) : !datos ? (
          <Cargando />
        ) : datos.productos.length === 0 ? (
          <Vacio
            titulo="Nada por acá"
            texto={q || esActivo ? 'Ningún producto coincide con ese filtro.' : 'Todavía no cargaste productos.'}
          >
            <Link to="/panel/productos/nuevo" className="btn btn-primario">
              Cargar el primero
            </Link>
          </Vacio>
        ) : (
          <>
            <div className={estilos.tabla} role="table" aria-label="Productos">
              <div className={estilos.encabezado} role="row">
                <span role="columnheader" className={estilos.colProducto}>
                  Producto
                </span>
                <span role="columnheader">Precio</span>
                <span role="columnheader">Stock</span>
                <span role="columnheader">Estado</span>
                <span role="columnheader" className={estilos.colAcciones}>
                  <span className="sr-only">Acciones</span>
                </span>
              </div>

              {datos.productos.map((p) => {
                const { titulo, artista } = separarNombre(p.nombre);
                return (
                  <div key={p.id} role="row" className={`${estilos.fila} ${!p.esActivo ? estilos.deBaja : ''}`}>
                    <div role="cell" className={estilos.colProducto}>
                      <div className={estilos.miniatura}>
                        <ArteProducto producto={p} />
                      </div>
                      <div className={estilos.nombre}>
                        <Link to={`/panel/productos/${p.id}`} className={estilos.titulo}>
                          {titulo}
                        </Link>
                        <span className={estilos.sub}>
                          {[artista, p.categoria?.nombre, p.anio].filter(Boolean).join(' · ')}
                        </span>
                        {!p.esActivo && <span className={estilos.baja}>Dado de baja</span>}
                      </div>
                    </div>

                    <div role="cell" className={estilos.precio}>
                      {esAConsultar(p.precio) ? 'A consultar' : <Precio producto={p} variante="compacto" />}
                    </div>

                    <div role="cell" className={estilos.stock}>
                      <button
                        type="button"
                        aria-label={`Restar uno al stock de ${titulo}`}
                        disabled={p.stock <= 0}
                        onClick={() => actualizar(p, { stock: p.stock - 1 })}
                      >
                        <Minus size={14} weight="bold" />
                      </button>
                      <span aria-label="Stock">{p.stock}</span>
                      <button
                        type="button"
                        aria-label={`Sumar uno al stock de ${titulo}`}
                        onClick={() => actualizar(p, { stock: p.stock + 1 })}
                      >
                        <Plus size={14} weight="bold" />
                      </button>
                    </div>

                    <div role="cell" className={estilos.estado}>
                      <span className={`badge badge-${p.estado_stock}`}>{etiquetaStock(p.estado_stock)}</span>
                    </div>

                    <div role="cell" className={estilos.colAcciones}>
                      <button
                        type="button"
                        className={`${estilos.icono} ${p.destacado ? estilos.destacado : ''}`}
                        aria-pressed={p.destacado}
                        aria-label={p.destacado ? `Quitar ${titulo} de destacados` : `Destacar ${titulo} en la home`}
                        title={p.destacado ? 'Destacado en la home' : 'Destacar en la home'}
                        onClick={() =>
                          actualizar(
                            p,
                            { destacado: !p.destacado },
                            p.destacado ? 'Ya no está destacado.' : 'Destacado: aparece en la home.'
                          )
                        }
                      >
                        <Star size={18} weight={p.destacado ? 'fill' : 'regular'} />
                      </button>
                      {/* sin precio ("a consultar") no hay a que descontarle */}
                      <button
                        type="button"
                        className={`${estilos.icono} ${p.descuento_tipo ? estilos.conDescuento : ''}`}
                        aria-label={p.descuento_tipo ? `Cambiar el descuento de ${titulo}` : `Aplicar un descuento a ${titulo}`}
                        title={
                          esAConsultar(p.precio)
                            ? 'Sin precio: no se puede aplicar descuento'
                            : p.descuento_tipo
                              ? 'Cambiar o quitar el descuento'
                              : 'Aplicar descuento'
                        }
                        disabled={esAConsultar(p.precio)}
                        onClick={() => abrirDescuento(p)}
                      >
                        <SealPercent size={18} weight={p.descuento_tipo ? 'fill' : 'regular'} />
                      </button>
                      <Link to={`/panel/productos/${p.id}`} className="btn btn-secundario btn-chico">
                        <PencilSimple size={15} weight="bold" /> Editar
                      </Link>
                      <button
                        type="button"
                        className="btn btn-secundario btn-chico"
                        onClick={() =>
                          actualizar(
                            p,
                            { esActivo: !p.esActivo },
                            p.esActivo ? `"${titulo}" salió del catálogo.` : `"${titulo}" ya está publicado.`
                          )
                        }
                      >
                        {p.esActivo ? 'Dar de baja' : 'Publicar'}
                      </button>
                      <button
                        type="button"
                        className={`${estilos.icono} ${estilos.borrar}`}
                        aria-label={`Borrar ${titulo}`}
                        title="Borrar"
                        onClick={() => setABorrar(p)}
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={estilos.paginas}>
              <Paginacion pagina={datos.page} totalPaginas={datos.totalPages} onCambiar={setPage} />
            </div>
          </>
        )}

        <Modal
          abierto={Boolean(aDescontar)}
          onCerrar={() => setADescontar(null)}
          kicker={aDescontar ? separarNombre(aDescontar.nombre).titulo : ''}
          titulo="Descuento"
          bajada="Por porcentaje o por un monto fijo en pesos. En el sitio se ve el precio original tachado y el nuevo."
          ancho={480}
        >
          {aDescontar && (
            <form onSubmit={guardarDescuento} noValidate>
              <CamposDescuento
                id="lista-descuento"
                precio={aDescontar.precio}
                tipo={descuento.tipo}
                valor={descuento.valor}
                error={errorDesc}
                onCambiar={(d) => {
                  setDescuento(d);
                  setErrorDesc(null);
                }}
              />
              <div className={estilos.modalAcciones}>
                {aDescontar.descuento_tipo && (
                  <button
                    type="button"
                    className={`btn-enlace ${estilos.quitar}`}
                    onClick={(e) => guardarDescuento(e, true)}
                  >
                    Quitar descuento
                  </button>
                )}
                <button type="button" className="btn btn-secundario" onClick={() => setADescontar(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primario">
                  Guardar
                </button>
              </div>
            </form>
          )}
        </Modal>

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
