//mapea urls a funciones del controller

const { Router } = require('express');
const authController = require('../controllers/auth');

const router = Router();

router.post('/login', authController.login);

module.exports = router;