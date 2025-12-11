const express = require('express');
const Router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    generateSiteUsageReport,
    generateSiteOccupancyReport,
    generateAdministrativeReport,
    generateUserReport,
    generateCompleteSiteReport
} = require('../services/reportesServices');

// Reporte de uso de un sitio
Router.get('/sitio/:siteId/uso', authMiddleware.jwtauthenticator, async (req, res) => {
    try {
        const siteId = parseInt(req.params.siteId);
        const doc = await generateSiteUsageReport(siteId, req.user.userId);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="reporte-uso.pdf"');
        doc.pipe(res);
        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reporte de ocupación de un sitio
Router.get('/sitio/:siteId/ocupacion', authMiddleware.jwtauthenticator, async (req, res) => {
    try {
        const siteId = parseInt(req.params.siteId);
        const doc = await generateSiteOccupancyReport(siteId, req.user.userId);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="reporte-ocupacion.pdf"');
        doc.pipe(res);
        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reporte administrativo (requiere ser admin)
Router.get('/administrativo', authMiddleware.jwtauthenticator, async (req, res) => {
    try {
        const doc = await generateAdministrativeReport(req.user.userId);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="reporte-administrativo.pdf"');
        doc.pipe(res);
        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reporte personal del usuario
Router.get('/personal', authMiddleware.jwtauthenticator, async (req, res) => {
    try {
        const doc = await generateUserReport(req.user.userId);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="reporte-personal.pdf"');
        doc.pipe(res);
        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reporte completo de un sitio
Router.get('/sitio/:siteId/completo', authMiddleware.jwtauthenticator, async (req, res) => {
    try {
        const siteId = parseInt(req.params.siteId);
        const doc = await generateCompleteSiteReport(siteId, req.user.userId);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="reporte-sitio-completo.pdf"');
        doc.pipe(res);
        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = Router;
