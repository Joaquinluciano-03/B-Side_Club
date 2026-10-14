# B-Side Club — Frontend

React + Vite + React Router. Consume la API que está en `../src`.

El diseño sale de `demo/demo.html`: los colores, tipografías y componentes
están copiados de ahí, no elegidos de nuevo. Si hay que cambiar algo visual,
el lugar es `src/estilos/tokens.css`.

## Levantarlo

```bash
npm install
cp .env.example .env    # y completá VITE_API_KEY
npm run dev             # http://localhost:5173
```

Hacen falta **dos** cosas del backend:

1. Que esté corriendo (`npm run dev` en la raíz del repo).
2. Que `VITE_API_KEY` sea **exactamente** la misma que `API_KEY` en el `.env`
   del backend. Si no coinciden, todos los pedidos vuelven 401.

No hace falta configurar la URL de la API ni pelearse con CORS: el frontend
pide a `/api`, y en desarrollo el proxy de `vite.config.js` reenvía eso al
Express de al lado. En producción lo resuelve el redirect de `netlify.toml`.

## Cómo se publica

Todo va en **un solo deploy de Netlify**: el frontend compilado como sitio
estático, y el backend como una función en `/api/*`
(`netlify/functions/api.js` envuelve el mismo Express con `serverless-http`).

Por eso las imágenes de los productos van a Supabase Storage y no a una
carpeta del servidor: una función no tiene disco propio.

## Cómo está organizado

```
src/
  estilos/      tokens.css (el sistema de diseño) + global.css (componentes)
  lib/          api.js (único punto de contacto con el backend), auth.jsx, formato.js
  componentes/  piezas compartidas (Header, CardProducto, ArteProducto, Estados…)
  layouts/      LayoutPublico, LayoutAuth, LayoutPanel
  paginas/      Home, Catalogo, DetalleProducto, Nosotros, Contacto
    auth/       Login, Registro, Recuperar, Resetear, AceptarInvitacion
    panel/      Dashboard, Productos, FormProducto, Categorias, Consultas,
                InfoLocal, Invitaciones, Usuarios, Perfil
```

### Tres cosas que conviene saber antes de tocar el código

**Todo pedido pasa por `src/lib/api.js`.** Ahí se arman la API key y el token
en un solo lugar. No llames a `fetch()` suelto desde un componente: te vas a
olvidar de un header y vas a comer un 401 sin entender por qué.

**El precio es `Decimal` en Prisma, así que llega como *string*.** `"145000"`,
no `145000`. Pasalo por `formatearPrecio()` o por `Number()` antes de hacer
cuentas. `precio: null` significa "a consultar", no "gratis".

**Las búsquedas van con debounce de 350 ms.** El backend tiene un techo de 300
pedidos cada 15 minutos; sin debounce, escribir "pink floyd" se come 11 de una.

## Las imágenes

Si un producto tiene fotos cargadas, se muestran. Si no, `ArteProducto` dibuja
el motivo que le toca a su categoría (disco de vinilo, cassette, cinta
diagonal, halftone) con un color estable derivado del nombre. Son los mismos
motivos que define la demo, y evitan que el catálogo tenga huecos grises
mientras el local todavía no sacó las fotos.

## Build

```bash
npm run build     # -> dist/
npm run preview   # sirve dist/ para probarlo
```

Al publicar hay que agregar el dominio real a `CORS_ORIGINS` en el backend.
