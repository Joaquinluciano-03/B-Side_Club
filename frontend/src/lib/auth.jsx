// sesión del staff: token en localStorage, revalidado contra /auth/me al arrancar

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { get, post, put, guardarToken, borrarToken, leerToken, alExpirarSesion } from './api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  // "cargando" arranca en true si hay token, para que no parpadee el login a quien ya estaba logueado
  const [cargando, setCargando] = useState(Boolean(leerToken()));

  const cerrarSesion = useCallback(() => {
    borrarToken();
    setUsuario(null);
  }, []);

  // un 401 con token puesto significa que la sesión murió
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
        // token vencido o backend caído: sigue como visitante
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
    // con contraseña nueva el backend manda un token nuevo: hay que guardarlo
    const { token, ...u } = await put('/auth/me', datos);
    if (token) guardarToken(token);
    setUsuario(u);
    return u;
  }

  async function logout() {
    // el token no se guarda en el backend: si el pedido falla, se cierra la sesión local igual
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
