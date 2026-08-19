// mapea urls a funciones del controller

const { Router } = require('express');
const usuariosController = require('../controllers/usuarios');
const { requireAuth } = require('../middlewares/auth');
const { requireRol } = require('../middlewares/requireRol');

const router = Router();

router.get('/', requireAuth, requireRol('super_admin', 'administrador'), usuariosController.listar);
router.put('/:id', requireAuth, requireRol('super_admin', 'administrador'), usuariosController.actualizar);
router.delete('/:id', requireAuth, requireRol('super_admin', 'administrador'), usuariosController.eliminar);

module.exports = router;
