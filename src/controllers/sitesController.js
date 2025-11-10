const sitesService = require('../services/sitesServices');

async function create(req, res) {
    try {
        const siteData = req.body;
        const newSite = await sitesService.createSite(siteData);
        res.status(201).json(newSite);
    } catch (error) {
        console.error(error);  // para ver el error completo en la terminal
        res.status(500).json({ error: error.message });
    }
}

module.exports = { create }