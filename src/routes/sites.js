const express = require('express');
const router = express.Router();
const sitesController = require('../controllers/sitesController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.jwtauthenticator , sitesController.getSites);
router.post('/create', authMiddleware.jwtauthenticator , sitesController.create);

module.exports = router;