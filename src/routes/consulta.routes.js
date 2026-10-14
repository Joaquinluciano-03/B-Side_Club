// mapea urls a funciones del controller

const { Router } = require('express');
const consultaController = require('../controllers/consulta');
const { requireAuth } = require('../middlewares/auth');
const { requireRol } = require('../middlewares/requireRol');
const { limiteFormulario } = require('../middlewares/rateLimit');

const router = Router();

const rolesGestion = ['super_admin', 'administrador', 'vendedor'];

router.post('/', limiteFormulario, consultaController.crear);
router.get('/', requireAuth, requireRol(...rolesGestion), consultaController.listar);
router.patch('/:id/estado', requireAuth, requireRol(...rolesGestion), consultaController.cambiarEstado);
router.delete('/:id', requireAuth, requireRol(...rolesGestion), consultaController.eliminar);

module.exports = router;