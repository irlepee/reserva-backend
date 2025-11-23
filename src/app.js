const express = require('express');
const cors = require('cors')

const app = express();

app.use(express.json());
app.use(cors());

app.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

//Rutas
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const sitesRoutes = require('./routes/sites');
app.use('/sites', sitesRoutes);

const resourcesRoutes = require('./routes/resources');
app.use('/sites', resourcesRoutes);

const groupsRoutes = require('./routes/groups');
app.use('/groups', groupsRoutes);

const reservasRoutes = require('./routes/reservas');
app.use('/reservas', reservasRoutes);

module.exports = app;