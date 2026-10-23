// El genero de un producto: se elige de la lista de generos (tabla Genero),
// asi siempre se escribe igual y el filtro del catalogo no repite opciones.
// Si falta uno, se agrega desde aca mismo sin salir del formulario; la lista
// completa (con borrar) esta en Panel > Categorias.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get, post } from '../lib/api';
import { mensajeDeError } from '../lib/formato';
import estilos from './SelectorGenero.module.css';

export default function SelectorGenero({ id = 'p-genero', valor, onChange }) {
  const [generos, setGeneros] = useState(null);
  const [agregando, setAgregando] = useState(false);
  const [nuevo, setNuevo] = useState('');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    get('/generos')
      .then(setGeneros)
      .catch(() => setGeneros([]));
  }, []);

  async function agregar() {
    const nombre = nuevo.trim();
    if (!nombre) {
      setError('Escribí el nombre del género.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const g = await post('/generos', { nombre });
      setGeneros((lista) => [...lista, { ...g, productos: 0 }].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
      onChange(String(g.id));
      setNuevo('');
      setAgregando(false);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className={`campo ${error ? 'con-error' : ''}`}>
      <label htmlFor={id}>Género</label>
      <div className={estilos.fila}>
        <select id={id} value={valor} onChange={(e) => onChange(e.target.value)} disabled={generos === null}>
          <option value="">{generos === null ? 'Cargando…' : 'Sin género'}</option>
          {generos?.map((g) => (
            <option key={g.id} value={String(g.id)}>
              {g.nombre}
            </option>
          ))}
        </select>
        {!agregando && (
          <button type="button" className="btn btn-secundario btn-chico" onClick={() => setAgregando(true)}>
            + Nuevo
          </button>
        )}
      </div>

      {agregando && (
        <div className={estilos.fila}>
          <input
            aria-label="Nombre del género nuevo"
            value={nuevo}
            onChange={(e) => {
              setNuevo(e.target.value);
              setError(null);
            }}
            // Enter agrega el genero; sin esto mandaria el formulario del producto
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                agregar();
              }
              if (e.key === 'Escape') setAgregando(false);
            }}
            placeholder="Por ejemplo: Cumbia"
            maxLength={40}
            autoFocus
          />
          <button type="button" className="btn btn-primario btn-chico" onClick={agregar} disabled={guardando}>
            {guardando ? 'Agregando…' : 'Agregar'}
          </button>
          <button
            type="button"
            className="btn btn-secundario btn-chico"
            onClick={() => {
              setAgregando(false);
              setNuevo('');
              setError(null);
            }}
          >
            Cancelar
          </button>
        </div>
      )}

      {error ? (
        <div className="campo-error">{error}</div>
      ) : (
        <div className="campo-ayuda">
          Para filtrar el catálogo. En equipos y accesorios, «Sin género». La lista se administra en{' '}
          <Link to="/panel/categorias">Categorías</Link>.
        </div>
      )}
    </div>
  );
}
