const { PrismaClient } = require('@prisma/client');
const notificationsService = require('./notificationsService');
const prisma = new PrismaClient();

// Verificar si ya existe una notificación similar para evitar duplicados
async function hasRecentNotification(userId, notificationType, reservaId, minutesBack = 15) {
    try {
        const cutoffTime = new Date(Date.now() - minutesBack * 60000);
        
        const existingNotification = await prisma.Notification.findFirst({
            where: {
                id_user: BigInt(userId),
                id_type: (await prisma.NotificationType.findUnique({ where: { name: notificationType } })).id,
                createdAt: {
                    gte: cutoffTime
                },
                data: {
                    path: ['reservaId'],
                    equals: reservaId
                }
            }
        });

        return !!existingNotification;
    } catch (error) {
        console.warn('[Reminders] Error checking for existing notification:', error.message);
        return false;
    }
}

// Ejecutar cada minuto para verificar reservas próximas a empezar o terminar
async function checkReservationReminders() {
    try {
        const now = new Date();
        
        // Reservas que inician en 15 minutos
        const fifteenMinutesLater = new Date(now.getTime() + 15 * 60000);
        const reservasStarting = await prisma.Reserva.findMany({
            where: {
                status: 'Active',
                start_date: {
                    gte: now,
                    lte: fifteenMinutesLater
                }
            },
            include: {
                Resource: { include: { belongs: true } }
            }
        });

        // Enviar notificaciones de inicio (solo si no existe una reciente)
        for (const reserva of reservasStarting) {
            const hasRecent = await hasRecentNotification(
                Number(reserva.id_owner),
                'reserva_reminder_15min',
                Number(reserva.id),
                15
            );

            if (!hasRecent) {
                const resourceName = reserva.Resource?.name || 'Recurso desconocido';
                const siteName = reserva.Resource?.belongs?.name || 'Sitio desconocido';
                
                await notificationsService.createNotification(
                    Number(reserva.id_owner),
                    'reserva_reminder_15min',
                    'Recordatorio: Reserva próxima a comenzar',
                    `Tu reserva en "${siteName}" - ${resourceName} comienza en 15 minutos`,
                    { reservaId: Number(reserva.id), resourceId: reserva.id_resource, siteId: reserva.Resource?.id_site }
                );
            }
        }

        // Reservas que terminan en 15 minutos
        const reservasEnding = await prisma.Reserva.findMany({
            where: {
                status: 'Active',
                end_date: {
                    gte: now,
                    lte: fifteenMinutesLater
                }
            },
            include: {
                Resource: { include: { belongs: true } }
            }
        });

        // Enviar notificaciones de fin (solo si no existe una reciente)
        for (const reserva of reservasEnding) {
            const hasRecent = await hasRecentNotification(
                Number(reserva.id_owner),
                'reserva_ending_15min',
                Number(reserva.id),
                15
            );

            if (!hasRecent) {
                const resourceName = reserva.Resource?.name || 'Recurso desconocido';
                const siteName = reserva.Resource?.belongs?.name || 'Sitio desconocido';
                
                await notificationsService.createNotification(
                    Number(reserva.id_owner),
                    'reserva_ending_15min',
                    'Recordatorio: Reserva próxima a terminar',
                    `Tu reserva en "${siteName}" - ${resourceName} termina en 15 minutos`,
                    { reservaId: Number(reserva.id), resourceId: reserva.id_resource, siteId: reserva.Resource?.id_site }
                );
            }
        }

        // Reservas que ya terminaron
        const reservasEnded = await prisma.Reserva.findMany({
            where: {
                status: 'Active',
                end_date: {
                    lte: now
                }
            },
            include: {
                Resource: { include: { belongs: true } }
            }
        });

        // Enviar notificaciones de finalización y marcar como completadas (solo si no existe)
        for (const reserva of reservasEnded) {
            const hasRecent = await hasRecentNotification(
                Number(reserva.id_owner),
                'reserva_ended',
                Number(reserva.id),
                1 // Solo última hora para reservas terminadas
            );

            if (!hasRecent) {
                const resourceName = reserva.Resource?.name || 'Recurso desconocido';
                const siteName = reserva.Resource?.belongs?.name || 'Sitio desconocido';
                
                await notificationsService.createNotification(
                    Number(reserva.id_owner),
                    'reserva_ended',
                    'Reserva finalizada',
                    `Tu reserva en "${siteName}" - ${resourceName} ha finalizado`,
                    { reservaId: Number(reserva.id), resourceId: reserva.id_resource, siteId: reserva.Resource?.id_site }
                );
            }

            // Actualizar estado de la reserva
            await prisma.Reserva.update({
                where: { id: reserva.id },
                data: { status: 'Completed' }
            });
        }

        console.log('[Reminders] Check completed');
    } catch (error) {
        console.error('[Reminders] Error checking reservations:', error);
    }
}

module.exports = { checkReservationReminders };
