const { Router } = require('express');
const imagenController = require('../controllers/imagen');
const upload = require('../config/multer');
const { validarImagen } = require('../middlewares/validarImagen');
const { requireAuth } = require('../middlewares/auth');
const { requireRol } = require('../middlewares/requireRol');

const router = Router();

const rolesGestion = ['super_admin', 'administrador', 'vendedor'];

// hasta 5 imágenes juntas para un producto
router.post(
  '/productos/:id/imagenes',
  requireAuth,
  requireRol(...rolesGestion),
  upload.array('imagenes', 5),
  validarImagen,
  imagenController.agregar
);

router.patch('/imagenes/:id', requireAuth, requireRol(...rolesGestion), imagenController.actualizarOrden);
router.delete('/imagenes/:id', requireAuth, requireRol(...rolesGestion), imagenController.eliminar);

module.exports = router;