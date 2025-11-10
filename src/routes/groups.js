const express = require('express');
const router = express.Router();
const groupsController = require('../controllers/groupsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.jwtauthenticator, groupsController.getGroups);
router.post('/create', authMiddleware.jwtauthenticator, groupsController.create);

module.exports = router;