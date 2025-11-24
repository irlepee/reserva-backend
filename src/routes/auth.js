const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.jwtauthenticator, authController.getUser);
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;