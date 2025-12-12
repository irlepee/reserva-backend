const notificationsService = require('../services/notificationsService');

async function getNotifications(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const result = await notificationsService.getNotifications(req.user.userId, { limit, offset });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getUnread(req, res) {
    try {
        const notifications = await notificationsService.getUnreadNotifications(req.user.userId);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getUnreadCount(req, res) {
    try {
        const count = await notificationsService.getUnreadCount(req.user.userId);
        res.status(200).json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function markAsRead(req, res) {
    try {
        const { notificationIds } = req.body;

        if (!Array.isArray(notificationIds)) {
            return res.status(400).json({ error: 'notificationIds must be an array' });
        }

        const result = await notificationsService.markAsRead(req.user.userId, notificationIds);
        res.status(200).json({ message: 'Notificaciones marcadas como leídas', updated: result.count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function markAllAsRead(req, res) {
    try {
        const result = await notificationsService.markAllAsRead(req.user.userId);
        res.status(200).json({ message: 'Todas las notificaciones marcadas como leídas', updated: result.count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteNotification(req, res) {
    try {
        const notificationId = parseInt(req.params.id);

        await notificationsService.deleteNotification(req.user.userId, notificationId);
        res.status(200).json({ message: 'Notificación eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getNotifications,
    getUnread,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
