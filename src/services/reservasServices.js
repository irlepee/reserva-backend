const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
//const { id } = require('zod/locales');

// VERIFICAR QUE DEVUELVA LAS RESERVAS ACTIVAS
async function getAllMyReservas(userId) {
    const reservas = await prisma.Reserva.findMany({
        where: { id_owner: BigInt(userId), status: "Active" },
        include: {
            Resource: {
                select: {
                    id: true,
                    name: true,
                    belongs: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            },
            group: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    const safeReservas = reservas.map(r => ({
        ...r,
        id: Number(r.id),
        id_owner: Number(r.id_owner),
        resource_name: r.Resource?.name,
        site_name: r.Resource?.belongs?.name,
        site_id: r.Resource?.belongs?.id,
        group_name: r.group?.name || null
    }));

    return safeReservas;
}

async function createReserva(reservaData, userId) {
    validateDates(reservaData.start_date, reservaData.end_date);

    // Verificar que no haya conflicto con otras reservas activas del mismo recurso
    const conflictingReserva = await prisma.Reserva.findFirst({
        where: {
            id_resource: reservaData.id_resource,
            status: "Active",
            // Una reserva conflictúa si:
            // - Su inicio está dentro del rango solicitado, O
            // - Su fin está dentro del rango solicitado, O
            // - Envuelve completamente el rango solicitado
            OR: [
                {
                    // El inicio de la reserva existente está dentro del nuevo rango
                    start_date: {
                        gte: new Date(reservaData.start_date),
                        lt: new Date(reservaData.end_date)
                    }
                },
                {
                    // El fin de la reserva existente está dentro del nuevo rango
                    end_date: {
                        gt: new Date(reservaData.start_date),
                        lte: new Date(reservaData.end_date)
                    }
                },
                {
                    // La reserva existente envuelve completamente el nuevo rango
                    AND: [
                        { start_date: { lte: new Date(reservaData.start_date) } },
                        { end_date: { gte: new Date(reservaData.end_date) } }
                    ]
                }
            ]
        }
    });

    if (conflictingReserva) {
        throw new Error("El recurso ya está reservado en ese horario");
    }

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
        orderBy: { created_at: "desc" }
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

async function topReservedSites(userId) {
    const now = new Date();

    // Fechas de referencia
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setMonth(now.getMonth() - 1);

    // --- RESERVAS SEMANA ---
    const weekReservations = await prisma.Reserva.findMany({
        where: {
            id_owner: BigInt(userId),
            start_date: { gte: weekAgo }
        },
        select: { id_resource: true }
    });

    // --- RESERVAS MES ---
    const monthReservations = await prisma.Reserva.findMany({
        where: {
            id_owner: BigInt(userId),
            start_date: { gte: monthAgo }
        },
        select: { id_resource: true }
    });

    // Obtener todos los recursos usados en semana y mes
    const allResourceIds = [
        ...weekReservations.map(r => r.id_resource),
        ...monthReservations.map(r => r.id_resource)
    ];
    const resources = await prisma.Resource.findMany({
        where: { id: { in: allResourceIds } },
        select: { id: true, id_site: true }
    });

    // Mapear id_resource → id_site
    const resourceToSite = new Map(resources.map(r => [r.id, r.id_site]));

    // Contar repeticiones por sitio
    function countTop(reservations) {
        const siteCount = {};
        reservations.forEach(r => {
            const siteId = resourceToSite.get(r.id_resource);
            if (siteId != null) {
                siteCount[siteId] = (siteCount[siteId] || 0) + 1;
            }
        });
        const topEntry = Object.entries(siteCount).sort((a, b) => b[1] - a[1])[0];
        return topEntry ? { id_site: Number(topEntry[0]), count: topEntry[1] } : null;
    }

    return {
        week: countTop(weekReservations),
        month: countTop(monthReservations)
    };
}

async function getSites() {
    const sites = await prisma.Site.findMany();
    
    const safeSites = sites.map(site => ({
        ...site,
        id_owner: Number(site.id_owner)
    }));

    return safeSites;
}

async function getResources(siteId) {
    const resources = await prisma.Resource.findMany({
        where: { id_site: siteId }
    });
    return resources;
}

async function getOccupiedHours(resourceId, date) {
    // Crear rango del día completo (restando 1 día para compensar desfase)
    const startOfDay = new Date(date);
    startOfDay.setDate(startOfDay.getDate() + 1);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);
    endOfDay.setHours(23, 59, 59, 999);

    // Buscar todas las reservas activas del recurso en ese día
    const reservas = await prisma.Reserva.findMany({
        where: {
            id_resource: resourceId,
            status: "Active",
            // Reservas que intersectan con ese día
            start_date: { lt: endOfDay },
            end_date: { gt: startOfDay }
        },
        select: {
            start_date: true,
            end_date: true
        },
        orderBy: { start_date: 'asc' }
    });

    // Convertir a formato de horas ocupadas
    const occupied_hours = reservas.map(r => {
        const start = new Date(r.start_date);
        const end = new Date(r.end_date);
        
        return {
            start: start.getHours(),
            end: end.getHours()
        };
    });

    return {
        date: date,
        occupied_hours: occupied_hours
    };
}

async function getRecommendations(userId) {
    // Obtener últimas 20 reservas del usuario
    const userPattern = await prisma.Reserva.findMany({
        where: { id_owner: BigInt(userId) },
        take: 20,
        orderBy: { created_at: 'desc' },
        include: { 
            Resource: { 
                include: { 
                    belongs: true,
                    type: true
                } 
            } 
        }
    });

    // Si no tiene reservas, retornar array vacío
    if (userPattern.length === 0) {
        return [];
    }

    // Extraer patrones de las reservas
    const hoursArray = userPattern.map(r => new Date(r.start_date).getHours());
    const durationHours = userPattern.map(r => 
        Math.round((new Date(r.end_date) - new Date(r.start_date)) / (1000 * 60 * 60))
    );
    
    let averageHour = Math.round(hoursArray.reduce((a, b) => a + b, 0) / hoursArray.length);
    
    // Si la hora promedio es menor o igual a la hora actual, ajustar a la siguiente hora disponible
    const now = new Date();
    const currentHour = now.getHours();
    
    if (averageHour <= currentHour) {
        averageHour = Math.min(currentHour + 1, 23); // +1 hora, máximo 23:00
    }
    
    const patterns = {
        preferredSites: [...new Set(userPattern.map(r => r.Resource.belongs.name))],
        preferredResourceTypes: [...new Set(userPattern.map(r => r.Resource.type.name))],
        favoriteHours: hoursArray,
        averageHour: averageHour,
        averageDuration: Math.round(durationHours.reduce((a, b) => a + b, 0) / durationHours.length) || 1,
        averageFrequency: userPattern.length / 20
    };

    // Obtener recursos relevantes solo de sus sitios favoritos
    const relevantResources = await prisma.Resource.findMany({
        where: {
            belongs: {
                name: { in: patterns.preferredSites }
            }
        },
        include: { 
            belongs: true,
            type: true,
            reserva: {
                select: { start_date: true, end_date: true }
            }
        },
        take: 10
    });

    // Función para verificar si una hora está disponible
    function isTimeAvailable(resource, hour, durationHours) {
        const testStart = new Date();
        testStart.setHours(hour, 0, 0, 0);
        const testEnd = new Date(testStart.getTime() + durationHours * 60 * 60 * 1000);

        return !resource.reserva.some(r => {
            const rStart = new Date(r.start_date);
            const rEnd = new Date(r.end_date);
            return testStart < rEnd && testEnd > rStart;
        });
    }

    // Preparar recursos con disponibilidad y horarios sugeridos
    const resourcesWithDetails = relevantResources.map(r => {
        const suggestedHour = patterns.averageHour;
        const isAvailable = isTimeAvailable(r, suggestedHour, patterns.averageDuration);
        
        return {
            id: r.id,
            name: r.name,
            type: r.type.name,
            site: r.belongs?.name || 'Sitio desconocido',  // Fallback si belongs es null
            suggestedHour: suggestedHour,
            suggestedDuration: patterns.averageDuration,
            isAvailable: isAvailable,
            currentReservations: r.reserva?.length || 0
        };
    });

    // Enviar a Gemini
    const { generateRecommendations: geminiRecommendations } = require('./geminiService');
    const recommendations = await geminiRecommendations(patterns, resourcesWithDetails);

    // Retornar máximo 3 recomendaciones
    return recommendations.slice(0, 3);
}

async function getBySite(siteId) {

    const reservas = await prisma.Reserva.findMany({
        where: {
            Resource: {
                id_site: siteId
            }
        },
        include: {
            Resource: {
                select: {
                    id: true,
                    name: true,
                    resource_type: true,
                }
            },
            group: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    const safeReservas = reservas.map(r => ({
        ...r,
        id: Number(r.id),
        id_owner: Number(r.id_owner),
        resource_name: r.Resource?.name,
        site_name: r.Resource?.belongs?.name,
        site_id: r.Resource?.belongs?.id,
        group_name: r.group?.name || null
    }));
    return safeReservas;
}

module.exports = { getAllMyReservas, createReserva, cancelReserva, reservasHistory, topReservedSites, getSites, getResources, getOccupiedHours, getRecommendations, getBySite }