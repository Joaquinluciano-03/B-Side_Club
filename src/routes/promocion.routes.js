// mapea urls a funciones del controller

const { Router } = require('express');
const promocionController = require('../controllers/promocion');
const { requireAuth } = require('../middlewares/auth');
const { requireRol } = require('../middlewares/requireRol');

const router = Router();

const rolesGestion = ['super_admin', 'administrador', 'vendedor'];

router.get('/', promocionController.listar);
router.get('/:id', promocionController.obtener);
router.post('/', requireAuth, requireRol(...rolesGestion), promocionController.crear);
router.put('/:id', requireAuth, requireRol(...rolesGestion), promocionController.actualizar);
router.delete('/:id', requireAuth, requireRol(...rolesGestion), promocionController.eliminar);

module.exports = router;