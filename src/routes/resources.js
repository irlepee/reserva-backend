const express = require('express')
const router = express.Router();
const resourcesController = require('../controllers/resourcesController')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/:siteId/resources', authMiddleware.jwtauthenticator, resourcesController.getAll);
router.post('/:siteId/resources', authMiddleware.jwtauthenticator, resourcesController.create);
router.put('/:siteId/resources/:resourceId', authMiddleware.jwtauthenticator, resourcesController.edit);
router.delete('/:siteId/resources/:resourceId', authMiddleware.jwtauthenticator, resourcesController.deleteR);

module.exports = router;