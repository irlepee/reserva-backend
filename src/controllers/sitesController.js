const sitesService = require('../services/sitesServices');

async function getSites(req, res) {
    try {
        const sites = await sitesService.getMySites(req.user.userId); //La propiedad del jwt se llama userId, es importante
        res.status(200).json(sites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function create(req, res) {
    try {
        const siteData = req.body;
        const newSite = await sitesService.createSite(siteData, req.user.userId);
        res.status(201).json(newSite);
    } catch (error) {
        console.error(error);  // para ver el error completo en la terminal
        res.status(500).json({ error: error.message });
    }
}

module.exports = { create, getSites }