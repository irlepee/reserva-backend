const express = require('express');
const router = express.Router();
const sitesController = require('../controllers/sitesController');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/', authMiddleware.jwtauthenticator, sitesController.getSites);
router.post('/', authMiddleware.jwtauthenticator, upload.array('images', 3), sitesController.create);
router.get('/categories', sitesController.getCategories);
router.get('/:siteId/stats', authMiddleware.jwtauthenticator, sitesController.getSiteStats);
router.put('/:siteId', authMiddleware.jwtauthenticator, upload.array('images', 3), sitesController.edit);
router.delete('/:siteId', authMiddleware.jwtauthenticator, sitesController.deleteS);
router.get('/:siteId', authMiddleware.jwtauthenticator, sitesController.getSiteById);

module.exports = router;