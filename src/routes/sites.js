const express = require('express');
const router = express.Router();
const sitesController = require('../controllers/sitesController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.jwtauthenticator , sitesController.getSites);
router.post('/', authMiddleware.jwtauthenticator , sitesController.create);
router.put('/:siteId', authMiddleware.jwtauthenticator , sitesController.edit);
router.delete('/:siteId', authMiddleware.jwtauthenticator , sitesController.deleteS);

module.exports = router;