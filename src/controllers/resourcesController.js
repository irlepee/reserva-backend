const resourcesServices = require('../services/resourcesServices')

async function getAll(req, res) {
    try {
        const siteId = parseInt(req.params.siteId);
        const resources = await resourcesServices.getAllResources(siteId);
        res.status(200).json(resources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function create(req, res) {
    try {
        const siteId = parseInt(req.params.siteId);
        const resourceData = req.body;
        const newResource = await resourcesServices.createResource(siteId, resourceData, req.user.userId);
        res.status(200).json(newResource);
    } catch (error) {
        res.status(500).json({ error : error.message });
    }
}

async function edit(req, res) {
    try {
        const siteId = parseInt(req.params.siteId);
        const resourceId = parseInt(req.params.resourceId);
        const resourceData = req.body
        const newResource = await resourcesServices.editResource(siteId, resourceId, resourceData, req.user.userId);
        res.status(200).json(newResource);
    } catch (error) {
        res.status(500).json({ error : error.message });
    }
}

async function deleteR(req, res) {
    try {
        const siteId = parseInt(req.params.siteId);
        const resourceId = parseInt(req.params.resourceId);
        const resource = await resourcesServices.deleteResource(siteId, resourceId, req.user.userId);
        res.status(200).json(resource);
    } catch (error) {
        res.status(500).json({ error : error.message })
    }
}

module.exports = { getAll, create, edit, deleteR }