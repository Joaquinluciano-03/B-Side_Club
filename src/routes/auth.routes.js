//mapea urls a funciones del controller

const { Router } = require('express');
const authController = require('../controllers/auth');
const { requireAuth } = require('../middlewares/auth');
const { limiteLogin, limiteCuenta } = require('../middlewares/rateLimit');

const router = Router();

router.post('/register', limiteCuenta, authController.register);
router.post('/login', limiteLogin, authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);
router.put('/me', requireAuth, authController.actualizarMe);
router.post('/forgot-password', limiteCuenta, authController.forgotPassword);
router.post('/reset-password', limiteCuenta, authController.resetPassword);

module.exports = router;