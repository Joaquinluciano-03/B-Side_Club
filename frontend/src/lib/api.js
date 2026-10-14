// Punto unico de contacto con el backend. Todo pedido pasa por aca para que
// la API key y el token se manden siempre y se configuren en un solo lugar
// (es el patron que documenta docs/backend-estado.txt).

// Por defecto "/api", o sea el mismo dominio desde el que se sirve el sitio.
// En Netlify eso lo atiende la funcion del backend; en desarrollo lo reenvia
// el proxy de vite.config.js. Solo hace falta definir VITE_API_URL si alguna
// vez el backend se muda a otro dominio.
const API_URL = import.meta.env.VITE_API_URL || '/api';
const API_KEY = import.meta.env.VITE_API_KEY || '';

const CLAVE_TOKEN = 'bsc_token';

export function guardarToken(token) {
  localStorage.setItem(CLAVE_TOKEN, token);
}

export function leerToken() {
  return localStorage.getItem(CLAVE_TOKEN);
}

export function borrarToken() {
  localStorage.removeItem(CLAVE_TOKEN);
}

// Error con el status a mano, para que las pantallas puedan distinguir
// "credenciales mal" (401) de "te pasaste de intentos" (429) sin parsear texto.
export class ErrorApi extends Error {
  constructor(mensaje, status) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.status = status;
  }
}

// Avisa cuando el token dejo de servir, para que el AuthProvider cierre sesion
// sin que cada pantalla tenga que acordarse de hacerlo.
let alExpirar = null;
export function alExpirarSesion(fn) {
  alExpirar = fn;
}

export async function api(ruta, opciones = {}) {
  const token = leerToken();
  const esFormData = opciones.body instanceof FormData;

  const headers = {
    'x-api-key': API_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opciones.headers,
  };

  // con FormData el Content-Type lo arma el navegador con su boundary:
  // si lo ponemos a mano, multer no encuentra donde empieza cada archivo
  if (!esFormData && opciones.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(API_URL + ruta, { ...opciones, headers });
  } catch {
    // fetch solo rechaza si no hubo respuesta: servidor caido, DNS, CORS
    throw new ErrorApi('No pudimos conectarnos con el servidor. ¿Está levantado el backend?', 0);
  }

  if (res.status === 204) return null;

  // algunas respuestas de error pueden no ser JSON (502 de un proxy, por ejemplo)
  let datos = null;
  const texto = await res.text();
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = null;
    }
  }

  if (!res.ok) {
    // el token vencio o es invalido: cerramos sesion una sola vez, desde aca
    if (res.status === 401 && token && alExpirar) alExpirar();
    throw new ErrorApi(datos?.error || `Error ${res.status}`, res.status);
  }

  return datos;
}

// Helpers para que las pantallas no repitan el objeto de opciones
export const get = (ruta) => api(ruta);
export const post = (ruta, body) =>
  api(ruta, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) });
export const put = (ruta, body) => api(ruta, { method: 'PUT', body: JSON.stringify(body) });
export const patch = (ruta, body) => api(ruta, { method: 'PATCH', body: JSON.stringify(body) });
export const del = (ruta) => api(ruta, { method: 'DELETE' });

// Arma una query string salteando los valores vacios, para no mandar
// ?q=&categoriaId= y que el backend filtre por cadena vacia.
export function query(params) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') usp.set(k, v);
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}

// Las imagenes se guardan en Supabase Storage, asi que la base ya tiene la
// URL completa y no hay nada que armar. Se deja la funcion igual porque
// todavia puede haber filas viejas con rutas relativas (las del seed, por
// ejemplo) y asi no revientan.
export function urlImagen(url) {
  if (!url) return null;
  return url;
}
