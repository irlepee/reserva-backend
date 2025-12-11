const sitesService = require('../services/sitesServices');
const path = require('path');
const fs = require('fs');

function deleteFileIfExists(filePath) {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
        try {
            fs.unlinkSync(fullPath);
        } catch (err) {
            console.error(`Error deleting file ${fullPath}:`, err);
        }
    }
}

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

        // Si images llega como string JSON, parsearlo
        if (siteData.images && typeof siteData.images === 'string') {
            siteData.images = JSON.parse(siteData.images);
        }

        // Si hay imágenes subidas
        if (req.files && req.files.length > 0) {
            siteData.images = req.files.map(file => `/uploads/sites/${file.filename}`);
        }

        // Validar máximo 3 imágenes
        if (siteData.images && siteData.images.length > 3) {
            // Eliminar archivos excedentes del servidor
            for (let i = 3; i < req.files.length; i++) {
                deleteFileIfExists(`/uploads/sites/${req.files[i].filename}`);
            }
            // Mantener solo las primeras 3
            siteData.images = siteData.images.slice(0, 3);
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

        // Parsear existingImages si llega como string JSON
        let imagesToKeep = [];
        if (siteData.existingImages) {
            if (typeof siteData.existingImages === 'string') {
                imagesToKeep = JSON.parse(siteData.existingImages);
            } else if (Array.isArray(siteData.existingImages)) {
                imagesToKeep = siteData.existingImages;
            }
        }

        // Obtener imágenes actuales del sitio
        const currentSite = await sitesService.getSiteByIdForFileCleanup(siteId, req.user.userId);
        const currentImages = currentSite && currentSite.images ? currentSite.images : [];

        // Eliminar solo archivos que NO están en existingImages
        currentImages.forEach(imagePath => {
            if (!imagesToKeep.includes(imagePath)) {
                deleteFileIfExists(imagePath);
            }
        });

        // Si hay imágenes nuevas subidas, agregarlas a las existentes
        let finalImages = [...imagesToKeep];
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `/uploads/sites/${file.filename}`);
            finalImages = [...imagesToKeep, ...newImages];
        }

        // Validar máximo 3 imágenes
        if (finalImages.length > 3) {
            // Eliminar las excedentes del disco
            for (let i = 3; i < finalImages.length; i++) {
                deleteFileIfExists(finalImages[i]);
            }
            // Mantener solo 3
            finalImages = finalImages.slice(0, 3);
        }

        siteData.images = finalImages;

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