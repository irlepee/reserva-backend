require('dotenv').config({ path: '../.env' });
const http = require('http');
const app = require('./app');
const { initializeCronJobs } = require('./services/cronJobs');
const notificationsService = require('./services/notificationsService');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;

// Crear servidor HTTP para Socket.IO
const server = http.createServer(app);

// Inicializar Socket.IO
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:4200', 'http://localhost:3000', 'http://127.0.0.1:4200', 'https://reserva-lepe.netlify.app'],
        credentials: true,
        methods: ['GET', 'POST']
    }
});

// Autenticar sockets con JWT
io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('No token provided'));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.userId = decoded.userId;
        next();
    } catch (err) {
        next(new Error('Invalid token'));
    }
});

// Conexión de sockets
io.on('connection', (socket) => {
    console.log(`[Socket] User ${socket.userId} connected (${socket.id})`);

    // Unirse a room específico del usuario
    socket.join(`user:${socket.userId}`);

    // Desconexión
    socket.on('disconnect', () => {
        console.log(`[Socket] User ${socket.userId} disconnected (${socket.id})`);
    });
});

// Inyectar Socket.IO al servicio de notificaciones
notificationsService.setIO(io);

server.listen(PORT, async () => {
    console.log('Server running on port ' + PORT);
    
    // Inicializar tipos de notificación
    try {
        await notificationsService.initializeNotificationTypes();
        console.log('[Notifications] Types initialized');
    } catch (error) {
        console.error('[Notifications] Error initializing types:', error);
    }
    
    // Inicializar cron jobs
    initializeCronJobs();
});