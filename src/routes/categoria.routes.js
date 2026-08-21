// mapea urls a funciones del controller

const { Router } = require('express');
const categoriaController = require('../controllers/categoria');
const { requireAuth } = require('../middlewares/auth');
const { requireRol } = require('../middlewares/requireRol');

const router = Router();

router.get('/', categoriaController.listar);
router.get('/:id', categoriaController.obtener);
router.post('/', requireAuth, requireRol('super_admin', 'administrador','vendedor;'), categoriaController.crear);
router.put('/:id', requireAuth, requireRol('super_admin', 'administrador','vendedor'), categoriaController.actualizar);
router.delete('/:id', requireAuth, requireRol('super_admin', 'administrador','vendedor'), categoriaController.eliminar);

module.exports = router;