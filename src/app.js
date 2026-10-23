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

// Los limites de pedidos cuentan por IP, y la IP la saca de req.ip. Si el
// server queda detras de un proxy (Render, Railway, nginx) todos los pedidos
// llegan con la IP del proxy y el limite se aplicaria a todos juntos: hay que
// decirle a express que confie en el header X-Forwarded-For.
// Se activa con TRUST_PROXY=1 en produccion; en local no hace falta.
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY));
}

// headers de seguridad (saca X-Powered-By, agrega nosniff, HSTS, etc).
// Va primero para que aplique a todas las respuestas, incluso las de error.
app.use(
  helmet({
    // por defecto helmet pone Cross-Origin-Resource-Policy: same-origin, que
    // haria que el navegador bloquee las imagenes de /uploads cuando el
    // frontend corre en otro puerto (localhost:5173). Son archivos publicos,
    // asi que las dejamos cargar desde cualquier origen.
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

// CORS lo aplica el navegador: limita que sitios web pueden consumir la API desde el browser,
// pero no frena pedidos hechos fuera de un navegador (curl, Postman, scripts).
// Los pedidos sin header Origin siguen pasando, que es el comportamiento normal de la libreria.
app.use(
  cors({
    origin: origenesPermitidos,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  })
);

app.use(morgan('dev'));
app.use(express.json());

// queda antes de requireApiKey: es el chequeo de que el server esta arriba, tiene que ser publico
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Las imagenes de los productos ya no se sirven desde acá: viven en Supabase
// Storage y la base guarda su URL publica completa. Antes habia un
// express.static('/uploads'), que dejo de tener sentido cuando el backend
// paso a correr como funcion (no tiene disco propio).
if (!estaConfigurado()) {
  console.warn(
    'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no estan configuradas: la subida de imagenes va a fallar.'
  );
}

// el limite general va ANTES de la API key a proposito: si fuera despues,
// los pedidos sin clave se irian en 401 sin contar para el limite y se podria
// inundar el servidor igual.
app.use('/api', limiteGeneral);

// de aca en adelante, todo /api/* exige el header x-api-key.
// va despues de cors() para que el preflight OPTIONS se responda sin la clave.
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