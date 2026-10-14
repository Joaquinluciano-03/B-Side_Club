// Sesion del staff. Guarda el token en localStorage y revalida contra
// /auth/me al arrancar, porque el token puede haber vencido entre visitas.

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { get, post, put, guardarToken, borrarToken, leerToken, alExpirarSesion } from './api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  // "cargando" arranca en true si hay token: hasta que /me conteste no sabemos
  // si la sesion sigue viva, y mostrar el login mientras tanto haria parpadear
  // la pantalla a todo el que ya estaba logueado.
  const [cargando, setCargando] = useState(Boolean(leerToken()));

  const cerrarSesion = useCallback(() => {
    borrarToken();
    setUsuario(null);
  }, []);

  // si cualquier pedido vuelve 401 con un token puesto, la sesion murio
  useEffect(() => {
    alExpirarSesion(cerrarSesion);
  }, [cerrarSesion]);

  useEffect(() => {
    if (!leerToken()) return;
    let vigente = true;
    get('/auth/me')
      .then((u) => {
        if (vigente) setUsuario(u);
      })
      .catch(() => {
        // token vencido o backend caido: arrancamos como visitante
        borrarToken();
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, []);

  async function login(mail, password) {
    const { token, user } = await post('/auth/login', { mail, password });
    guardarToken(token);
    setUsuario(user);
    return user;
  }

  async function registrar(datos) {
    const { token, user } = await post('/auth/register', datos);
    guardarToken(token);
    setUsuario(user);
    return user;
  }

  async function actualizarPerfil(datos) {
    const u = await put('/auth/me', datos);
    setUsuario(u);
    return u;
  }

  async function logout() {
    // el token es stateless: el backend solo confirma, el que lo descarta
    // es el frontend. Si el pedido falla igual cerramos sesion local.
    try {
      await post('/auth/logout', {});
    } catch {
      /* no importa */
    }
    cerrarSesion();
  }

  const esStaff = Boolean(usuario);
  const puedeInvitar = usuario?.rol === 'super_admin' || usuario?.rol === 'administrador';

  return (
    <Ctx.Provider
      value={{ usuario, cargando, esStaff, puedeInvitar, login, logout, registrar, actualizarPerfil }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth tiene que usarse adentro de <AuthProvider>');
  return ctx;
}
