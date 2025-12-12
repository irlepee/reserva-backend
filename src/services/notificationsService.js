const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let io = null;

// Inyectar Socket.IO para emisiones en tiempo real
function setIO(ioInstance) {
    io = ioInstance;
}

// Crear tabla de tipos si no existen (ejecutar una sola vez)
async function initializeNotificationTypes() {
    const types = [
        { name: 'reserva_created', description: 'Reserva creada' },
        { name: 'reserva_cancelled_admin', description: 'Reserva cancelada por administrador' },
        { name: 'reserva_reminder_15min', description: 'Recordatorio: 15 minutos para comenzar' },
        { name: 'reserva_ending_15min', description: 'Recordatorio: 15 minutos para terminar' },
        { name: 'reserva_ended', description: 'Reserva terminada' },
        { name: 'invitation_received', description: 'Invitación a grupo recibida' },
        { name: 'invitation_accepted', description: 'Tu invitación fue aceptada' },
        { name: 'invitation_rejected', description: 'Tu invitación fue rechazada' },
        { name: 'group_member_removed', description: 'Fuiste removido del grupo' }
    ];

    for (const type of types) {
        await prisma.NotificationType.upsert({
            where: { name: type.name },
            update: {},
            create: type
        });
    }
}

// Crear notificación y emitir en tiempo real
async function createNotification(userId, typeName, title, body, data = null) {
    try {
        // Obtener el tipo de notificación
        const notificationType = await prisma.NotificationType.findUnique({
            where: { name: typeName }
        });

        if (!notificationType) {
            console.warn(`Notification type "${typeName}" not found`);
            return null;
        }

        // Crear notificación en BD
        const notification = await prisma.Notification.create({
            data: {
                id_user: BigInt(userId),
                id_type: notificationType.id,
                title,
                body,
                data
            },
            include: {
                type: true
            }
        });

        // Emitir en tiempo real si Socket.IO está disponible
        if (io) {
            // Enriquecer payload con datos legibles si vienen referencias en `data`
            const payload = {
                id: Number(notification.id),
                type: notification.type.name,
                title: notification.title,
                body: notification.body,
                data: notification.data,
                createdAt: notification.createdAt ? notification.createdAt.toISOString() : new Date().toISOString(),
                read: false
            };

            try {
                // Si tenemos reservaId, traer info de reserva -> recurso y sitio
                if (notification.data && notification.data.reservaId) {
                    const reserva = await prisma.Reserva.findUnique({
                        where: { id: BigInt(notification.data.reservaId) },
                        include: { Resource: { include: { belongs: true } } }
                    });
                    if (reserva) {
                        payload.resourceName = reserva.Resource?.name || null;
                        payload.siteName = reserva.Resource?.belongs?.name || null;
                        payload.startDate = reserva.start_date ? reserva.start_date.toISOString() : null;
                        payload.endDate = reserva.end_date ? reserva.end_date.toISOString() : null;
                    }
                } else if (notification.data && notification.data.resourceId) {
                    const resource = await prisma.Resource.findUnique({ where: { id: notification.data.resourceId }, include: { belongs: true } });
                    if (resource) {
                        payload.resourceName = resource.name;
                        payload.siteName = resource.belongs?.name || null;
                    }
                } else if (notification.data && notification.data.siteId) {
                    const site = await prisma.Site.findUnique({ where: { id: notification.data.siteId } });
                    if (site) {
                        payload.siteName = site.name;
                    }
                }
            } catch (err) {
                console.warn('[Notifications] Error enriching notification payload:', err.message);
            }

            io.to(`user:${userId}`).emit('notification', payload);
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

// Obtener notificaciones del usuario
async function getNotifications(userId, { limit = 20, offset = 0 } = {}) {
    try {
        const notifications = await prisma.Notification.findMany({
            where: { id_user: BigInt(userId) },
            include: { type: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });

        const total = await prisma.Notification.count({
            where: { id_user: BigInt(userId) }
        });

        return {
            notifications: notifications.map(n => ({
                ...n,
                id: Number(n.id),
                id_user: Number(n.id_user),
                type: n.type.name
            })),
            total,
            limit,
            offset
        };
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
}

// Obtener notificaciones no leídas
async function getUnreadNotifications(userId) {
    try {
        const notifications = await prisma.Notification.findMany({
            where: { id_user: BigInt(userId), read: false },
            include: { type: true },
            orderBy: { createdAt: 'desc' }
        });

        return notifications.map(n => ({
            ...n,
            id: Number(n.id),
            id_user: Number(n.id_user),
            type: n.type.name
        }));
    } catch (error) {
        console.error('Error fetching unread notifications:', error);
        throw error;
    }
}

// Marcar notificaciones como leídas
async function markAsRead(userId, notificationIds) {
    try {
        const result = await prisma.Notification.updateMany({
            where: {
                id: { in: notificationIds.map(id => BigInt(id)) },
                id_user: BigInt(userId)
            },
            data: { read: true }
        });

        return result;
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        throw error;
    }
}

// Marcar todas las notificaciones como leídas
async function markAllAsRead(userId) {
    try {
        const result = await prisma.Notification.updateMany({
            where: { id_user: BigInt(userId), read: false },
            data: { read: true }
        });

        return result;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
}

// Eliminar notificación
async function deleteNotification(userId, notificationId) {
    try {
        const result = await prisma.Notification.delete({
            where: {
                id: BigInt(notificationId)
            }
        });

        return result;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
}

// Obtener conteo de notificaciones no leídas
async function getUnreadCount(userId) {
    try {
        const count = await prisma.Notification.count({
            where: { id_user: BigInt(userId), read: false }
        });

        return count;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        throw error;
    }
}

module.exports = {
    setIO,
    initializeNotificationTypes,
    createNotification,
    getNotifications,
    getUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
};
