const express = require('express');
const cors = require('cors')

const app = express();

// Aumentar límite de tamaño para JSON y URL-encoded (para imágenes base64 u otros datos grandes)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static('src/uploads'));

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

const locationsRoutes = require('./routes/locations');
app.use('/', locationsRoutes);

module.exports = app;