// mapea urls a funciones del controller

const { Router } = require('express');
const promocionController = require('../controllers/promocion');
const { requireAuth, authOpcional } = require('../middlewares/auth');
const { requireRol } = require('../middlewares/requireRol');
const upload = require('../config/multer');

const router = Router();

const rolesGestion = ['super_admin', 'administrador', 'vendedor'];

// authOpcional: sin token sos visitante y solo ves las activas; con token
// (panel) las ves todas, que es lo que hace falta para poder reactivarlas
router.get('/', authOpcional, promocionController.listar);
router.get('/:id', authOpcional, promocionController.obtener);
router.post('/', requireAuth, requireRol(...rolesGestion), promocionController.crear);
router.put('/:id', requireAuth, requireRol(...rolesGestion), promocionController.actualizar);
// una sola imagen por promocion, en el campo "imagen" (multipart/form-data)
router.post(
  '/:id/imagen',
  requireAuth,
  requireRol(...rolesGestion),
  upload.single('imagen'),
  promocionController.subirImagen
);
router.delete('/:id', requireAuth, requireRol(...rolesGestion), promocionController.eliminar);

module.exports = router;