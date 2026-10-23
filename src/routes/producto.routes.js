// mapea urls a funciones del controller

const { Router } = require('express');
const productoController = require('../controllers/producto');
const { requireAuth, authOpcional } = require('../middlewares/auth');
const { requireRol } = require('../middlewares/requireRol');

const router = Router();

const rolesGestion = ['super_admin', 'administrador', 'vendedor'];

router.get('/', authOpcional, productoController.listar);
// va antes de /:id, si no "filtros" se tomaria como un id
router.get('/filtros', authOpcional, productoController.filtros);
router.get('/:id', authOpcional, productoController.obtener);
router.post('/', requireAuth, requireRol(...rolesGestion), productoController.crear);
router.put('/:id', requireAuth, requireRol(...rolesGestion), productoController.actualizar);
router.delete('/:id', requireAuth, requireRol(...rolesGestion), productoController.eliminar);

module.exports = router;