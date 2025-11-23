const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locationsController');

router.get('/entidades', locationsController.getEntidades);
router.get('/:entidadId/municipios', locationsController.getMunicipios);
router.get('/:entidadId/:municipioId/localidades', locationsController.getLocalidades); 

module.exports = router;