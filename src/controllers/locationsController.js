const locationsServices = require('../services/locationsServices');

async function getEntidades(req, res) {
    try {
        const entidades = await locationsServices.getEntidades();
        console.log('[LOCATIONS] Estados cargados:', entidades.length, 'registros');
        res.status(200).json(entidades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getMunicipios (req, res) {
    try {
        const municipios = await locationsServices.getMunicipios(parseInt(req.params.entidadId));
        console.log('[LOCATIONS] Municipios cargados para estado', req.params.entidadId, ':', municipios.length, 'registros');
        res.status(200).json(municipios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getLocalidades (req, res) {
    try {
        const localidades = await locationsServices.getLocalidades(parseInt(req.params.entidadId), parseInt(req.params.municipioId));
        console.log('[LOCATIONS] Localidades cargadas para estado', req.params.entidadId, 'municipio', req.params.municipioId, ':', localidades.length, 'registros');
        res.status(200).json(localidades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getEntidades, getMunicipios, getLocalidades };