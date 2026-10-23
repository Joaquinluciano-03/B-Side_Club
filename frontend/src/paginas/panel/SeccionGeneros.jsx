// La lista de generos musicales (va en Panel > Categorias). Los productos
// eligen su genero de esta lista, asi todos se escriben igual y el filtro del
// catalogo no repite opciones. Un genero solo se borra si ningun producto lo
// usa: el backend lo vuelve a chequear y contesta 409 si hiciera falta.

import { useEffect, useState } from 'react';
import { get, post, del } from '../../lib/api';
import { Cargando, ErrorCarga } from '../../componentes/Estados';
import Confirmar from '../../componentes/Confirmar';
import { useToast } from '../../lib/toast';
import { olvidarConteos } from '../../lib/useConteos';
import { mensajeDeError } from '../../lib/formato';

export default function SeccionGeneros() {
  const toast = useToast();
  const [generos, setGeneros] = useState(null);
  const [error, setError] = useState(null);
  const [recargar, setRecargar] = useState(0);
  const [nuevo, setNuevo] = useState('');
  const [errorNuevo, setErrorNuevo] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [aBorrar, setABorrar] = useState(null);

  useEffect(() => {
    setError(null);
    get('/generos')
      .then(setGeneros)
      .catch((err) => setError(mensajeDeError(err)));
  }, [recargar]);

  async function agregar(ev) {
    ev.preventDefault();
    const nombre = nuevo.trim();
    if (!nombre) {
      setErrorNuevo('Escribí el nombre del género.');
      return;
    }
    setGuardando(true);
    setErrorNuevo(null);
    try {
      await post('/generos', { nombre });
      toast.exito(`"${nombre}" se agregó a la lista.`);
      setNuevo('');
      setRecargar((r) => r + 1);
    } catch (err) {
      // el 409 de "ya existe" queda junto al campo, que es donde se corrige
      setErrorNuevo(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  async function borrar() {
    const g = aBorrar;
    setABorrar(null);
    try {
      await del(`/generos/${g.id}`);
      olvidarConteos();
      toast.exito(`"${g.nombre}" se borró.`);
      setRecargar((r) => r + 1);
    } catch (err) {
      toast.error(mensajeDeError(err));
    }
  }

  return (
    <section className="card" style={{ marginTop: 28, maxWidth: 760 }} aria-labelledby="generos-titulo">
      <h2 id="generos-titulo" className="etiqueta" style={{ marginTop: 0 }}>
        Géneros musicales
      </h2>
      <p style={{ color: 'var(--tinta-dim)', fontSize: 14, margin: '0 0 16px' }}>
        Los productos eligen su género de esta lista, y con ella se filtra el catálogo. Un género se puede borrar
        solo si ningún producto lo usa.
      </p>

      <form onSubmit={agregar} noValidate style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div className={`campo ${errorNuevo ? 'con-error' : ''}`} style={{ flex: '1 1 240px' }}>
          <label htmlFor="genero-nuevo" className="sr-only">
            Nombre del género nuevo
          </label>
          <input
            id="genero-nuevo"
            value={nuevo}
            onChange={(e) => {
              setNuevo(e.target.value);
              setErrorNuevo(null);
            }}
            placeholder="Nuevo género, por ejemplo: Cumbia"
            maxLength={40}
          />
          {errorNuevo && <div className="campo-error">{errorNuevo}</div>}
        </div>
        <button type="submit" className="btn btn-primario" disabled={guardando}>
          {guardando ? 'Agregando…' : 'Agregar'}
        </button>
      </form>

      <div style={{ marginTop: 18 }}>
        {error ? (
          <ErrorCarga mensaje={error} onReintentar={() => setRecargar((r) => r + 1)} />
        ) : !generos ? (
          <Cargando />
        ) : generos.length === 0 ? (
          <p style={{ color: 'var(--tinta-dim)', margin: 0 }}>Todavía no hay géneros. Agregá el primero.</p>
        ) : (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Género</th>
                  <th>Productos</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {generos.map((g) => (
                  <tr key={g.id}>
                    <td style={{ fontWeight: 700 }}>{g.nombre}</td>
                    <td data-etiqueta="Productos" style={{ color: 'var(--tinta-dim)', fontVariantNumeric: 'tabular-nums' }}>
                      {g.productos}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {g.productos === 0 ? (
                        <button className="btn btn-peligro btn-chico" onClick={() => setABorrar(g)}>
                          Borrar
                        </button>
                      ) : (
                        <span
                          style={{ color: 'var(--apagado)', fontSize: 12 }}
                          title={`Lo ${g.productos === 1 ? 'usa 1 producto' : `usan ${g.productos} productos`}: cambiales el género para poder borrarlo.`}
                        >
                          En uso
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Confirmar
        abierto={Boolean(aBorrar)}
        titulo="¿Borrar el género?"
        texto={`"${aBorrar?.nombre}" deja de estar en la lista. Ningún producto lo usa.`}
        onConfirmar={borrar}
        onCancelar={() => setABorrar(null)}
      />
    </section>
  );
}
