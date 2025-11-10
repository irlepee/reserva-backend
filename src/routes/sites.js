const express = require('express');
const router = express.Router();
const sitesController = require('../controllers/sitesController');

router.get('/', sitesController.getAllSites);

module.exports = router;