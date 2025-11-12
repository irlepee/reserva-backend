const express = require('express');
const router = express.Router();
const groupsController = require('../controllers/groupsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.jwtauthenticator, groupsController.getGroups);
router.post('/', authMiddleware.jwtauthenticator, groupsController.create);
router.put('/:groupId', authMiddleware.jwtauthenticator, groupsController.edit);
router.delete('/:groupId', authMiddleware.jwtauthenticator, groupsController.deleteG);

module.exports = router;