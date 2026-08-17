const express = require('express');
const authRoutes = require('./routes/auth.routes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
// TODO: sumar '/api/invitaciones' cuando ese modulo este armado (ver ROADMAP.md, Paso 5)

app.use((req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

app.use(errorHandler); // siempre al final despues de la rutas

module.exports = app;
