// Ficha del producto: la hoja de inspeccion del ejemplar. Un producto dado de
// baja da 404 al visitante (lo filtra el backend); el staff logueado si lo
// ve, con un aviso de que no esta publico.

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CaretRight, WhatsappLogo, EnvelopeSimple, SealCheck, PencilSimple, Wrench } from '@phosphor-icons/react';
import { get, query } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useStoreInfo } from '../lib/useStoreInfo';
import { linkWhatsApp } from '../lib/contacto';
import { formatoDe } from '../componentes/ArteProducto';
import GaleriaProducto from '../componentes/GaleriaProducto';
import CardProducto from '../componentes/CardProducto';
import Precio from '../componentes/Precio';
import { Vacio } from '../componentes/Estados';
import {
  esAConsultar,
  etiquetaStock,
  mensajeDeError,
  separarNombre,
  gradoGoldmine,
  ESCALA_GOLDMINE,
} from '../lib/formato';
import estilos from './DetalleProducto.module.css';

function EscalaEstado({ condicion }) {
  const grado = gradoGoldmine(condicion);
  if (!grado) return null;
  return (
    <div className={estilos.escala}>
      <p className={estilos.escalaTitulo}>Estado del ejemplar (escala Goldmine)</p>
      <ol className={estilos.escalaLista}>
        {ESCALA_GOLDMINE.map((g) => (
          <li
            key={g.codigo}
            className={g.codigo === grado ? estilos.escalaActual : undefined}
            aria-current={g.codigo === grado ? 'true' : undefined}
          >
            <span className={estilos.escalaCodigo}>{g.codigo}</span>
            <span className={estilos.escalaNombre}>{g.nombre}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Esqueleto() {
  return (
    <main className={estilos.pagina} aria-busy="true">
      <div className={estilos.grilla}>
        <div className={`skel ${estilos.esqueletoTapa}`} />
        <div className={estilos.esqueletoTexto}>
          <div className="skel-linea" style={{ width: '30%' }} />
          <div className="skel-linea" style={{ width: '80%', height: 40 }} />
          <div className="skel-linea" style={{ width: '45%', height: 18 }} />
          <div className="skel-linea" style={{ width: '35%', height: 34, marginTop: 20 }} />
          <div className="skel-linea" style={{ width: '100%', height: 70, marginTop: 20 }} />
        </div>
      </div>
    </main>
  );
}

export default function DetalleProducto() {
  const { id } = useParams();
  const { esStaff } = useAuth();
  const { info } = useStoreInfo();

  const [producto, setProducto] = useState(null);
  const [error, setError] = useState(null);
  const [relacionados, setRelacionados] = useState([]);

  useEffect(() => {
    let vigente = true;
    setProducto(null);
    setError(null);
    window.scrollTo(0, 0);

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
      <main className={estilos.pagina}>
        <Vacio
          titulo={error.status === 404 ? 'Ese disco ya no está en el cajón' : 'No se pudo cargar'}
          texto={
            error.status === 404
              ? 'Puede que se haya vendido o que ya no esté publicado. Escribinos y te avisamos si entra otro.'
              : mensajeDeError(error)
          }
        >
          <Link className="btn btn-secundario" to="/catalogo">
            Volver al catálogo
          </Link>
          <Link className="btn btn-primario" to="/contacto">
            Escribinos
          </Link>
        </Vacio>
      </main>
    );
  }

  if (!producto) return <Esqueleto />;

  const vendido = producto.estado_stock === 'vendido';
  const consultar = esAConsultar(producto.precio);
  const { titulo, artista } = separarNombre(producto.nombre);
  const formato = formatoDe(producto.categoria?.nombre);
  const categoria = producto.categoria;

  const mensaje = `Hola B-Side Club! Me interesa "${producto.nombre}" (${window.location.href}). ¿Sigue disponible?`;
  const whatsapp = linkWhatsApp(info?.whatsapp, mensaje);
  const formulario = `/contacto?productoId=${producto.id}`;

  const ctaPrincipal = vendido ? (
    <Link className={`btn btn-primario ${estilos.cta}`} to={formulario}>
      <EnvelopeSimple size={18} weight="bold" /> Avisame si entra otro
    </Link>
  ) : whatsapp ? (
    <a className={`btn btn-primario ${estilos.cta}`} href={whatsapp} target="_blank" rel="noreferrer">
      <WhatsappLogo size={18} weight="bold" /> Consultar por WhatsApp
    </a>
  ) : (
    <Link className={`btn btn-primario ${estilos.cta}`} to={formulario}>
      <EnvelopeSimple size={18} weight="bold" /> Consultar por este disco
    </Link>
  );

  const ficha = [
    ['Formato', categoria?.nombre],
    ['Año', producto.anio],
    ['Condición', producto.condicion],
    [
      'Disponibilidad',
      producto.stock > 1 && !vendido
        ? `${etiquetaStock(producto.estado_stock)} · ${producto.stock} en el local`
        : etiquetaStock(producto.estado_stock),
    ],
  ].filter(([, v]) => v !== null && v !== undefined && v !== '');

  return (
    <main className={estilos.pagina}>
      <nav className={estilos.migas} aria-label="Estás en">
        <Link to="/catalogo">Catálogo</Link>
        {categoria && (
          <>
            <CaretRight size={12} aria-hidden="true" />
            <Link to={`/catalogo${query({ categoriaId: categoria.id })}`}>{categoria.nombre}</Link>
          </>
        )}
        <CaretRight size={12} aria-hidden="true" />
        <span aria-current="page">{titulo}</span>
      </nav>

      {producto.esActivo === false && (
        <div className="aviso aviso-error">
          Este producto está dado de baja: no aparece en el catálogo público. Lo ves porque tenés
          sesión iniciada.
        </div>
      )}

      <div className={estilos.grilla}>
        {/* ---------- la tapa con sus fotos (flechas, deslizar, teclado y vista
            grande: ver GaleriaProducto). La key la reinicia al cambiar de producto */}
        <GaleriaProducto key={producto.id} producto={producto} vendido={vendido} className={estilos.galeria} />

        {/* ---------- la hoja de inspeccion ---------- */}
        <div className={`${estilos.hoja} cascada`} style={{ '--cascada-inicio': '160ms' }}>
          <p className={estilos.meta}>
            {categoria?.nombre}
            {producto.anio ? ` · ${producto.anio}` : ''}
          </p>
          <h1 className={estilos.titulo}>{titulo}</h1>
          {artista && <p className={estilos.artista}>{artista}</p>}

          <div className={estilos.precioFila}>
            <p className={`${estilos.precio} ${consultar ? estilos.consultar : ''} ${vendido ? estilos.tachado : ''}`}>
              {consultar ? 'A consultar' : <Precio producto={producto} variante="ficha" />}
            </p>
            {producto.estado_stock !== 'disponible' && !(producto.estado_stock === 'a_consultar' && consultar) && (
              <span className={`badge badge-${producto.estado_stock}`}>
                {etiquetaStock(producto.estado_stock)}
              </span>
            )}
          </div>
          {consultar && !vendido && (
            <p className={estilos.notaPrecio}>Es una pieza especial: el precio lo charlamos.</p>
          )}

          {formato !== 'equipo' && <EscalaEstado condicion={producto.condicion} />}

          <p className={estilos.descripcion}>{producto.descripcion}</p>

          <dl className={estilos.ficha}>
            {ficha.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <div className={estilos.acciones}>
            {ctaPrincipal}
            {!vendido && whatsapp && (
              <Link className="btn btn-secundario" to={formulario}>
                Escribir un mensaje
              </Link>
            )}
            {esStaff && (
              <Link to={`/panel/productos/${producto.id}`} className="btn btn-secundario">
                <PencilSimple size={16} weight="bold" /> Editar
              </Link>
            )}
          </div>

          <p className={estilos.promesa}>
            {formato === 'equipo' ? (
              <Wrench size={20} weight="duotone" aria-hidden="true" />
            ) : (
              <SealCheck size={20} weight="duotone" aria-hidden="true" />
            )}
            <span>
              {formato === 'equipo'
                ? 'Revisado por nuestro técnico antes de publicarlo.'
                : 'Lo revisamos antes de publicarlo: tiene garantía de calidad.'}{' '}
              Si te interesa, te lo guardamos 48 hs.
            </span>
          </p>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className={estilos.relacionados}>
          <div className={estilos.relacionadosCabecera}>
            <h2>Más de {categoria?.nombre}</h2>
            <Link className="btn-enlace" to={`/catalogo${query({ categoriaId: categoria?.id })}`}>
              Ver todos
            </Link>
          </div>
          <div className="grilla-productos">
            {relacionados.map((p) => (
              <CardProducto key={p.id} producto={p} />
            ))}
          </div>
        </section>
      )}

      {/* mobile: precio y consulta siempre a mano */}
      <div className={estilos.barraMovil} data-oscuro>
        <div>
          <p className={estilos.barraTitulo}>{titulo}</p>
          <p className={estilos.barraPrecio}>
            {consultar ? 'A consultar' : <Precio producto={producto} variante="compacto" />}
          </p>
        </div>
        {/* el mismo destino que el CTA principal, con rotulo corto */}
        {vendido ? (
          <Link className={`btn btn-primario ${estilos.cta}`} to={formulario}>
            Avisame
          </Link>
        ) : whatsapp ? (
          <a className={`btn btn-primario ${estilos.cta}`} href={whatsapp} target="_blank" rel="noreferrer">
            <WhatsappLogo size={18} weight="bold" /> Consultar
          </a>
        ) : (
          <Link className={`btn btn-primario ${estilos.cta}`} to={formulario}>
            Consultar
          </Link>
        )}
      </div>
    </main>
  );
}
