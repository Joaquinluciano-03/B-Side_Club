// mapea urls a funciones del controller

const { Router } = require('express');
const invitacionController = require('../controllers/invitacion');
const { requireAuth } = require('../middlewares/auth');
const { requireRol } = require('../middlewares/requireRol');
const { limiteCuenta } = require('../middlewares/rateLimit');

const router = Router();

router.post('/', requireAuth, requireRol('super_admin', 'administrador'), invitacionController.crear);
router.get('/', requireAuth, requireRol('super_admin', 'administrador'), invitacionController.listar);
router.delete('/:id', requireAuth, requireRol('super_admin', 'administrador'), invitacionController.revocar);
// publica y crea una cuenta: va con limite, igual que register
router.post('/aceptar', limiteCuenta, invitacionController.aceptar);

module.exports = router;