// const express = require('express');
// const authRoutes = require('./routes/auth.routes');
// const invitacionRoutes = require('./routes/invitacion.routes'); // ← agregar esta línea
// const { errorHandler } = require('./middlewares/errorHandler');

const express = require('express');
const authRoutes = require('./routes/auth.routes');
const invitacionRoutes = require('./routes/invitacion.routes');
console.log('DEBUG invitacionRoutes:', typeof invitacionRoutes, invitacionRoutes); // ← línea temporal
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/invitacion', invitacionRoutes); // ← agregar esta línea (reemplaza el TODO)

app.use((req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

app.use(errorHandler);

module.exports = app;