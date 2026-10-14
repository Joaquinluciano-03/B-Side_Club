// mapea urls a funciones del controller

const { Router } = require('express');
const promocionController = require('../controllers/promocion');
const { requireAuth, authOpcional } = require('../middlewares/auth');
const { requireRol } = require('../middlewares/requireRol');

const router = Router();

const rolesGestion = ['super_admin', 'administrador', 'vendedor'];

// authOpcional: sin token sos visitante y solo ves las activas; con token
// (panel) las ves todas, que es lo que hace falta para poder reactivarlas
router.get('/', authOpcional, promocionController.listar);
router.get('/:id', authOpcional, promocionController.obtener);
router.post('/', requireAuth, requireRol(...rolesGestion), promocionController.crear);
router.put('/:id', requireAuth, requireRol(...rolesGestion), promocionController.actualizar);
router.delete('/:id', requireAuth, requireRol(...rolesGestion), promocionController.eliminar);

module.exports = router;