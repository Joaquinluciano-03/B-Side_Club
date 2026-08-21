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

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/invitacion', invitacionRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/categorias', categoriaRoutes); 
app.use('/api/productos', productoRoutes);
app.use('/api/store-info', storeInfoRoutes);
app.use('/api/consultas', consultaRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // sirve las imagenes como archivos estaticos
app.use('/api', imagenRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/promociones', promocionRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Recurso no encontrado' });
});

app.use(errorHandler);

module.exports = app;