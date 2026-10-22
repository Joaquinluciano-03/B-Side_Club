// Equipo. Las reglas de permisos las decide el backend; aca solo escondemos
// los botones que sabemos que van a dar 403, para no ofrecer acciones que no
// se pueden hacer:
//   - al super_admin no lo toca nadie
//   - nadie puede asignar el rol super_admin
//   - solo el super_admin puede eliminar a un administrador

import { useEffect, useState } from 'react';
import { get, put, del } from '../../lib/api';
import { CabeceraPanel, CuerpoPanel } from '../../layouts/LayoutPanel';
import { Cargando, ErrorCarga, Vacio } from '../../componentes/Estados';
import Confirmar from '../../componentes/Confirmar';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../lib/toast';
import { etiquetaRol, mensajeDeError } from '../../lib/formato';

const ROLES_ASIGNABLES = ['vendedor', 'administrador'];

export default function Usuarios() {
  const { usuario: yo } = useAuth();
  const toast = useToast();
  const [usuarios, setUsuarios] = useState(null);
  const [error, setError] = useState(null);
  const [aBorrar, setABorrar] = useState(null);
  const [recargar, setRecargar] = useState(0);

  useEffect(() => {
    setError(null);
    get('/usuarios')
      .then(setUsuarios)
      .catch((err) => setError(mensajeDeError(err)));
  }, [recargar]);

  async function cambiarRol(u, rol) {
    try {
      const actualizado = await put(`/usuarios/${u.id}`, { rol });
      setUsuarios((prev) => prev.map((x) => (x.id === u.id ? actualizado : x)));
      toast.exito(`${u.nombre} ahora es ${etiquetaRol(rol).toLowerCase()}.`);
    } catch (err) {
      toast.error(mensajeDeError(err));
    }
  }

  async function borrar() {
    const u = aBorrar;
    setABorrar(null);
    try {
      await del(`/usuarios/${u.id}`);
      toast.exito(`${u.nombre} ya no tiene acceso al panel.`);
      setRecargar((r) => r + 1);
    } catch (err) {
      toast.error(mensajeDeError(err));
    }
  }

  const soyDueño = yo?.rol === 'super_admin';

  return (
    <>
      <CabeceraPanel kicker="Equipo" titulo="GENTE DEL LOCAL" />
      <CuerpoPanel>
        {error ? (
          <ErrorCarga mensaje={error} onReintentar={() => setRecargar((r) => r + 1)} />
        ) : !usuarios ? (
          <Cargando />
        ) : usuarios.length === 0 ? (
          <Vacio titulo="NO HAY NADIE" texto="Invitá gente desde la sección Invitaciones." />
        ) : (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const esDueño = u.rol === 'super_admin';
                  const soyYo = u.id === yo?.id;
                  // el backend solo deja al super_admin eliminar administradores
                  const puedoBorrar =
                    !esDueño && !soyYo && (u.rol !== 'administrador' || soyDueño);

                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700 }}>
                        {u.nombre} {u.apellido}
                        {soyYo && (
                          <span style={{ color: 'var(--meta)', fontWeight: 400 }}> · vos</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--tinta-dim)' }}>{u.mail}</td>
                      <td data-etiqueta="Teléfono" style={{ color: 'var(--tinta-dim)' }}>
                        {u.telefono || '—'}
                      </td>
                      <td data-etiqueta="Rol">
                        {esDueño ? (
                          <span className="badge badge-neutro">{etiquetaRol(u.rol)}</span>
                        ) : (
                          <select
                            value={u.rol}
                            onChange={(e) => cambiarRol(u, e.target.value)}
                            aria-label={`Rol de ${u.nombre}`}
                            style={{
                              background: '#fff',
                              border: '1px solid var(--borde-fuerte)',
                              borderRadius: 'var(--r-control)',
                              padding: '7px 10px',
                              fontSize: 13,
                              outline: 'none',
                            }}
                          >
                            {ROLES_ASIGNABLES.map((r) => (
                              <option key={r} value={r}>
                                {etiquetaRol(r)}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {puedoBorrar ? (
                          <button className="btn btn-peligro btn-chico" onClick={() => setABorrar(u)}>
                            Eliminar
                          </button>
                        ) : (
                          <span style={{ color: 'var(--apagado)', fontSize: 12 }}>
                            {esDueño ? 'Protegido' : soyYo ? '—' : 'Solo el dueño'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Confirmar
          abierto={Boolean(aBorrar)}
          titulo="¿Eliminar del equipo?"
          texto={`${aBorrar?.nombre} ${aBorrar?.apellido} pierde el acceso al panel. No se puede deshacer.`}
          onConfirmar={borrar}
          onCancelar={() => setABorrar(null)}
        />
      </CuerpoPanel>
    </>
  );
}
