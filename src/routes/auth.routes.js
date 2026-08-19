//mapea urls a funciones del controller

const { Router } = require('express');
const authController = require('../controllers/auth');
const { requireAuth } = require('../middlewares/auth');

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);
router.put('/me', requireAuth, authController.actualizarMe);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;