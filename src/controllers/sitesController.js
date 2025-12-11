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

        // Si hay imágenes subidas
        if (req.files && req.files.length > 0) {
            siteData.newImages = req.files.map(file => `/uploads/sites/${file.filename}`);
        }

        const newSite = await sitesService.createSite(siteData, req.user.userId);
        res.status(201).json(newSite);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function edit(req, res) {
    try {
        const siteId = parseInt(req.params.siteId);
        const siteData = req.body;

        // Si hay imágenes nuevas subidas
        if (req.files && req.files.length > 0) {
            siteData.newImages = req.files.map(file => `/uploads/sites/${file.filename}`);
        }

        const updateSite = await sitesService.editSite(siteId, siteData, req.user.userId);
        res.status(200).json(updateSite);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteS(req, res) {
    try {
        const siteId = parseInt(req.params.siteId);
        const result = await sitesService.deleteSite(siteId, req.user.userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getSiteById(req, res) {
    try {
        const siteId = parseInt(req.params.siteId);
        const site = await sitesService.getSiteById(siteId, req.user.userId);
        res.status(200).json(site);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getCategories(req, res) {
    try {
        const categories = await sitesService.getResourceCategories();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getSiteStats(req, res) {
    try {
        const siteId = parseInt(req.params.siteId);
        const stats = await sitesService.getSiteStats(siteId, req.user.userId);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { create, getSites, edit, deleteS, getSiteById, getCategories, getSiteStats };