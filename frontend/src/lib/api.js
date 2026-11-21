// único punto de contacto con el backend: manda siempre la API key y el token

// API_URL es "/api" (mismo dominio; en desarrollo lo reenvía el proxy de vite.config.js). VITE_API_URL solo si el backend se muda
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

// error con el status, para distinguir un 401 de un 429 sin parsear texto
export class ErrorApi extends Error {
  constructor(mensaje, status) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.status = status;
  }
}

// avisa cuando el token dejó de servir, para que el AuthProvider cierre la sesión
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

  // con FormData el navegador arma el Content-Type con su boundary; a mano, multer no encuentra los archivos
  if (!esFormData && opciones.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(API_URL + ruta, { ...opciones, headers });
  } catch {
    // fetch solo rechaza si no hubo respuesta: servidor caído, DNS, CORS
    throw new ErrorApi('No pudimos conectarnos con el servidor. ¿Está levantado el backend?', 0);
  }

  if (res.status === 204) return null;

  // un error puede no ser JSON (ej. 502 de un proxy)
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
    // token vencido o inválido: se cierra sesión una sola vez, desde acá
    if (res.status === 401 && token && alExpirar) alExpirar();
    throw new ErrorApi(datos?.error || `Error ${res.status}`, res.status);
  }

  return datos;
}

// helpers para no repetir el objeto de opciones
export const get = (ruta) => api(ruta);
export const post = (ruta, body) =>
  api(ruta, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) });
export const put = (ruta, body) => api(ruta, { method: 'PUT', body: JSON.stringify(body) });
export const patch = (ruta, body) => api(ruta, { method: 'PATCH', body: JSON.stringify(body) });
export const del = (ruta) => api(ruta, { method: 'DELETE' });

// arma una query string salteando los valores vacíos
export function query(params) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') usp.set(k, v);
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}

// las imágenes ya vienen con URL completa (Supabase Storage); se deja por si queda alguna fila vieja con ruta relativa
export function urlImagen(url) {
  if (!url) return null;
  // las imágenes de relleno (placehold.co) cuentan como "sin imagen" y se dibuja la tapa genérica
  if (url.includes('placehold.co')) return null;
  // las rutas a /uploads son de cuando las fotos estaban en el disco del server
  if (url.startsWith('/uploads')) return null;
  return url;
}
