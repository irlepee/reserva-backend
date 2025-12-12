const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener notificaciones paginadas
router.get('/', authMiddleware.jwtauthenticator, notificationsController.getNotifications);

// Obtener notificaciones no leídas
router.get('/unread/list', authMiddleware.jwtauthenticator, notificationsController.getUnread);

// Obtener conteo de notificaciones no leídas
router.get('/unread/count', authMiddleware.jwtauthenticator, notificationsController.getUnreadCount);

// Marcar como leídas (múltiples)
router.post('/mark-read', authMiddleware.jwtauthenticator, notificationsController.markAsRead);

// Marcar todas como leídas
router.post('/mark-all-read', authMiddleware.jwtauthenticator, notificationsController.markAllAsRead);

// Eliminar notificación
router.delete('/:id', authMiddleware.jwtauthenticator, notificationsController.deleteNotification);

module.exports = router;
