const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/auth.routes');
const invitacionRoutes = require('./routes/invitacion.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const categoriaRoutes = require('./routes/categoria.routes');
const productoRoutes = require('./routes/producto.routes');
const storeInfoRoutes = require('./routes/storeInfo.routes');
const consultaRoutes = require('./routes/consulta.routes');
const imagenRoutes = require('./routes/imagen.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const promocionRoutes = require('./routes/promocion.routes');
const path = require('path');
const { errorHandler } = require('./middlewares/errorHandler');
const { requireApiKey } = require('./middlewares/apiKey');

const app = express();

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

// los archivos estaticos no piden API key: las etiquetas <img> del navegador no mandan headers
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// de aca en adelante, todo /api/* exige el header x-api-key.
// va despues de cors() para que el preflight OPTIONS se responda sin la clave.
app.use('/api', requireApiKey);

app.use('/api/auth', authRoutes);
app.use('/api/invitacion', invitacionRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias', categoriaRoutes); 
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