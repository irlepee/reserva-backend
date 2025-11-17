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

module.exports = { getAllReservas, create, cancel, history }