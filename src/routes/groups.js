const express = require('express');
const router = express.Router();
const groupsController = require('../controllers/groupsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.jwtauthenticator, groupsController.getGroups);
router.post('/create', authMiddleware.jwtauthenticator, groupsController.create);
router.put('/edit/:groupId', authMiddleware.jwtauthenticator, groupsController.edit);
router.delete('/delete/:groupId', authMiddleware.jwtauthenticator, groupsController.deleteG);

module.exports = router;