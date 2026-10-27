---
name: B-Side Club
description: Disquería de barrio en Chacarita. El sitio es un vinilo: el label naranja manda, el surco carbón es el suelo.
colors:
  naranja-label: "#f26a1b"
  naranja-hover: "#ff7d2f"
  carbon-surco: "#100f0e"
  tinta-sobre-naranja: "#141210"
  humo: "#d5dadd"
  superficie: "#e9edee"
  gris-medio: "#c9d0d3"
  borde: "#bac2c6"
  tinta: "#191c1d"
  tinta-dim: "#4e5558"
  tinta-tenue: "#555d60"
  crema: "#f2ece4"
  crema-dim: "#a79e97"
  teal-enlace: "#0a6677"
  neon-rosa: "#ff4fa3"
  neon-cian: "#35d0e8"
  error: "#a83628"
  ok: "#1b6b45"
typography:
  display:
    fontFamily: "Bungee, Impact, sans-serif"
    fontSize: "clamp(2.25rem, 1.4rem + 4vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Archivo Variable', Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label-condensado:
    fontFamily: "'Archivo Variable', Archivo, system-ui, sans-serif"
    fontSize: "10cqw"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.01em"
  meta:
    fontFamily: "'Martian Mono Variable', ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.06em"
rounded:
  badge: "5px"
  control: "8px"
  card: "14px"
  pildora: "999px"
spacing:
  e1: "4px"
  e2: "8px"
  e3: "12px"
  e4: "16px"
  e5: "24px"
  e6: "32px"
  e7: "48px"
  e8: "64px"
  e9: "96px"
components:
  button-primary:
    backgroundColor: "{colors.naranja-label}"
    textColor: "{colors.tinta-sobre-naranja}"
    rounded: "{rounded.control}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.naranja-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    rounded: "{rounded.control}"
    padding: "13px 23px"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.tinta}"
    rounded: "{rounded.control}"
    padding: "13px 14px"
  search-pill:
    backgroundColor: "#ffffff"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pildora}"
    height: "48px"
  tab-separador:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.tinta}"
    rounded: "10px 10px 0 0"
    padding: "12px 18px 11px"
  tab-separador-activo:
    backgroundColor: "{colors.naranja-label}"
    textColor: "{colors.tinta-sobre-naranja}"
---

# Design System: B-Side Club

## Overview

**Creative North Star: "El label del disco"**

El sitio está armado como un vinilo visto de cerca. La Home abre con el label naranja de un disco gigante sobre su surco: el nombre de la tienda (de la base, store-info) va impreso en el label y la tracklist del Lado A (recién llegados y formatos) y del Lado B (el local, escribinos) es la navegación. Esa idea se repite en todo el sitio: las cards del catálogo son fundas con el disco adentro que asoma, la ficha de producto es la hoja de inspección del ejemplar, Nosotros es el Lado B en carbón, y el login lleva un label de "solo staff".

El tono es el de una disquería de barrio con oficio: cálida en la voz (rioplatense, con voseo) y precisa en los datos (estado Goldmine, año, formato, precio). El neón rosa y cian del logo existe, pero aparece una sola vez por pantalla, en el logotipo del header; nunca es fondo. El panel interno usa el mismo mundo con mucha más sobriedad: es una herramienta.

**Key Characteristics:**
- Label naranja + surco carbón como figura y fondo del Lado A; carbón con trama clara en el Lado B.
- Tapas propias por formato cuando no hay foto: funda de papel con troquel (vinilo, CD), estuche de cassette, ficha de equipo.
- Navegación que se lee como tracklist o como separadores de batea, nunca como menú genérico.
- Una animación protagonista por sección, y cada una con un objeto distinto del mundo del sonido (el vinilo queda para el hero): "Por formato" es un cartel de neón rosa y cian (doble tubo, título y filas alternando), la cinta naranja tapa el borde entre formatos y el Lado B, el parlante del Lado B late y suelta ondas, el frente de radio del cierre busca la frecuencia (aguja, perilla de sintonía, señal y luz de estéreo sincronizadas), y Nosotros son tres partes con un movimiento cada una: el cassette sonando en la cabecera (la cinta avanza con el scroll), la carátula del cassette (tarjeta de papel crema con lomo y frente, del mismo papel que la etiqueta del cassette; el frente se despliega desde el lomo al verse y trae la historia como lista de temas B1, B2, B3) y la visita, que entra suave. Home y Nosotros entran al hacer scroll (`lib/useEnPantalla.js`: `data-entrada` / `data-visto`, utilidades globales `.entra` y `.revela`); catálogo, contacto y panel quedan sobrios.

## Colors

### Primary
- **Naranja label** (`#f26a1b`): el label del disco, el botón principal, la pestaña activa de los separadores, la banda de cierre. Texto encima siempre en tinta casi negra (`#141210`), nunca blanco.

### Neutral
- **Carbón surco** (`#100f0e`): el suelo del Lado B (header, footer, hero, Nosotros, lateral del panel).
- **Gris humo** (`#d5dadd`) con trama de puntos: el suelo del Lado A (catálogo, ficha, contacto, panel).
- **Superficie** (`#e9edee`): formularios, tablas y paneles sobre el humo.
- **Crema** (`#f2ece4`) y **crema dim** (`#a79e97`): texto sobre carbón.
- **Tinta** (`#191c1d`), **tinta dim** (`#4e5558`), **tinta tenue** (`#555d60`): texto sobre claro.

### Tertiary
- **Teal enlace** (`#0a6677`): links y anillo de foco sobre claro. Sobre carbón el foco usa **neón cian** (`#35d0e8`).
- **Neón rosa / cian**: solo el logotipo del header.

### Named Rules
**The Neon Sign Rule.** El neón vive en dos carteles, los dos hechos con el mismo componente (`componentes/Neon.jsx`): el logotipo del header y el nombre en el label del hero (este último sobre una placa oscura atornillada). Hay un tercer cartel, pedido a propósito: el panel de "Por formato" en la Home, con los dos colores del logo repartidos como en un cartel real. El borde son dos tubos paralelos (rosa de 4 px afuera, cian de 2 px adentro) que se encienden uno después del otro y titilan a destiempo; el título usa `Neon` alternando rosa y cian por palabra; las filas alternan color (impar rosa, par cian) y cada una lo usa en la cantidad, el aro del ícono y el hover (barrido, nombre que brilla, barrita de neón). Las divisorias van de rosa a cian y la pared refleja rosa arriba a la izquierda y cian abajo a la derecha. Todo se enciende recién cuando el panel llega a pantalla (solo opacidad, mismas curvas que el logo). Tubos Bungee Outline rosa/cian que se encienden letra por letra y tienen un tubo flojo que titila cada tanto. Siempre sobre fondo oscuro; nunca de fondo, nunca en botones ni en texto corrido.

**The Ink-on-Orange Rule.** Sobre naranja va tinta casi negra. El blanco sobre naranja no pasa contraste y además rompe la lectura de "label impreso".

**The AA Floor Rule.** Todo texto pasa 4.5:1 sobre su fondo. El teal y el gris tenue de la demo original (2.7:1 y 4.1:1) se oscurecieron por esto.

## Typography

**Display Font:** Bungee (con Impact de respaldo)
**Body Font:** Archivo Variable (pesos 100-900, ancho 62%-125%)
**Label/Mono Font:** Martian Mono Variable (ancho 75%-112%, se usa a 87.5%)

**Character:** Bungee es el rótulo de la disquería: títulos de página y de sección, siempre en mayúsculas. Archivo carga todo lo que se lee y, con su eje de ancho condensado al 62-72%, imprime los títulos de las tapas genéricas. Martian Mono es la meta de catálogo: año, formato, número de catálogo, cantidades, estados.

### Hierarchy
- **Cartel del hero** (Bungee Outline con trazo engrosado y halo de neón, tamaño según el largo del nombre): el nombre de la tienda en el label.
- **Título de página** (Bungee, `clamp(2.25rem, 1.4rem + 4vw, 4.5rem)`, line-height 0.95, mayúsculas).
- **Título de sección** (Bungee, `clamp(1.75rem, 1.3rem + 2vw, 2.75rem)`).
- **Cuerpo** (Archivo 400, 16-20px fluido, line-height 1.55-1.65, máximo 64ch).
- **Títulos de card** (Archivo 800, 16px, máximo 3 líneas).
- **Meta** (Martian Mono 87.5%, 11-12px, tracking 0.06-0.2em, mayúsculas): año, formato, estados.

### Named Rules
**The Display-Is-A-Sign Rule.** Bungee nunca en párrafos ni en botones. Es cartel, no texto.

**The Real-Mono Rule.** El mono solo lleva datos (años, cantidades, códigos, precios a consultar, horarios). No se usa como disfraz "técnico" en títulos.

## Layout

Ancho máximo 1240px, margen lateral fluido `clamp(16px, 4vw, 40px)`, aire entre secciones grandes `clamp(64px, 10vw, 128px)`. Escala de espaciado en múltiplos de 4 (`--e-1` a `--e-10`). Cada sección de la Home usa una familia de layout distinta: label (hero), grilla de fundas, filas-separador, bloque partido en carbón, banda naranja. La grilla de productos no tiene cajas: más aire entre filas (48px) que entre columnas (24px).

En mobile el label desborda los costados (118vw) y la tracklist sigue debajo como contratapa; los elegidos pasan a un carril horizontal con scroll-snap; la ficha suma una barra fija abajo con precio y consulta. El panel cambia el lateral por un cajón.

## Elevation & Depth

La profundidad viene de objetos, no de tarjetas: la funda sobre su disco, el disco sobre la mesa (sombra de 40px/120px bajo el vinilo del hero), los reflejos cónicos sobre el surco. En la interfaz plana se usan dos sombras teñidas de carbón (`--sombra-suave`, `--sombra-alta`), nunca negro puro sobre el humo.

### Named Rules
**The Object-Not-Card Rule.** Un producto se presenta como un objeto (funda + disco), no dentro de una caja con borde.

## Shapes

Controles 8px, cards y paneles 14px, pastillas (buscadores, filtros, CTAs de sección) totalmente redondeadas. Los separadores de batea son la única forma con esquinas superiores redondeadas y base recta: se apoyan sobre una línea de 2px de tinta, como las pestañas de un cajón.

## Components

### Buttons
- **Primario:** naranja label, texto tinta, mayúsculas Archivo 800, 8px de radio. Hover a `#ff7d2f`, `:active` escala 0.97.
- **Secundario:** borde gris, texto tinta; hover borde y texto teal.
- **Peligro:** solo para confirmar un borrado (rojo lleno); antes de eso, borde rojo suave.

### Chips
- **Separadores de batea** (catálogo): pestaña por formato con su cantidad en mono; la pestaña naranja activa viaja entre separadores (Motion `layoutId`).
- **Catálogo**: la cabecera acompaña a la pestaña elegida (ícono de la categoría en un círculo, "Catálogo" chiquito arriba, descripción y cantidad en su unidad); el total general se cuenta en "productos". Arriba de la grilla, una línea mono con "1–12 de N" y el selector "Ordenar" (más nuevos, menor y mayor precio con los "a consultar" al final, A–Z; va en `?orden=`). La barra de búsqueda lleva sombra solo mientras está pegada arriba. Las pestañas no se deslizan nunca (`overflow: clip`): si no entran, va el selector. Una categoría que ya no existe en la URL vuelve a "Todo".
- **Segmentos** (panel): pastilla gris con la opción activa en tinta.
- **Precio con descuento** (`componentes/Precio.jsx`): el precio original tachado y apagado, el precio nuevo con el peso del precio normal y una etiqueta naranja con tinta en mono ("-15%" o "-$ 10.000"), como el precio marcado a mano en una batea. En la ficha se suma "Ahorrás $ X" en verde. Un producto "a consultar" no lleva descuento.

### Cards / Containers
- **Card de producto:** funda al 88% del ancho con el objeto del formato detrás asomando 6%; al hover o foco el objeto sale 7% más y la funda se inclina -1.2°. El estado (solo si no es "disponible") va como sticker pegado en la esquina de la tapa, apenas girado, y viaja con la funda. Texto suelto debajo, con la misma estructura en todas: título (máximo 2 líneas), artista (1 línea), meta en mono y, a la derecha, el icono de la categoría alineado con el título y siempre del mismo tamaño. El precio va al pie: las cards de una fila miden lo mismo y los precios quedan alineados. El bloque de texto termina en el borde de la funda (88%), nunca bajo el disco que asoma.
- **Tapa genérica:** funda de papel con trama, troquel redondo con el label, título condensado arriba y artista en mono abajo.

### Iconos de categoría
`componentes/IconoCategoria.jsx`: 22 objetos de disquería (formatos, equipos, accesorios y merch) dibujados con la paleta de las tapas genéricas: cuerpos carbón, metal, crema del papel y un solo color de acento que llega por `color`. Vinilo, CD, cassette y perilla son CSS; el resto, SVG en un cuadro de 100. El local elige el icono al crear la categoría (grilla de radios en el panel, sugerido por el nombre mientras se escribe); sin elección, se deduce del nombre. El icono también decide la tapa genérica: disco, cinta o ficha impresa.

### Inputs / Fields
Label en Martian Mono arriba, campo blanco con borde gris, foco con borde naranja y halo naranja suave. Error en rojo debajo y el foco salta al primer campo con error. Buscadores en pastilla con lupa.

### Navigation
Header carbón: barra de 68px + cinta de categorías de 36px (`--alto-header`). La cinta corre con las categorías reales y su cantidad, separadas por puntos naranja/cian/rosa, se frena al pasar el mouse y cada categoría lleva al catálogo filtrado. Barra: con el logotipo neón y los links en una línea; el activo en naranja con subrayado que crece desde la izquierda. Mobile: botón de menú y panel que baja con curva de cajón.

### El label (signature)
El hero de la Home: label naranja dimensionado una vez (`--d`) y todo lo de adentro en unidades de contenedor (cqw). La púa (brazo con cabeza) baja hasta el tema con mouse o foco en 220ms con ease-out fuerte. El vinilo gira siempre (una vuelta cada 24 s) y suma vueltas con el scroll (`animation-composition: add` sobre `scroll(root)`). Lleva imperfecciones (polvo, rayones, una huella, zonas gastadas: `public/imperfecciones.svg`) que pasan por debajo de reflejos quietos: así se nota el giro. La sombra es una capa aparte para no girar. El label nunca rota.

## Do's and Don'ts

### Do:
- **Do** usar el formato "Título — Artista" en el nombre del producto: el sitio lo separa en dos líneas.
- **Do** mostrar la escala Goldmine cuando la condición trae el código entre paréntesis.
- **Do** dejar el scroll suave como está: en el sitio público la rueda del mouse se desliza con Lenis (`lib/scrollSuave.js`, `lerp` 0.2, deslizamiento corto, misma distancia por movimiento que el scroll normal). Solo con mouse o trackpad (en el celular el táctil queda nativo), nunca en el panel, y adentro de un `<dialog>` o de algo con `data-lenis-prevent` el scroll es el normal. Todo lo que mueve el scroll por código pasa por `irAlScroll`. El bucle de cuadros solo corre mientras hay scroll (despierta con la rueda), y mientras la página se desliza el `main` no reacciona al mouse (`html.lenis-scrolling main`), así los hovers no se redibujan en medio del scroll.
- **Do** subir fotos livianas: el panel las achica a 1600 px de lado mayor y las pasa a WebP antes de subirlas (`lib/comprimirImagen.js`); si no gana peso o algo falla, sube el original. GIF y AVIF van tal cual.
- **Do** usar el carril deslizable para "Destacados y ofertas" en tableta y celular (en tableta asoman unas 3 cards y la siguiente); la grilla de 4 queda para escritorio.
- **Do** animar en loop solo `transform`/`translate`/`rotate`/`scale` y `opacity` (van en la GPU), y nunca dos animaciones de la misma propiedad en el mismo elemento (separarlas en capas anidadas, como el neón del logo y los tubos del panel de formatos). Con el scroll suave, todo lo que corre en el hilo principal se nota como tirón.
- **Don't** pausar de golpe todas las animaciones de una sección grande al salir de pantalla (`* { animation-play-state: paused }`): rearma sus capas en un solo cuadro y traba el scroll justo en ese límite. Pasaba con el hero cuando Novedades cruzaba el header. Las animaciones en la GPU fuera de pantalla casi no cuestan; si hace falta pausar, que sea una sola capa ya preparada (`will-change`), como el disco del hero mientras se desliza el scroll suave.
- **Don't** poner filtros SVG (`feGaussianBlur` y similares) en texturas de capas que giran o se mueven: cada parte nueva que queda a la vista los recalcula. Lo difuso se hornea en una imagen chica (como `imperfecciones-suaves.webp` del disco del hero) y lo nítido queda en SVG sin filtros.
- **Do** dar una sola animación protagonista por sección, animando solo transform, opacity y clip-path, y pausar los loops fuera de pantalla (`useEnPantalla({ pausa: true })` pone `data-quieto`). Los efectos atados al scroll (`animation-timeline`) van dentro de `@supports`: sin soporte quedan quietos. Las animaciones se ven siempre igual: el proyecto decidió no reducirlas con `prefers-reduced-motion` (Motion va con `reducedMotion="never"`).
- **Do** usar `data-oscuro` en las zonas carbón para que el foco pase a cian.
- **Do** mantener el texto en 4.5:1 como mínimo.

### Don't:
- **Don't** poner eyebrows o etiquetas numeradas ("01 — Catálogo") encima de los títulos.
- **Don't** usar el neón fuera de los carteles (logo, hero y el panel de formatos).
- **Don't** meter productos en cajas con borde; son objetos.
- **Don't** usar rayas largas como separador en el copy: se reservan para el dato "Título — Artista".
- **Don't** mostrar métricas que el backend no tiene (por ejemplo, visitas).
