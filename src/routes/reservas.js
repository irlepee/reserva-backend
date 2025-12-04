const express = require('express');
const Router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const reservasController = require('../controllers/reservasController');

Router.get('/', authMiddleware.jwtauthenticator, reservasController.getAllReservas);
Router.post('/', authMiddleware.jwtauthenticator, reservasController.create);
Router.delete('/:id', authMiddleware.jwtauthenticator, reservasController.cancel);
Router.get('/history', authMiddleware.jwtauthenticator, reservasController.history);
Router.get('/topSites', authMiddleware.jwtauthenticator, reservasController.topSites);

Router.get('/sites', reservasController.getSites);
Router.get('/sites/:siteId', reservasController.getResources);

Router.get('/resources/:resourceId/occupied', reservasController.getOccupiedHours);

module.exports = Router;