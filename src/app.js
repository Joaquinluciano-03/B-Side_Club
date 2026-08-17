

const express = require('express');
const authRoutes = require('./routes/auth.routes');
const invitacionRoutes = require('./routes/invitacion.routes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/invitaciones', invitacionRoutes);

app.use(errorHandler); // siempre al final despues de la rutas

module.exports = app;