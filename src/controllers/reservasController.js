const reservasServices = require('../services/reservasServices');

async function getAllReservas(req, res) {
    try {
        const newReserva = await reservasServices.getAllMyReservas(req.user.userId);
        res.status(200).json(newReserva);
    } catch (error) {
        res.status(500).json({ error : error.message });
    }
}

async function create(req, res) {
    try {
        const reservaData = req.body;
        const newReserva = await reservasServices.createReserva(reservaData, req.user.userId);
        res.status(200).json(newReserva);
    } catch (error) {
        res.status(500).json({ error : error.message });
    }
}

async function cancel(req, res) {
    try {
        const reservaData = parseInt(req.params.id);
        const cancelledReserva = await reservasServices.cancelReserva(reservaData, req.user.userId);
        res.status(200).json(cancelledReserva);
    } catch (error) {
        res.status(500).json({ error : error.message });
    }
}

async function history(req, res) {
    try {
        const history = await reservasServices.reservasHistory(req.user.userId);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

async function topSites(req, res) {
    try {
        const result = await reservasServices.topReservedSites(req.user.userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

async function getSites(req, res) {
    try {
        const sites = await reservasServices.getSites();
        res.status(200).json(sites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getResources(req, res) {
    try {
        const siteId = parseInt(req.params.siteId);
        const resources = await reservasServices.getResources(siteId);
        res.status(200).json(resources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getOccupiedHours(req, res) {
    try {
        const resourceId = parseInt(req.params.resourceId);
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'Se requiere el parámetro date (formato: YYYY-MM-DD)' });
        }

        const result = await reservasServices.getOccupiedHours(resourceId, date);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getAllReservas, create, cancel, history, topSites, getSites, getResources, getOccupiedHours }