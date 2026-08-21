// traduce http a logica de negocio

const dashboardService = require('../services/dashboard.service');

async function obtenerMetricas(req, res, next) {
  try {
    const metricas = await dashboardService.obtenerMetricas();
    res.json(metricas);
  } catch (err) {
    next(err);
  }
}

module.exports = { obtenerMetricas };