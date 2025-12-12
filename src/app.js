const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Configuración de CORS más permisiva para desarrollo
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000', 'http://127.0.0.1:4200', 'https://reserva-lepe.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Aumentar límite de tamaño para JSON y URL-encoded (para imágenes base64 u otros datos grandes)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir archivos estáticos (imágenes subidas) con ruta absoluta
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

const reportesRoutes = require('./routes/reportes');
app.use('/reportes', reportesRoutes);

const notificationsRoutes = require('./routes/notifications');
app.use('/notifications', notificationsRoutes);

module.exports = app;