const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
//const { id } = require('zod/locales');

// VERIFICAR QUE DEVUELVA LAS RESERVAS ACTIVAS
async function getAllMyReservas(userId) {
    const reservas = await prisma.Reserva.findMany({
        where: { id_owner: BigInt(userId), status: "Active" }
    });

    const safeReservas = reservas.map(r => ({
        ...r,
        id: Number(r.id),
        id_owner: Number(r.id_owner)
    }));

    return safeReservas;
}

async function createReserva(reservaData, userId) {

    validateDates(reservaData.start_date, reservaData.end_date);

    const newReserva = await prisma.Reserva.create({
        data: {
            id_owner: BigInt(userId),
            id_resource: reservaData.id_resource,
            start_date: reservaData.start_date,
            end_date: reservaData.end_date,
            status: "Active",
            id_group: reservaData.id_group,
        }
    })

    const safeReserva = {
        ...newReserva,
        id: Number(newReserva.id),
        id_owner: Number(newReserva.id_owner)
    }

    return safeReserva;
}

async function cancelReserva(reservaId, userId) {

    const reserva = await prisma.Reserva.findFirst({
        where: { id: BigInt(reservaId), id_owner: BigInt(userId), status: "Active" }
    })

    if (!reserva) {
        throw new Error("Reserva not found")
    }

    const cancelledReserva = await prisma.Reserva.update({
        where: { id: BigInt(reservaId) },
        data: {
            status: "Cancelled"
        }
    })

    const safeReserva = {
        ...cancelledReserva,
        id: Number(cancelledReserva.id),
        id_owner: Number(cancelledReserva.id_owner)
    }

    return safeReserva;
}

async function reservasHistory(userId) {

    const history = await prisma.Reserva.findMany({
        where: { id_owner: BigInt(userId) },
        orderBy: { date_reserved: "desc" }
    })

    const safeHistory = history.map(h => ({
        ...h,
        id: Number(h.id),
        id_owner: Number(h.id_owner)
    }))

    return safeHistory;
}

function validateDates(startUnconverted, endUnconverted) {

    const startConverted = validateHour(startUnconverted);
    const endConverted = validateHour(endUnconverted);

    if (startConverted.getTime() >= endConverted.getTime()) {
        throw new Error("StartEndInconsistent");
    }
}

function validateHour(dateString) {
    const d = new Date(dateString);

    if (isNaN(d.getTime())) {
        throw new Error("InvalidDate");
    }

    // Validar que no tenga minutos, segundos, milisegundos
    if (d.getMinutes() !== 0 || d.getSeconds() !== 0 || d.getMilliseconds() !== 0) {
        throw new Error("NotHour");
    }

    const now = new Date();

    // Obtener la siguiente hora válida
    const nextHour = new Date(now);
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(now.getHours() + 1);

    // La reserva debe ser exactamente esa hora o cualquier hora después
    if (d.getTime() < nextHour.getTime()) {
        throw new Error("HourTooSoon");
    }

    return d;
}



module.exports = { getAllMyReservas, createReserva, cancelReserva, reservasHistory }