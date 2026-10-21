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
- Una sola animación protagonista por superficie: la púa que baja al tema, el disco que sale de la funda, el disco que se da vuelta al entrar a Nosotros.

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
**The Neon Sign Rule.** El neón vive en dos carteles, los dos hechos con el mismo componente (`componentes/Neon.jsx`): el logotipo del header y el nombre en el label del hero (este último sobre una placa oscura atornillada). Tubos Bungee Outline rosa/cian que se encienden letra por letra y tienen un tubo flojo que titila cada tanto. Siempre sobre fondo oscuro; nunca de fondo, nunca en botones ni en texto corrido.

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
- **Segmentos** (panel): pastilla gris con la opción activa en tinta.
- **Precio con descuento** (`componentes/Precio.jsx`): el precio original tachado y apagado, el precio nuevo con el peso del precio normal y una etiqueta naranja con tinta en mono ("-15%" o "-$ 10.000"), como el precio marcado a mano en una batea. En la ficha se suma "Ahorrás $ X" en verde. Un producto "a consultar" no lleva descuento.

### Cards / Containers
- **Card de producto:** funda al 88% del ancho con el objeto del formato detrás asomando 6%; al hover o foco el objeto sale 7% más y la funda se inclina -1.2°. Texto suelto debajo: estado (solo si no es "disponible"), título, artista, meta, precio.
- **Tapa genérica:** funda de papel con trama, troquel redondo con el label, título condensado arriba y artista en mono abajo.

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
- **Do** dar una sola animación protagonista por pantalla. Las animaciones se ven siempre igual: el proyecto decidió no reducirlas con `prefers-reduced-motion` (Motion va con `reducedMotion="never"`).
- **Do** usar `data-oscuro` en las zonas carbón para que el foco pase a cian.
- **Do** mantener el texto en 4.5:1 como mínimo.

### Don't:
- **Don't** poner eyebrows o etiquetas numeradas ("01 — Catálogo") encima de los títulos.
- **Don't** usar el neón fuera del logotipo.
- **Don't** meter productos en cajas con borde; son objetos.
- **Don't** usar rayas largas como separador en el copy: se reservan para el dato "Título — Artista".
- **Don't** mostrar métricas que el backend no tiene (por ejemplo, visitas).
