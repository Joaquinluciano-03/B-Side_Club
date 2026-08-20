// mapea urls a funciones del controller

const { Router } = require('express');
const storeInfoController = require('../controllers/storeInfo');
const { requireAuth } = require('../middlewares/auth');
const { requireRol } = require('../middlewares/requireRol');

const router = Router();

router.get('/', storeInfoController.obtener);
router.put('/', requireAuth, requireRol('super_admin', 'administrador'), storeInfoController.actualizar);

module.exports = router;