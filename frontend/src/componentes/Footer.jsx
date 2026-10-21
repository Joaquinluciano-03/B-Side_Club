// Pie del sitio: el Lado B. Todo sale de GET /api/store-info (lo edita el
// panel), asi que tiene que verse bien aunque falte algun dato o la info no
// este configurada todavia.

import { Link } from 'react-router-dom';
import { WhatsappLogo, InstagramLogo, EnvelopeSimple, Phone, MapPin } from '@phosphor-icons/react';
import { useStoreInfo } from '../lib/useStoreInfo';
import { normalizarHorario, horarioDeHoy } from '../lib/horario';
import { linkWhatsApp, linkInstagram, arrobaInstagram, linkMapa } from '../lib/contacto';
import estilos from './Footer.module.css';

export default function Footer() {
  const { info } = useStoreInfo();
  const horario = normalizarHorario(info?.horario);
  const hoy = horarioDeHoy(info?.horario);
  const whatsapp = linkWhatsApp(info?.whatsapp, 'Hola B-Side Club, les escribo desde la web.');
  const instagram = linkInstagram(info?.instagram);
  const mapa = linkMapa(info?.direccion);

  return (
    <footer className={estilos.footer} data-oscuro>
      <div className={estilos.grilla}>
        <div className={estilos.local}>
          <Link to="/" className={estilos.marca}>
            B-SIDE <span>CLUB</span>
          </Link>
          <p className={estilos.descripcion}>
            {info?.description || 'Discos nuevos o usados con garantía de calidad. Chacarita, Buenos Aires.'}
          </p>
          {hoy && (
            <p className={estilos.hoy}>
              Hoy: <strong>{hoy.value}</strong>
            </p>
          )}
          {info?.direccion && (
            <a href={mapa} target="_blank" rel="noreferrer" className={estilos.direccion}>
              <MapPin size={18} weight="duotone" aria-hidden="true" />
              {info.direccion}
            </a>
          )}
        </div>

        {horario.length > 0 && (
          <div>
            <h2 className={estilos.encabezado}>Horarios</h2>
            <dl className={estilos.horario}>
              {horario.map((fila) => (
                <div key={fila.label} className={fila.label === hoy?.label ? estilos.esHoy : undefined}>
                  <dt>{fila.label}</dt>
                  <dd>{fila.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* sin datos de contacto cargados la columna no se muestra */}
        {(whatsapp || instagram || info?.email || info?.telefono) && (
        <div>
          <h2 className={estilos.encabezado}>Contacto</h2>
          <ul className={estilos.lista}>
            {whatsapp && (
              <li>
                <a href={whatsapp} target="_blank" rel="noreferrer">
                  <WhatsappLogo size={18} weight="duotone" aria-hidden="true" /> WhatsApp
                </a>
              </li>
            )}
            {instagram && (
              <li>
                <a href={instagram} target="_blank" rel="noreferrer">
                  <InstagramLogo size={18} weight="duotone" aria-hidden="true" />
                  {arrobaInstagram(info.instagram)}
                </a>
              </li>
            )}
            {info?.email && (
              <li>
                <a href={`mailto:${info.email}`}>
                  <EnvelopeSimple size={18} weight="duotone" aria-hidden="true" /> {info.email}
                </a>
              </li>
            )}
            {info?.telefono && (
              <li>
                <a href={`tel:${String(info.telefono).replace(/[^\d+]/g, '')}`}>
                  <Phone size={18} weight="duotone" aria-hidden="true" /> {info.telefono}
                </a>
              </li>
            )}
          </ul>
        </div>
        )}

        <div>
          <h2 className={estilos.encabezado}>Sitio</h2>
          <ul className={estilos.lista}>
            <li>
              <Link to="/catalogo">Catálogo</Link>
            </li>
            <li>
              <Link to="/nosotros" viewTransition>
                Nosotros
              </Link>
            </li>
            <li>
              <Link to="/contacto">Contacto</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className={estilos.base}>
        <span>
          © {new Date().getFullYear()} {info?.nombre || 'B-Side Club'}
        </span>
        {/* el acceso del equipo: el login manda al panel (y si ya hay sesion,
            va directo). El header no lo muestra para no distraer al visitante */}
        <Link to="/login">Iniciar sesión</Link>
      </div>
    </footer>
  );
}
