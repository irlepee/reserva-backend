const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { checkReservationReminders } = require('./reservationRemindersService');
const prisma = new PrismaClient();

// Función para actualizar estados de reservas
async function updateReservaStatuses() {
    try {
        const now = new Date();

        console.log(`[CRON] Ejecutando actualización de estados de reservas - ${now.toISOString()}`);

        // 1. Actualizar reservas a "In Progress" si ya comenzaron
        const inProgressUpdated = await prisma.Reserva.updateMany({
            where: {
                status: "Active",
                start_date: {
                    lte: now
                },
                end_date: {
                    gt: now
                }
            },
            data: {
                status: "In Progress"
            }
        });

        if (inProgressUpdated.count > 0) {
            console.log(`[CRON] ✓ ${inProgressUpdated.count} reserva(s) cambiada(s) a "In Progress"`);
        }

        // 2. Actualizar reservas a "Completed" si ya terminaron
        const completedUpdated = await prisma.Reserva.updateMany({
            where: {
                status: {
                    in: ["Active", "In Progress"]
                },
                end_date: {
                    lte: now
                }
            },
            data: {
                status: "Completed"
            }
        });

        if (completedUpdated.count > 0) {
            console.log(`[CRON] ✓ ${completedUpdated.count} reserva(s) cambiada(s) a "Completed"`);
        }

        // 3. Log si no hubo cambios
        if (inProgressUpdated.count === 0 && completedUpdated.count === 0) {
            console.log(`[CRON] - Sin cambios en esta ejecución`);
        }

        // Debug: mostrar reservas activas que deberían cambiar
        const shouldComplete = await prisma.Reserva.findMany({
            where: {
                status: { in: ["Active", "In Progress"] },
                end_date: { lte: now }
            },
            select: { id: true, status: true, end_date: true }
        });

        if (shouldComplete.length > 0) {
            console.log(`[CRON] ⚠ Reservas que debería haber actualizado:`, shouldComplete);
        }

    } catch (error) {
        console.error('[CRON] Error al actualizar estados de reservas:', error.message);
    }
}

// Función para iniciar todos los cron jobs
function initializeCronJobs() {
    console.log('[CRON] Inicializando cron jobs...');

    // Ejecutar inmediatamente al iniciar el servidor
    console.log('[CRON] Ejecutando actualización de estados al iniciar...');
    updateReservaStatuses();

    // Ejecutar cada 5 minutos
    const task = cron.schedule('*/5 * * * *', updateReservaStatuses);

    // Ejecutar chequeo de recordatorios cada 1 minuto
    const reminderTask = cron.schedule('* * * * *', checkReservationReminders);

    console.log('[CRON] ✓ Cron job configurado: Actualizar estados cada 5 minutos');
    console.log('[CRON] ✓ Cron job configurado: Chequear recordatorios cada 1 minuto');
    console.log('[CRON] Próxima ejecución en 5 minutos');

    return task;
}

module.exports = { initializeCronJobs, updateReservaStatuses };
