const sitesService = require('../services/sitesService');

async function getAllSites(req, res) {
    try {
        const sites = await sitesService.fetchAllSites();
        res.status(200).json(sites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getAllSites };