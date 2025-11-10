const express = require('express');
const router = express.Router();
const sitesController = require('../controllers/sitesController');

router.post('/create', sitesController.create);

module.exports = router;