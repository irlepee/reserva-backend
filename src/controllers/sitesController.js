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

        console.log('Received site data:', siteData);
        console.log('Received files:', req.files);

        // Si hay imágenes subidas
        if (req.files && req.files.length > 0) {
            siteData.images = req.files.map(file => `/uploads/sites/${file.filename}`);
            console.log('Generated image URLs:', siteData.images);
        }

        const newSite = await sitesService.createSite(siteData, req.user.userId);
        console.log('Site created successfully:', newSite);
        res.status(201).json(newSite);
    } catch (error) {
        console.error('Error creating site:', error);
        res.status(500).json({ error: error.message });
    }
}

async function edit(req, res) {
    try {
        const siteId = parseInt(req.params.siteId);
        const siteData = req.body;

        console.log('Editing site:', siteId);
        console.log('Received files:', req.files);

        // Si hay imágenes nuevas subidas
        if (req.files && req.files.length > 0) {
            siteData.images = req.files.map(file => `/uploads/sites/${file.filename}`);
            console.log('Generated image URLs:', siteData.images);
        }

        const updateSite = await sitesService.editSite(siteId, siteData, req.user.userId);
        console.log('Site updated successfully:', updateSite);
        res.status(200).json(updateSite);
    } catch (error) {
        console.error('Error editing site:', error);
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


module.exports = { create, getSites, edit, deleteS }