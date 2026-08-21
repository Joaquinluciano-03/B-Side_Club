// mapea urls a funciones del controller

const { Router } = require('express');
const imagenController = require('../controllers/imagen');
const upload = require('../config/multer');
const { requireAuth } = require('../middlewares/auth');
const { requireRol } = require('../middlewares/requireRol');

const router = Router();

const rolesGestion = ['super_admin', 'administrador', 'vendedor'];

// sube hasta 5 imagenes juntas, asociadas a un producto puntual
router.post(
  '/productos/:id/imagenes',
  requireAuth,
  requireRol(...rolesGestion),
  upload.array('imagenes', 5),
  imagenController.agregar
);

router.delete('/imagenes/:id', requireAuth, requireRol(...rolesGestion), imagenController.eliminar);

module.exports = router;