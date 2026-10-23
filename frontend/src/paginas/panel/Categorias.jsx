// Categorias: alta, edicion y baja en la misma pantalla (son pocas y cortas,
// no justifican una ruta aparte).
// El backend rechaza con 409 borrar una categoria que tenga productos.
// Cada categoria lleva un icono (SelectorIcono). Al crearla se sugiere uno
// segun el nombre que se va escribiendo, hasta que se elige otro a mano.
// Tambien la unidad con que se cuentan sus productos en el sitio ("4 equipos");
// vacia = "títulos".

import { useEffect, useState } from 'react';
import { get, post, put, del } from '../../lib/api';
import { CabeceraPanel, CuerpoPanel } from '../../layouts/LayoutPanel';
import { Cargando, ErrorCarga, Vacio } from '../../componentes/Estados';
import Confirmar from '../../componentes/Confirmar';
import IconoCategoria, { iconoSugerido } from '../../componentes/IconoCategoria';
import SelectorIcono from '../../componentes/SelectorIcono';
import SeccionGeneros from './SeccionGeneros';
import { UNIDAD_POR_DEFECTO, cantidadCon, pluralSugerido, unidadDe } from '../../lib/unidades';
import { useToast } from '../../lib/toast';
import { olvidarConteos } from '../../lib/useConteos';
import { mensajeDeError } from '../../lib/formato';

export default function Categorias() {
  const toast = useToast();
  const [categorias, setCategorias] = useState(null);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(null); // null | 'nueva' | id
  const VACIO = { nombre: '', descripcion: '', icono: null, singular: '', plural: '' };
  const [form, setForm] = useState(VACIO);
  // true cuando el plural lo escribio la persona: desde ahi el singular ya no lo sugiere
  const [pluralEscrito, setPluralEscrito] = useState(false);
  const [errorUnidad, setErrorUnidad] = useState(null);
  // true cuando el icono lo eligio la persona: desde ahi el nombre ya no lo cambia
  const [iconoElegido, setIconoElegido] = useState(false);
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
    setForm(VACIO);
    setIconoElegido(false);
    setPluralEscrito(false);
    setErrorUnidad(null);
    setAviso(null);
  }

  function abrirEdicion(c) {
    setEditando(c.id);
    setForm({
      nombre: c.nombre,
      descripcion: c.descripcion || '',
      icono: c.icono ?? iconoSugerido(c.nombre),
      singular: c.unidad_singular || '',
      plural: c.unidad_plural || '',
    });
    setIconoElegido(Boolean(c.icono));
    setPluralEscrito(Boolean(c.unidad_plural));
    setErrorUnidad(null);
    setAviso(null);
  }

  async function guardar(ev) {
    ev.preventDefault();
    if (!form.nombre.trim()) return;
    const singular = form.singular.trim();
    const plural = form.plural.trim();
    if (Boolean(singular) !== Boolean(plural)) {
      setErrorUnidad('Completá las dos formas, o dejá las dos vacías para usar "títulos".');
      document.getElementById(singular ? 'cat-plural' : 'cat-singular')?.focus();
      return;
    }

    setGuardando(true);
    setAviso(null);
    try {
      const cuerpo = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        icono: form.icono,
        unidad_singular: singular || null,
        unidad_plural: plural || null,
      };
      if (editando === 'nueva') {
        await post('/categorias', cuerpo);
        toast.exito('Categoría creada.');
      } else {
        await put(`/categorias/${editando}`, cuerpo);
        toast.exito('Cambios guardados.');
      }
      // el sitio tiene las categorias en memoria: asi se ve el cambio al volver
      olvidarConteos();

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
      olvidarConteos();
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
          <form onSubmit={guardar} className="card" style={{ marginBottom: 18, maxWidth: 760 }}>
            <div className="etiqueta">{editando === 'nueva' ? 'Nueva categoría' : 'Editar categoría'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="campo">
                <label htmlFor="cat-nombre">Nombre</label>
                <input
                  id="cat-nombre"
                  value={form.nombre}
                  onChange={(e) => {
                    const nombre = e.target.value;
                    setForm((f) => ({ ...f, nombre, icono: iconoElegido ? f.icono : iconoSugerido(nombre) }));
                  }}
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
                  placeholder='LPs de 12", nuevos o usados con garantía de calidad'
                />
              </div>
              <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
                <legend className="etiqueta">Cómo se cuentan sus productos</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <div className={`campo ${errorUnidad && !form.singular.trim() ? 'con-error' : ''}`}>
                    <label htmlFor="cat-singular">Uno</label>
                    <input
                      id="cat-singular"
                      value={form.singular}
                      onChange={(e) => {
                        const singular = e.target.value;
                        setErrorUnidad(null);
                        setForm((f) => ({ ...f, singular, plural: pluralEscrito ? f.plural : pluralSugerido(singular) }));
                      }}
                      placeholder={UNIDAD_POR_DEFECTO.singular}
                    />
                  </div>
                  <div className={`campo ${errorUnidad && !form.plural.trim() ? 'con-error' : ''}`}>
                    <label htmlFor="cat-plural">Varios</label>
                    <input
                      id="cat-plural"
                      value={form.plural}
                      onChange={(e) => {
                        setErrorUnidad(null);
                        setPluralEscrito(true);
                        setForm((f) => ({ ...f, plural: e.target.value }));
                      }}
                      placeholder={UNIDAD_POR_DEFECTO.plural}
                    />
                  </div>
                </div>
                {errorUnidad ? (
                  <div className="campo-error">{errorUnidad}</div>
                ) : (
                  <div className="campo-ayuda">
                    En el sitio se va a leer «
                    {cantidadCon(1, { unidad_singular: form.singular, unidad_plural: form.plural })}» y «
                    {cantidadCon(4, { unidad_singular: form.singular, unidad_plural: form.plural })}». Vacío, dice
                    títulos.
                  </div>
                )}
              </fieldset>
              <SelectorIcono
                valor={form.icono}
                onChange={(icono) => {
                  setForm((f) => ({ ...f, icono }));
                  setIconoElegido(true);
                }}
              />
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
                  <th style={{ width: 56 }}>
                    <span className="sr-only">Icono</span>
                  </th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Se cuentan en</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((c) => (
                  <tr key={c.id}>
                    <td style={{ paddingTop: 6, paddingBottom: 6 }}>
                      <span style={{ display: 'grid', placeItems: 'center', width: 44, height: 44 }}>
                        <IconoCategoria categoria={c} />
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{c.nombre}</td>
                    <td style={{ color: 'var(--tinta-dim)' }}>{c.descripcion || '—'}</td>
                    <td data-etiqueta="Se cuentan en" style={{ color: 'var(--tinta-dim)' }}>
                      {unidadDe(c).plural}
                    </td>
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

        <SeccionGeneros />
      </CuerpoPanel>
    </>
  );
}
