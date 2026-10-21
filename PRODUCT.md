# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Visitante / cliente de disquería:** alguien que busca vinilos, cassettes, CDs o equipos de audio usados en Buenos Aires. Llega desde Instagram, WhatsApp o búsqueda, mira el catálogo (muchas veces desde el celular), revisa estado y precio de un ejemplar puntual y consulta o reserva por mensaje. No compra online: la venta se cierra en el local.
- **Staff del local (admin / super_admin):** carga y edita productos con fotos, marca destacados, ajusta stock, responde consultas, administra promociones, info del local, invitaciones y usuarios. Trabaja desde el panel interno, en escritorio y a veces desde el celular en el mostrador.
- **Evaluadores del TPO:** docentes que revisan el proyecto como "Plataforma web para pequeños comercios". Hoy el proyecto es académico, pero se construye para poder usarlo en un local real.

## Product Purpose

B-Side Club es la vidriera online y el panel de gestión de una disquería de barrio (Chacarita, CABA). El sitio público muestra el catálogo con estado real de cada ejemplar y lleva al visitante a consultar o reservar. El panel permite que el staff mantenga el catálogo y atienda consultas sin conocimientos técnicos. El éxito es que el visitante encuentre un disco y consulte, y que el staff pueda cargar un producto con fotos en menos de un minuto.

## Positioning

Una disquería que escucha cada disco antes de venderlo. Cada ficha describe el ejemplar exacto, con fotos y una condición honesta (escala Goldmine), no un listado genérico de catálogo. La venta no es un checkout online: es una conversación por WhatsApp, Instagram o el formulario, con reserva de 48 hs.

## Operating Context

- Funciones que pide el enunciado del TPO: información del comercio, catálogo, búsqueda, filtro por categoría, contacto, envío de consultas, registro e inicio de sesión del administrador y gestión de productos, categorías, consultas e info del local.
- Stack existente: React 19 + Vite + React Router en `frontend/`, API Express + Prisma (Postgres/Supabase) en `src/`, todo en un solo deploy de Netlify. JavaScript plano, sin TypeScript.
- Las imágenes de productos van a Supabase Storage. El staff va a cargar fotos reales de cada ejemplar.
- Límite de 300 pedidos cada 15 minutos por IP. Las búsquedas usan debounce.

## Capabilities and Constraints

- Estados de stock: disponible, última unidad, reservado, a consultar, vendido. `precio: null` significa "a consultar".
- Roles: `super_admin` (dueño, único, sale del registro inicial), `administrador` y `vendedor`. El resto del staff se suma por invitación. Vendedor gestiona productos, categorías, consultas, promociones e info del local; invitaciones y usuarios quedan solo para super_admin y administrador.
- Promociones con ventana de vigencia, aplicada en el frontend.
- `horario` de store-info se guarda como arreglo `[{label, value}]` (ver `frontend/src/lib/horario.js`).
- Producto no tiene campo artista: el nombre se carga como "Título — Artista" y el frontend lo separa.
- Categorías actuales: Vinilos, Cassettes, CDs, Equipos.

## Brand Commitments

- Nombre: **B-Side Club**. Logo existente en `frontend/public/logo.png`: cassette con brazo de tocadiscos dentro de un círculo cian, con "B SIDE" en rosa y "CLUB" en cian.
- Voz: rioplatense, cercana, honesta y con humor seco ("Un disco no se compra, se encuentra", "Escuchado, no listado"). Usa el voseo.
- Metáfora rectora: Lado A / Lado B.
- El diseño original está en `demo/demo.html`. El usuario pidió una evolución **más audaz** de ese estilo, no una copia literal.

## Evidence on Hand

- Contenido de la demo: textos de Nosotros, los pilares ("Escuchado, no listado", "Estado real, sin vueltas", "Reservas por mensaje") y los datos del local (dirección, horarios, redes). Todo es ficticio, para el TPO.
- No hay testimonios, prensa ni métricas reales. No inventarlos.
- No hay fotos reales del local ni del equipo todavía.

## Product Principles

1. El ejemplar es el protagonista: foto, estado y precio claros por encima de cualquier decoración.
2. Consultar tiene que ser fácil: todo camino termina en WhatsApp, Instagram o el formulario.
3. El carácter de barrio se nota en la voz y en los detalles, nunca a costa de entender la página.
4. El panel es una herramienta: rápido, previsible y sin sorpresas para alguien no técnico.
5. Mobile primero en el sitio público: el visitante llega desde Instagram con el celular.

## Accessibility & Inclusion

WCAG 2.1 AA como piso: contraste, foco visible, navegación por teclado y respeto de `prefers-reduced-motion` (ya hay base en `tokens.css`).
