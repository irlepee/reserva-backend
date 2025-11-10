const express = require('express');

const app = express();
app.use(express.json());

//Rutas
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const sitesRoutes = require('./routes/sites');
app.use('/sites', sitesRoutes);

const groupsRoutes = require('./routes/groups');
app.use('/groups', groupsRoutes);

module.exports = app;