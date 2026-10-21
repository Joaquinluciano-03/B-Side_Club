# Plan de rediseño del frontend · B-Side Club

Fecha: 2026-10-20 · Alcance: sitio público + panel admin, por fases · Fidelidad: evolución **audaz** de `demo/demo.html`

Contexto del producto (usuarios, propósito, restricciones): [`PRODUCT.md`](../PRODUCT.md).
Capturas usadas para este análisis: `.playwright-mcp/demo-*.png` (demo) y `.playwright-mcp/fe-*.png` (frontend actual).

---

## 1. Evaluación de la demo

La demo es un prototipo en React 18 empaquetado en un solo HTML. Tiene siete pantallas: Sistema de diseño ("Lado A: el sistema"), Home, Catálogo ("El cajón"), Detalle, Nosotros ("Lado B: la historia"), Contacto ("Escribinos"), Login y Panel (Mostrador, Productos, Consultas, Categorías, Info del local, Invitaciones y Perfil).

### Lo que funciona y hay que conservar

| Rasgo | Por qué vale |
|---|---|
| **Metáfora Lado A / Lado B** | Es propia del rubro, ordena el contenido (sistema/historia, destacados) y ningún competidor la copia tal cual. |
| **Paleta**: grises fríos (humo `#D5DADD`, superficie `#E9EDEE`), carbón `#100F0E`, naranja quemado `#F26A1B` como voz principal, y neón rosa `#FF4FA3` / cian `#35D0E8` sacado del logo | Sale del logo y no es la paleta genérica crema + terracota. El neón se reserva para pocos momentos. |
| **Tipografía**: Bungee como display, Archivo para el cuerpo y Space Mono para la meta | Bungee tiene mucho carácter (rótulo, marquesina) y le da identidad. |
| **Disco girando con el logo y texto curvo** en el hero | Es el único momento que alguien recordaría después de ver la página. |
| **Motivos**: surco, cassette, cinta diagonal, halftone | Las texturas pertenecen al mundo de la disquería y no son decoración genérica. |
| **Voz**: "Escuchado, no listado", "Un disco no se compra, se encuentra", el voseo | Es la marca. Se conserva tal cual. |
| **Badges de stock** con los cinco estados del enum `Stock` | Están bien resueltos y conectados al dominio. |

### Lo que es débil y hay que superar

1. **Composición de plantilla.** Hero centrado, grilla de cuatro cards iguales, cuatro tiles de categoría iguales, tres pilares numerados `01 02 03` y footer de cuatro columnas. Cada sección usa la misma familia de layout, la página no tiene ritmo y "audaz" hoy solo vive en el hero.
2. **El hero es un logo, no una tesis.** No dice qué es el local ni qué se puede hacer. Si alguien entra desde Instagram, no entiende en un viewport que es una disquería con catálogo.
3. **Abuso de etiquetas mono** (`01 — SISTEMA DE DISEÑO`, `02 — CATÁLOGO`, `LADO A — RECIÉN LLEGADOS`, `POR FORMATO`). Las hay encima de cada bloque, con numeración de sección y rayas largas: es el patrón más reconocible de UI generada por IA.
4. **El catálogo no aprovecha su metáfora.** Se llama "El cajón", pero visualmente es una grilla de e-commerce. Ninguna interacción evoca pasar discos en una batea.
5. **La ficha no prueba la promesa.** "Estado real, sin vueltas" es el diferencial, pero la condición aparece como un texto más en una tabla de filas con línea.
6. **Motion plano.** Hay un spin infinito, un marquee y un `translateY(-4px)` en hover. No hay entradas, ni feedback al presionar, ni transiciones entre rutas.
7. **Panel.** Correcto y legible, pero la tabla de productos no tiene versión mobile y los toggles naranjas están junto a "Eliminar" sin jerarquía.

---

## 2. Objetivos estéticos del proyecto

Juntando el enunciado del TPO, `docs/backend-estado.txt`, `frontend/README.md`, el copy de la demo y tus respuestas:

1. **Disquería de barrio con carácter.** Debe sentirse un local de Chacarita con historia, no una tienda online genérica: cálida en la voz y precisa en los datos.
2. **El ejemplar es el protagonista.** Hay fotos reales de cada pieza, así que el sistema tiene que lucir la fotografía y no taparla. El arte generado (`ArteProducto`) queda solo como respaldo.
3. **Neón medido.** "El neón aparece de a poco, nunca de fondo" es una regla explícita de la demo y se mantiene.
4. **Todo termina en una consulta.** WhatsApp, Instagram o el formulario tienen que estar a un toque desde cualquier ficha.
5. **Mobile primero en lo público** (el visitante llega desde Instagram) y **herramienta seria en el panel**.
6. **Presentable como TPO y usable en un local real.** Sin datos inventados que parezcan reales, sin `placehold.co` y con estados vacíos y de error cuidados.

---

## 3. Estado del frontend actual (`frontend/`)

Es un React 19 + Vite + React Router 7 bien organizado (lib, layouts, páginas, componentes) que copia la demo. Funciona contra la API. Problemas encontrados con Playwright y leyendo el código:

### Bugs visibles

| # | Problema | Dónde | Causa |
|---|---|---|---|
| B1 | **"0: [object Object]"** en el horario del footer, Nosotros y Contacto | `componentes/Footer.jsx:52-54`, `paginas/Nosotros.jsx`, `paginas/Contacto.jsx` | `horario` llega como arreglo `[{label, value}]` y se recorre con `Object.entries`. |
| B2 | **Header roto en mobile**: el nav se desborda ("CONT" cortado) y "Ingresar" queda en otra línea | `componentes/Header.jsx` | Un nav tipo píldora con `flexWrap` y sin versión mobile. |
| B3 | **Overflow horizontal en el catálogo mobile**: el contador "22 títulos" se sale de pantalla | `paginas/Catalogo.jsx` | La fila de búsqueda no se apila. |
| B4 | **Portadas en negro en mobile** hasta hacer scroll (lazy load sin placeholder) | `componentes/CardProducto.jsx` | No reserva color ni muestra skeleton mientras carga. |
| B5 | **Imágenes del seed de `placehold.co`**: bloques de color con texto en Lato | `prisma/seed.js` | Datos de prueba. Además nunca se ve el motivo de `ArteProducto`. |
| B6 | Las tarjetas "Por formato" muestran todas el mismo disco naranja | `paginas/Home.jsx:322-329` | El fondo está fijo y no usa el motivo de cada categoría. |

### Deuda técnica que bloquea el rediseño

- **Más de 300 `style={{}}` inline** (Home 32, FormProducto 21, LayoutPanel 21, DetalleProducto 19 y siguen). No permiten `:hover`, `:active`, media queries ni estados. Por eso hoy casi no hay responsive (un solo `@media` en todo JSX) y el motion se limita a hover.
- Colores hardcodeados repetidos en JSX (`#FF4FA3` y `#35D0E8` 7 veces, `#6B625D` y otros).
- Las fuentes se cargan desde Google Fonts con `<link>` y bloquean el render. Conviene autohospedarlas.
- No hay set de íconos: se usan caracteres (`○`, `→`, `●`).
- No hay transiciones entre rutas, feedback `:active` ni entradas escalonadas.
- 9 rayas largas (`—`) en copy visible de JSX, más las del seed (`"Vida — Vox Dei"`).
- **Modelo de datos limitado para una disquería.** `Producto` no tiene `artista` ni `formato`/`sello`, así que el nombre mezcla álbum y artista ("Vida — Vox Dei"). La ficha de la demo los muestra por separado. Ver la fase 0.

---

## 3.b Lo que el backend exige (checklist para cada etapa)

Salió de leer `src/` completo. Cada pantalla rediseñada tiene que seguir cumpliendo esto:

**Generales**
- Todo pedido pasa por `lib/api.js` (header `x-api-key` + `Bearer`). Los errores llegan como `{ error }` y se muestran tal cual: ya vienen en español y pensados para el usuario.
- **429**: hay cuatro límites (general 300/15 min, login 10 fallidos/15 min, cuenta 10/h, formulario 5/h). Cada formulario muestra el mensaje del 429 y no reintenta solo. Las búsquedas mantienen el debounce de 350 ms.
- **401** con token vencido: el cierre de sesión ya está centralizado en `api.js` y se conserva.
- `precio` llega como string y `null` = "A consultar". `anio` es obligatorio y no puede ser 0.
- **Con sesión iniciada, el catálogo público también muestra productos inactivos** (`authOpcional`). Hoy aparecen atenuados; el rediseño los marca como "Oculto al público" para que el staff no se confunda.

**Público**
- Catálogo: `page`, `pageSize` (máx. 60), `q` (busca en nombre y descripción), `categoriaId`, `destacado`. No hay orden ni filtro por estado: no se diseñan controles que el backend no soporta.
- Detalle: `GET /productos/:id` responde 404 si el producto está inactivo; hace falta una pantalla de "no encontrado".
- Consulta: `nombre`, `email` (validado), `asunto` y `mensaje` obligatorios; `telefono` y `productoId` opcionales. Límite de 5 por hora.
- `store-info` puede devolver 404 si nunca se configuró: el sitio tiene que verse bien sin esos datos.
- Promociones: la API filtra solo `activa`; la vigencia por fechas la aplica `lib/promociones.js`.

**Auth**
- Registro: solo funciona la primera vez (crea al super_admin); después responde 409 con un mensaje que lo explica. Contraseña de 6 caracteres o más. Teléfono obligatorio.
- Links que arma el backend: `/resetear-password?token=` y `/aceptar-invitacion?token=`. **Esas rutas no se pueden renombrar.**
- Reset: 400 token inválido, 409 ya usado, 410 vencido (30 min). Invitación: 404, 409 no disponible, 410 vencida (7 días).

**Panel**
- Roles: `vendedor` no ve Invitaciones ni Usuarios. Nadie toca al `super_admin`. Solo el `super_admin` elimina administradores.
- Imágenes de producto: hasta 5 por tanda, 5 MB cada una, solo `image/*`, campo `imagenes`. El orden se cambia de a una imagen (`PATCH /imagenes/:id`) y la de `orden` menor es la portada.
- Categorías: no se puede borrar una con productos (409).
- Consultas: estados `pendiente / leída / respondida`. El canal siempre es `formulario` (no se cargan consultas de WhatsApp a mano).
- Invitaciones: una sola pendiente por mail (409). Si el mail no sale, 502 y la invitación se borra.
- Dashboard: `consultasPendientes`, `productosActivos`, `productosInactivos`, `productosSinStock`, `invitacionesPendientes`, `totalUsuarios`. **No hay visitas**: no se inventan métricas.

**Cambios hechos al backend en la etapa 1**
- `POST /invitacion` y `PUT /usuarios/:id` validan el rol (antes se podía invitar a alguien como super_admin, y un rol inventado daba 500).
- Nuevo `POST /promociones/:id/imagen` (campo `imagen`, 5 MB): sube a Supabase y reemplaza la anterior. Al borrar una promo se borra su imagen.

## 4. Dirección del rediseño

**Lectura del encargo:** sitio de comercio local de discos usados para visitantes que llegan desde el celular, en lenguaje de rótulo de disquería y cultura de batea, construido sobre CSS propio con tokens + Motion, más un panel sobrio de herramienta.

**Diales** (según taste-skill): sitio público `DESIGN_VARIANCE 8 · MOTION 6 · DENSITY 4`; panel `3 · 2 · 6`.

**Modos** (según impeccable): Home = *Persuade*, Catálogo/Detalle = *Experience → Operate*, Nosotros/Contacto = *Read*, Panel = *Operate*.

### Qué se queda (identidad)

Logo, paleta (tokens actuales), Bungee y Archivo, neón solo en el logo y en un momento por página, trama halftone, disco, Lado A / Lado B, voz y badges de stock.

### Qué cambia (lo audaz)

1. **El hero pasa a ser una tesis.** Composición asimétrica: un disco grande que sale del borde derecho del viewport y gira con el scroll (CSS `animation-timeline: scroll()`). A la izquierda va el titular en Bungee ("Un disco no se compra, se encuentra"), una línea de subtexto y dos CTA. Abajo asoman los *recién llegados* como discos parados en una batea. Un solo viewport tiene que comunicar disquería, catálogo y "vení a consultar".
2. **Interacción propia del producto: "sacar el disco del sobre".** En el catálogo, cada card es una funda. Al hacer hover o foco, el vinilo se desliza fuera del sobre (`transform` + `clip-path`, 200-250 ms, ease-out fuerte) y aparece la foto real del ejemplar. En touch se muestra quieto. Es el recuerdo que se lleva el visitante y no existe en ninguna tienda genérica.
3. **El catálogo como batea.** Los filtros son *separadores de batea* (pestañas tipo índice A-Z / formato), no píldoras genéricas. En mobile, el carrusel de "recién llegados" usa scroll-snap horizontal.
4. **La ficha como "hoja de inspección".** Condición visible como escala (M / NM / VG+ / VG / G), con el estado del ejemplar destacado y la nota "lo escuchamos entero". Las fotos van en una galería con miniaturas y la acción de consultar queda fija (sticky) en mobile, con WhatsApp directo y mensaje prellenado.
5. **Lado A → Lado B como transición real.** Al navegar a Nosotros, el disco "se da vuelta" (View Transitions API con el soporte de React Router 7 y un fallback simple). Es el único cambio de tema deliberado de la página: el Lado A es claro y el Lado B, oscuro.
6. **Menos ruido.** Etiquetas mono como máximo una cada tres secciones, sin numeración de sección y sin rayas largas en el copy. Cada sección de la Home usa una familia de layout distinta (hero asimétrico, batea horizontal, bloque editorial a toda página, mapa/horarios y cierre).
7. **Motion con criterio** (según Emil Kowalski): `:active` con `scale(0.97)` en todo lo presionable, curvas `--ease-out: cubic-bezier(0.23,1,0.32,1)`, duraciones de UI de 300 ms o menos, entradas escalonadas de 40-60 ms, hover solo con `@media (hover:hover)`, nada animado en acciones de teclado y todo cubierto por `prefers-reduced-motion`.

### Decisiones abiertas (se cierran en la fase 1, con prototipos)

- **Space Mono.** impeccable la marca como fuente "por defecto de IA". Opciones: reducir mucho su uso o reemplazarla por una mono con más oficio. La pruebo en prototipos y decidís vos.
- **Modo oscuro.** Taste lo pide en sitios de consumo, pero la marca ya alterna claro y oscuro de forma intencional. Mi recomendación es no agregar un toggle y respetar el Lado A / Lado B.
- **Grado de audacia del hero.** Lo resuelvo con tres variantes en vivo usando la skill `prototype` de Emil y elegís una.

---

## 5. Decisiones técnicas

| Tema | Decisión | Motivo |
|---|---|---|
| Estilos | **CSS Modules** (`Componente.module.css`) + `tokens.css` global. Sin Tailwind. | Vite los trae sin dependencias, permite hover, active y media queries, respeta el CSS + tokens actual y se puede avanzar paso a paso. |
| Motion | CSS transitions y `@starting-style` primero; **`motion`** (`motion/react`) solo para el reordenamiento animado de la grilla al filtrar y para el carrusel. | Las animaciones CSS no bloquean el hilo principal; Motion queda solo donde hace falta interrumpir o animar layout. |
| Transiciones de ruta | View Transitions API vía `<Link viewTransition>` de React Router 7. | Es nativo y degrada solo en navegadores sin soporte. |
| Íconos | `@phosphor-icons/react`, un solo grosor. | Reemplaza `○ → ●` y queda una sola familia. |
| Fuentes | `@fontsource/bungee`, `@fontsource-variable/archivo` (+ la mono que se elija), autohospedadas. | Mejor LCP, sin `<link>` bloqueante. |
| Imágenes | `aspect-ratio` reservado, color de fondo derivado del producto, `loading="lazy"` + `decoding="async"`, y la primera imagen del hero con `fetchpriority="high"`. | Arregla B4 y el CLS. |
| JS | JavaScript plano, sin TypeScript, siguiendo las convenciones del repo. | Preferencia del proyecto. |

---

## 6. Plan por fases

Cada fase termina con **verificación en Playwright** (capturas a 1440 px y 390 px, más los estados de hover, foco, error y vacío) y un commit propio. Las skills que se usan van entre corchetes.

### Fase 0 · Bugs y bases (sin cambiar el diseño todavía)

1. **B1 horario.** Crear `lib/horario.js` con `normalizarHorario()`, que acepte arreglo u objeto, y usarla en Footer, Nosotros y Contacto.
2. **B5 seed.** Quitar `placehold.co`: productos sin imagen (que use el arte generado) o fotos reales cuando las haya. Sacar las rayas largas de los nombres.
3. **B6.** Que las tarjetas de formato usen el motivo de `ArteProducto` de cada categoría.
4. ~~Agregar `artista` y `formato` a `Producto`~~. **Decidido: no.** El nombre se separa por la raya con `separarNombre()` en `lib/formato.js`.
5. Instalar las dependencias (fuentes, Phosphor y `motion`) y sacar el `<link>` de Google Fonts de `index.html`. Agregar meta OG/Twitter.
6. Ampliar `tokens.css`: escala de espaciado, escala tipográfica fluida (`clamp`), curvas de easing (`--ease-out`, `--ease-in-out`, `--ease-drawer`), duraciones, z-index y radios unificados (control 8, card 14, píldora 999, documentados).

**Criterio de cierre:** cero "[object Object]", cero `placehold.co` y build sin warnings.

### Fase 1 · Dirección y sistema [impeccable new-work · taste · emil `prototype` · Figma]

1. Ronda de dirección de impeccable (`concept-seed`) para la Home con la dirección de la sección 4 como base, para que la ejecución no caiga en lo genérico.
2. **Tres prototipos en vivo del hero** (skill `prototype`) y elegís uno. Lo mismo para la card "funda / disco".
3. Decidir Space Mono o reemplazo, y el criterio de etiquetas.
4. Escribir el *direction contract* en el brief de superficie de impeccable.
5. **Figma (opcional; el plan Starter tiene pocas llamadas):** subir el hero y la card elegidos como referencia (`generate_figma_design`).

**Criterio de cierre:** dirección elegida por vos, tokens finales y contrato escrito.

### Fase 2 · Componentes base (migración de inline a CSS Modules) [emil-design-eng · impeccable craft-floor]

Orden de migración, del más compartido al menos:

1. `Header`: versión desktop en una línea de 72 px o menos, y versión mobile con botón de menú y panel que entra desde arriba (`--ease-drawer`, 250 ms) con foco atrapado. Arregla B2.
2. `Footer`: rehecho con el horario corregido, mapa/dirección clicable y redes con íconos.
3. Botones (primario, secundario, enlace, peligro, chico) con `:active` y foco visible; badges; campos (label arriba, error abajo, contraste AA); `Modal`, `Confirmar` y toast con entrada `@starting-style` y salida más rápida que la entrada.
4. `ArteProducto`: los cuatro motivos (vinilo, cassette, CD, equipo) pulidos como respaldo de verdad.
5. `CardProducto` como **funda + disco** con la interacción "sacar del sobre" (sección 4.2), skeleton con la misma forma y color reservado. Arregla B4.
6. `Estados` (vacío, error y carga) con voz de marca.

**Criterio de cierre:** ningún `style={{}}` en componentes compartidos y capturas de cada componente en todos sus estados.

### Fase 3 · Sitio público [taste · impeccable · emil `animate` · mobile-native]

1. **Home:** hero asimétrico con disco + scroll; batea de recién llegados (scroll-snap); formatos con motivos propios; bloque editorial "Escuchado, no listado" a toda página (reemplaza los tres pilares iguales); local + horarios; cierre con CTA a WhatsApp. Un marquee como máximo.
2. **Catálogo:** separadores de batea como filtros, búsqueda con ícono y contador que no desborde (B3), grilla con reordenamiento animado al filtrar (`motion` layout), paginación con estados claros y filtros sincronizados con la URL (ya existe, se conserva).
3. **Detalle:** galería (foto principal + miniaturas, swipe en mobile), escala de condición, separación álbum/artista, CTA fijo en mobile ("Consultar por WhatsApp" con texto prellenado) y "Más de este cajón".
4. **Nosotros:** Lado B oscuro con la transición del disco que se da vuelta, historia en formato editorial y horarios y dirección reales del store-info.
5. **Contacto:** formulario con validación en línea, y el asunto prellenado si se llega desde una ficha (`?producto=`), además de los canales rápidos.
6. **Auth** (Login, Registro, Recuperar, Resetear, AceptarInvitacion): una sola tarjeta coherente con el sistema, sin el ruido de la demo.
7. Pasada de [`mobile-native`]: `100dvh`, `safe-area`, inputs de 16 px o más (que no hagan zoom), `-webkit-tap-highlight-color` y `touch-action`.

**Criterio de cierre:** cada página en 1440 y 390 sin overflow, la Home cumple la prueba de un viewport y el checklist pre-vuelo de taste en verde.

### Fase 4 · Panel admin (modo Operate) [impeccable `layout` · `harden` · `clarify`]

1. `LayoutPanel` migrado a CSS Modules: sidebar en desktop y barra inferior o menú en mobile, con contador de consultas pendientes.
2. **Dashboard:** métricas reales de `/api/dashboard`, sin "visitas" inventadas, y accesos rápidos ("Cargar producto", "Responder consultas").
3. **Productos:** tabla con columnas fijas en desktop y lista de tarjetas en mobile, stock editable en la fila con feedback, acciones destructivas separadas y con confirmación, y búsqueda con debounce (ya existe).
4. **FormProducto:** subir fotos arrastrando, con vista previa, reordenamiento (el campo `orden`) y progreso; validación en línea; vista previa de cómo queda la card pública.
5. Consultas, Categorías, Promociones, Info del local, Invitaciones, Usuarios y Perfil: mismo sistema, estados vacíos útiles y textos claros.

**Criterio de cierre:** cargar un producto con tres fotos en menos de un minuto sin errores, y el panel usable a 390 px.

### Fase 5 · Motion, estrés y cierre [emil `review-animations` · `break-ui` · impeccable `audit` · `polish`]

1. `find-animation-opportunities` + `review-animations` sobre todo el sitio, y aplicar el resultado.
2. `break-ui`: nombres larguísimos, sin fotos, precio `null`, 0 resultados, 60 productos, emoji y caracteres no latinos.
3. `impeccable audit`: accesibilidad AA, foco, contraste, `prefers-reduced-motion`, rendimiento (LCP < 2,5 s, CLS < 0,1) y detector `impeccable detect`.
4. `impeccable document` → **`DESIGN.md`** con el sistema final, para que el resto del equipo lo siga.
5. Actualizar `frontend/README.md`.

---

## 7. Orden sugerido y dependencias

```
Fase 0 ──► Fase 1 ──► Fase 2 ──► Fase 3 ──► Fase 5
                         └──────► Fase 4 ──┘
```

- La fase 0 es independiente y se puede empezar ya.
- Lo opcional de la fase 0 (`artista` y `formato`) toca backend: conviene coordinarlo con quien lo esté manteniendo.
- Las fases 3 y 4 pueden ir en paralelo una vez que la fase 2 deja los componentes base.

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Que lo audaz complique entender el catálogo | La interacción de la funda nunca oculta precio ni estado; en touch, la card es estática. |
| Animaciones con scroll en navegadores sin soporte | `@supports (animation-timeline: scroll())` con el disco girando lento como fallback. |
| Límite de 300 pedidos cada 15 min | Mantener el debounce y no hacer prefetch agresivo de fichas. |
| Llamadas de Figma MCP limitadas (Starter) | Usar Figma solo en la fase 1 y para documentar; iterar en código con Playwright. |
| Regresiones al sacar estilos inline | Migrar componente por componente, con capturas antes y después en cada uno. |

---

## 9. Estado al cierre (2026-10-20)

Todas las etapas quedaron hechas en la rama `rediseno-frontend`, un commit por etapa:

| Etapa | Commit | Qué entró |
|---|---|---|
| 1. Bases y bugs | `0a97bf5` | Horario canónico, seed sin placehold, validación de roles, subida de imagen de promociones, fuentes autohospedadas, tokens |
| 2. Dirección | `0c57671` | "El label del disco": hero, header nuevo, Martian Mono |
| 3. Componentes | `962dfe1` | Card funda + disco, tapas genéricas, footer, diálogos, toasts, estados |
| 4. Público | `0ef5d50` | Home completa, catálogo con separadores, ficha de inspección |
| 5. Páginas | `d6bb7f8` | Nosotros (Lado B, View Transition), Contacto, pantallas de sesión, logo optimizado |
| 6. Panel | `3aff6d0` | Layout con cajón mobile, mostrador, productos, formulario con vista previa y fotos arrastrando, consultas |
| 7. Cierre | `13400de` + último | Contraste AA, prueba con datos extremos, limpieza, DESIGN.md, README |

**Quedó pendiente:**
- Capturar las pantallas en Figma (archivo creado: https://www.figma.com/design/ZYkiRPSRBD2lE72BDEA1TG). La captura local necesita un script remoto de Figma y el permiso para agregarlo fue denegado; falta decidir cómo hacerlo.
- 97 `style={{}}` en pantallas secundarias del panel (Promociones, Invitaciones, InfoLocal, Usuarios, Categorías, Perfil, ModalPlantillaEmail): funcionan y usan los tokens, pero no se pasaron a CSS Modules.
- Cargar `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en las variables de entorno de Netlify (en local ya están en el `.env`).

**Resuelto después:** las imágenes viejas de la base (placehold.co y `/uploads`) se borraron a mano. Las 17 fotos reales están en el bucket `productos` de Supabase Storage y la base apunta ahí; el seed genera las mismas URLs. La copia en `frontend/public/productos` queda de respaldo.
