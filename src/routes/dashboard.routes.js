// mapea urls a funciones del controller

const { Router } = require('express');
const dashboardController = require('../controllers/dashboard');
const { requireAuth } = require('../middlewares/auth');
const { requireRol } = require('../middlewares/requireRol');

const router = Router();

router.get(
  '/metricas',
  requireAuth,
  requireRol('super_admin', 'administrador', 'vendedor'),
  dashboardController.obtenerMetricas
);

module.exports = router;