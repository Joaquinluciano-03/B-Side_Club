---
version: 1
slug: "frontend-src-paginas-home-jsx"
primary_target: "frontend/src/paginas/Home.jsx"
related_targets: []
---

## Surface

Home pública (`frontend/src/paginas/Home.jsx`). Modo: Persuade. Visitante que llega desde Instagram o WhatsApp, muchas veces desde el celular, buscando un disco o el local. Acción principal: buscar en el catálogo o entrar a un formato; secundaria: escribir por WhatsApp o ver horario y dirección.

## Direction contract

THESIS: La Home es el label central de un vinilo gigante y su tracklist es la navegación. Rechaza el hero centrado con logo y las grillas de cards iguales que trae la categoría.

OWN-WORLD: Surco de vinilo carbón (#100F0E) como suelo, label naranja quemado (#F26A1B) impreso en tinta casi negra (#141210), Bungee para el título del label, Archivo variable (ancho y peso) para la tracklist, mono para la meta de catálogo (CAT. Nº, RPM, cantidades). Neón rosa/cian solo en el logotipo del header. El Lado A es claro (gris humo con trama) y el Lado B es carbón.

STORY: En un viewport el visitante entiende que es una disquería de Chacarita, que hay un catálogo vivo (22 títulos, por formato) y que puede buscar ya. Cree que cada disco fue escuchado. Hace: busca, toca un tema de la tracklist o escribe por WhatsApp.

FIRST VIEWPORT: Desktop 1440x900: surco ocupando todo el fondo, label de ~760px centrado; dentro, arriba la línea de catálogo en mono (Disquería · barrio · 33⅓ RPM), el nombre de la tienda como cartel de neón sobre placa oscura (componente Neon) y justo debajo el buscador real (va a /catalogo?q=); agujero central; abajo la tracklist A1 Recién llegados (cantidad real), A2-A4 formatos reales de /categorias con su cantidad, B1 El local (horario de hoy), B2 Escribinos. Fuera del label no hay textos ni CTA: el disco ocupa toda la pantalla. Mobile 390: el label se recorta como un círculo que desborda los lados; cartel y buscador quedan dentro, la tracklist sigue debajo como contratapa con filas de 52px de alto.

SIGNATURE: "Bajar la púa": al pasar el mouse o el foco por un tema de la tracklist, un brazo/púa se desliza hasta esa fila (transform, 220ms, ease-out fuerte) y el surco gana un brillo que gira con el scroll (animation-timeline: scroll(), fallback giro lento). Las animaciones no se reducen con prefers-reduced-motion (decisión del proyecto). El label nunca rota: el texto siempre se lee.

FORM: El label del disco (estructura 5 de 7 de mi lista ordenada, repartida por el sorteo). seed:d3fb11c557f82c50

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Below the fold (mismo mundo)

A1 Recién llegados (tapas como fundas con el disco que asoma), A2 Por formato, B1 El local en Lado B carbón (horario normalizado, dirección, mapa link), B2 cierre con WhatsApp. Un marquee como máximo. Sin eyebrows numerados.

## Unresolved

Tipografía mono (Space Mono vs alternativa) se decide antes de construir.
