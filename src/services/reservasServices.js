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

module.exports = { getAllMyReservas, createReserva, cancelReserva }