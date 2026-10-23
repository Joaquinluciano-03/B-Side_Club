// mapea urls a funciones del controller

const { Router } = require('express');
const generoController = require('../controllers/genero');
const { requireAuth } = require('../middlewares/auth');
const { requireRol } = require('../middlewares/requireRol');

const router = Router();

const rolesGestion = ['super_admin', 'administrador', 'vendedor'];

router.get('/', generoController.listar);
router.post('/', requireAuth, requireRol(...rolesGestion), generoController.crear);
router.delete('/:id', requireAuth, requireRol(...rolesGestion), generoController.eliminar);

module.exports = router;
