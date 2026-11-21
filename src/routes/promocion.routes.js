const { Router } = require('express');
const promocionController = require('../controllers/promocion');
const { requireAuth, authOpcional } = require('../middlewares/auth');
const { requireRol } = require('../middlewares/requireRol');
const upload = require('../config/multer');
const { validarImagen } = require('../middlewares/validarImagen');

const router = Router();

const rolesGestion = ['super_admin', 'administrador', 'vendedor'];

// sin token solo ves las activas; con token (panel) ves todas
router.get('/', authOpcional, promocionController.listar);
router.get('/:id', authOpcional, promocionController.obtener);
router.post('/', requireAuth, requireRol(...rolesGestion), promocionController.crear);
router.put('/:id', requireAuth, requireRol(...rolesGestion), promocionController.actualizar);
// una imagen por promoción, campo "imagen"
router.post(
  '/:id/imagen',
  requireAuth,
  requireRol(...rolesGestion),
  upload.single('imagen'),
  validarImagen,
  promocionController.subirImagen
);
router.delete('/:id', requireAuth, requireRol(...rolesGestion), promocionController.eliminar);

module.exports = router;