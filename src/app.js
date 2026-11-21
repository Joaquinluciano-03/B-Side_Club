const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');
const invitacionRoutes = require('./routes/invitacion.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const categoriaRoutes = require('./routes/categoria.routes');
const generoRoutes = require('./routes/genero.routes');
const productoRoutes = require('./routes/producto.routes');
const storeInfoRoutes = require('./routes/storeInfo.routes');
const consultaRoutes = require('./routes/consulta.routes');
const imagenRoutes = require('./routes/imagen.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const promocionRoutes = require('./routes/promocion.routes');
const { errorHandler } = require('./middlewares/errorHandler');
const { requireApiKey } = require('./middlewares/apiKey');
const { limiteGeneral } = require('./middlewares/rateLimit');
const { estaConfigurado } = require('./config/storage');

const app = express();

// con TRUST_PROXY=1 (producción) Express confía en X-Forwarded-For y el límite cuenta por IP real
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY));
}

// headers de seguridad
app.use(
  helmet({
    // permite cargar las imágenes desde otro origen (el frontend corre en otro puerto)
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// dominios del frontend habilitados, se configuran en CORS_ORIGINS separados por coma
const origenesPermitidos = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origen) => origen.trim())
  .filter((origen) => origen !== '');

if (origenesPermitidos.length === 0) {
  console.warn('CORS_ORIGINS no esta configurada: ningun dominio va a poder usar la API desde el navegador.');
}

// CORS solo limita a los navegadores; curl y Postman pasan igual
app.use(
  cors({
    origin: origenesPermitidos,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  })
);

app.use(morgan('dev'));
app.use(express.json());

// va antes de requireApiKey: el health check es público
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// las imágenes están en Supabase Storage, no se sirven desde acá
if (!estaConfigurado()) {
  console.warn(
    'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no estan configuradas: la subida de imagenes va a fallar.'
  );
}

// el límite va antes de la API key para que los pedidos sin clave también cuenten
app.use('/api', limiteGeneral);

// desde acá /api/* exige x-api-key (después de cors, para que el preflight pase sin clave)
app.use('/api', requireApiKey);

app.use('/api/auth', authRoutes);
app.use('/api/invitacion', invitacionRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/generos', generoRoutes); 
app.use('/api/productos', productoRoutes);
app.use('/api/store-info', storeInfoRoutes);
app.use('/api/consultas', consultaRoutes);
app.use('/api', imagenRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/promociones', promocionRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

app.use(errorHandler);

module.exports = app;