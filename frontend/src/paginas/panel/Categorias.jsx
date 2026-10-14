// Categorias: alta, edicion y baja en la misma pantalla (son pocas y cortas,
// no justifican una ruta aparte).
// El backend rechaza con 409 borrar una categoria que tenga productos.

import { useEffect, useState } from 'react';
import { get, post, put, del } from '../../lib/api';
import { CabeceraPanel, CuerpoPanel } from '../../layouts/LayoutPanel';
import { Cargando, ErrorCarga, Vacio } from '../../componentes/Estados';
import Confirmar from '../../componentes/Confirmar';
import { useToast } from '../../lib/toast';
import { mensajeDeError } from '../../lib/formato';

export default function Categorias() {
  const toast = useToast();
  const [categorias, setCategorias] = useState(null);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(null); // null | 'nueva' | id
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [guardando, setGuardando] = useState(false);
  const [aBorrar, setABorrar] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [recargar, setRecargar] = useState(0);

  useEffect(() => {
    setError(null);
    get('/categorias')
      .then(setCategorias)
      .catch((err) => setError(mensajeDeError(err)));
  }, [recargar]);

  function abrirNueva() {
    setEditando('nueva');
    setForm({ nombre: '', descripcion: '' });
    setAviso(null);
  }

  function abrirEdicion(c) {
    setEditando(c.id);
    setForm({ nombre: c.nombre, descripcion: c.descripcion || '' });
    setAviso(null);
  }

  async function guardar(ev) {
    ev.preventDefault();
    if (!form.nombre.trim()) return;

    setGuardando(true);
    setAviso(null);
    try {
      const cuerpo = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
      };
      if (editando === 'nueva') {
        await post('/categorias', cuerpo);
        toast.exito('Categoría creada.');
      } else {
        await put(`/categorias/${editando}`, cuerpo);
        toast.exito('Cambios guardados.');
      }

      setEditando(null);
      setRecargar((r) => r + 1);
    } catch (err) {
      toast.error(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  async function borrar() {
    const c = aBorrar;
    setABorrar(null);
    try {
      await del(`/categorias/${c.id}`);
      toast.exito(`"${c.nombre}" se eliminó.`);
      setRecargar((r) => r + 1);
    } catch (err) {
      // El 409 explica qué hacer (mover los productos primero), así que se
      // queda fijo en pantalla; un toast se iría antes de terminar de leerlo.
      if (err.status === 409) {
        setAviso({
          tipo: 'error',
          texto: `No se puede borrar "${c.nombre}": todavía hay productos usándola. Movelos a otra categoría primero.`,
        });
      } else {
        toast.error(mensajeDeError(err));
      }
    }
  }

  return (
    <>
      <CabeceraPanel
        kicker="Catálogo"
        titulo="CATEGORÍAS"
        accion={
          <button className="btn btn-primario btn-chico" onClick={abrirNueva}>
            + Nueva categoría
          </button>
        }
      />
      <CuerpoPanel>
        {aviso && <div className={`aviso aviso-${aviso.tipo}`}>{aviso.texto}</div>}

        {editando !== null && (
          <form onSubmit={guardar} className="card" style={{ marginBottom: 18, maxWidth: 520 }}>
            <div className="etiqueta">{editando === 'nueva' ? 'Nueva categoría' : 'Editar categoría'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="campo">
                <label htmlFor="cat-nombre">Nombre</label>
                <input
                  id="cat-nombre"
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Vinilos"
                  autoFocus
                />
              </div>
              <div className="campo">
                <label htmlFor="cat-desc">Descripción</label>
                <input
                  id="cat-desc"
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  placeholder='LPs de 12", usados y escuchados enteros'
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primario btn-chico" disabled={guardando}>
                  {guardando ? 'Guardando…' : 'Guardar'}
                </button>
                <button
                  type="button"
                  className="btn btn-secundario btn-chico"
                  onClick={() => setEditando(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}

        {error ? (
          <ErrorCarga mensaje={error} onReintentar={() => setRecargar((r) => r + 1)} />
        ) : !categorias ? (
          <Cargando />
        ) : categorias.length === 0 ? (
          <Vacio titulo="SIN CATEGORÍAS" texto="Creá al menos una para poder cargar productos.">
            <button className="btn btn-primario" onClick={abrirNueva}>
              Crear la primera
            </button>
          </Vacio>
        ) : (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700 }}>{c.nombre}</td>
                    <td style={{ color: 'var(--tinta-dim)' }}>{c.descripcion || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secundario btn-chico"
                          onClick={() => abrirEdicion(c)}
                        >
                          Editar
                        </button>
                        <button className="btn btn-peligro btn-chico" onClick={() => setABorrar(c)}>
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Confirmar
          abierto={Boolean(aBorrar)}
          titulo="¿Borrar la categoría?"
          texto={`Si "${aBorrar?.nombre}" tiene productos asociados, el servidor no va a dejar borrarla.`}
          onConfirmar={borrar}
          onCancelar={() => setABorrar(null)}
        />
      </CuerpoPanel>
    </>
  );
}
