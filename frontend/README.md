# B-Side Club — Frontend

React + Vite + React Router. Consume la API que está en `../src`.

El diseño es una evolución de `demo/demo.html` con una idea central: **el
sitio es un vinilo** (el hero es el label de un disco, el catálogo son fundas
con el disco adentro, Nosotros es el Lado B). Las reglas del sistema están en
[`../DESIGN.md`](../DESIGN.md); los valores, en `src/estilos/tokens.css`.

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
  estilos/      tokens.css (colores, tipografia, espaciado, motion) +
                global.css (botones, badges, campos, tablas: lo compartido)
  lib/          api.js (único punto de contacto con el backend), auth.jsx,
                formato.js, horario.js, contacto.js, useConteos.js
  componentes/  piezas compartidas (Header, Footer, CardProducto, ArteProducto,
                Paginacion, Segmentos, Modal, Confirmar…) y home/HeroLabel
  layouts/      LayoutPublico, LayoutAuth, LayoutPanel
  paginas/      Home, Catalogo, DetalleProducto, Nosotros, Contacto
    auth/       Login, Registro, Recuperar, Resetear, AceptarInvitacion
    panel/      Dashboard, Productos, FormProducto, Categorias, Consultas,
                Promociones, InfoLocal, Invitaciones, Usuarios, Perfil
```

**Estilos:** cada componente o página tiene su `Nombre.module.css` al lado
(CSS Modules, viene con Vite). En JSX no van `style={{}}` nuevos: los que
quedan en algunas pantallas del panel son de antes del rediseño. Fuentes
autohospedadas con `@fontsource` (Bungee, Archivo y Martian Mono, variables);
íconos de `@phosphor-icons/react`; `motion` solo para la pestaña que se desliza
en filtros.

### Tres cosas que conviene saber antes de tocar el código

**Todo pedido pasa por `src/lib/api.js`.** Ahí se arman la API key y el token
en un solo lugar. No llames a `fetch()` suelto desde un componente: te vas a
olvidar de un header y vas a comer un 401 sin entender por qué.

**El precio es `Decimal` en Prisma, así que llega como *string*.** `"145000"`,
no `145000`. Pasalo por `formatearPrecio()` o por `Number()` antes de hacer
cuentas. `precio: null` significa "a consultar", no "gratis".

**Las búsquedas van con debounce de 350 ms.** El backend tiene un techo de 300
pedidos cada 15 minutos; sin debounce, escribir "pink floyd" se come 11 de una.

**El nombre del producto se carga como "Título — Artista".** El backend tiene
un solo campo; `separarNombre()` (lib/formato.js) lo parte en dos líneas y el
formulario del panel lo carga en dos campos.

**El horario del local es un arreglo `[{ label, value }]`.** Siempre leelo con
`normalizarHorario()` (lib/horario.js), que también entiende la forma vieja.

## Las imágenes

Si un producto tiene fotos cargadas, se muestran. Si no, `ArteProducto` dibuja
una tapa genérica según el formato: funda de papel con troquel para vinilos y
CDs, estuche con etiqueta para cassettes, ficha impresa para equipos, con un
color estable derivado del nombre. `urlImagen()` trata como "sin foto" las URLs
de relleno del seed viejo (`placehold.co`) y las rutas `/uploads` de antes de
pasar a Supabase.

## Build

```bash
npm run build     # -> dist/
npm run preview   # sirve dist/ para probarlo
```

Al publicar hay que agregar el dominio real a `CORS_ORIGINS` en el backend.
