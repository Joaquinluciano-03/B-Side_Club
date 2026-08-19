// mapea urls a funciones del controller

const { Router } = require('express');
const invitacionController = require('../controllers/invitacion');
const { requireAuth } = require('../middlewares/auth');
const { requireRol } = require('../middlewares/requireRol');

const router = Router();

router.post('/', requireAuth, requireRol('super_admin', 'administrador'), invitacionController.crear);
router.post('/aceptar', invitacionController.aceptar);

module.exports = router;