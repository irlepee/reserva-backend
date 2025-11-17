const express = require('express');
const Router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const reservasController = require('../controllers/reservasController');
const { jwt } = require('zod');

Router.get('/', authMiddleware.jwtauthenticator, reservasController.getAllReservas);
Router.post('/', authMiddleware.jwtauthenticator, reservasController.create);
Router.delete('/:id', authMiddleware.jwtauthenticator, reservasController.cancel);

module.exports = Router;