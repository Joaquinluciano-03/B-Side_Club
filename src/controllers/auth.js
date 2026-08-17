//traduce http a logica de negocio


const authService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const { mail, password } = req.body;

    if (!mail || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const resultado = await authService.login({ mail, password });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = { login };