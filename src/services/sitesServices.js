const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getMySites(userId) {
    const sites = await prisma.Site.findMany({
        where: {
            id_owner: BigInt(userId) // <- aquí convertimos a BigInt
        }
    });

    // Convertimos id_owner a Number antes de enviar al frontend
    return sites.map(site => ({
        ...site,
        id_owner: Number(site.id_owner)
    }));
}

async function createSite(siteData, userId) {


    const newSite = await prisma.Site.create({
        data: {
            id_owner: BigInt(userId),
            name: siteData.name,
            description: siteData.description,
            id_entidad: siteData.id_entidad ? parseInt(siteData.id_entidad) : null,
            id_municipio: siteData.id_municipio ? parseInt(siteData.id_municipio) : null,
            id_localidad: siteData.id_localidad ? parseInt(siteData.id_localidad) : null,
            images: siteData.images || [],
            opening_hour: siteData.opening_hour || '',
            closing_hour: siteData.closing_hour || ''
        },
    });

    const safeSite = {
        ...newSite,
        id_owner: Number(newSite.id_owner)
    };

    return safeSite;
}

async function editSite(siteId, siteData, userId) {

    await isOwner(siteId, userId);

    const updateData = {};

    if (siteData.name !== undefined && siteData.name !== '') {
        updateData.name = siteData.name;
    }

    if (siteData.description !== undefined && siteData.description !== '') {
        updateData.description = siteData.description;
    }

    if (siteData.id_entidad !== undefined && siteData.id_entidad !== '') {
        const parsedId = parseInt(siteData.id_entidad);
        if (!isNaN(parsedId)) {
            updateData.id_entidad = parsedId;
        }
    }

    if (siteData.id_municipio !== undefined && siteData.id_municipio !== '') {
        const parsedId = parseInt(siteData.id_municipio);
        if (!isNaN(parsedId)) {
            updateData.id_municipio = parsedId;
        }
    }

    if (siteData.id_localidad !== undefined && siteData.id_localidad !== '') {
        const parsedId = parseInt(siteData.id_localidad);
        if (!isNaN(parsedId)) {
            updateData.id_localidad = parsedId;
        }
    }


    // Si hay imágenes en siteData, actualizar (reemplazar completamente)
    if (siteData.images !== undefined) {
        // Asegurar que sea array y máximo 3
        const imagesToSave = Array.isArray(siteData.images) ? siteData.images.slice(0, 3) : [];
        updateData.images = imagesToSave;
    }

    // Manejar opening_hour y closing_hour como string
    if (typeof siteData.opening_hour === 'string') {
        updateData.opening_hour = siteData.opening_hour;
    }
    if (typeof siteData.closing_hour === 'string') {
        updateData.closing_hour = siteData.closing_hour;
    }

    const updatedSite = await prisma.Site.update({
        where: { id: siteId },
        data: updateData,
    });

    const safeSite = {
        ...updatedSite,
        id_owner: Number(updatedSite.id_owner)
    };

    return safeSite;
}

async function deleteSite(siteId, userId) {

    await isOwner(siteId, userId);

    // Eliminar todas las reservas asociadas a los recursos del sitio
    const resources = await prisma.Resource.findMany({
        where: { id_site: siteId },
        select: { id: true }
    });

    const resourceIds = resources.map(r => r.id);

    if (resourceIds.length > 0) {
        await prisma.Reserva.deleteMany({
            where: { id_resource: { in: resourceIds } }
        });
    }

    // Eliminar todos los recursos del sitio
    await prisma.Resource.deleteMany({
        where: { id_site: siteId }
    });

    // Finalmente eliminar el sitio
    await prisma.Site.delete({
        where: { id: siteId }
    });

    return { message: 'Site deleted successfully' };
}

async function isOwner(siteId, userId) {
    const site = await prisma.Site.findFirst({
        where: {
            id: siteId,
            id_owner: BigInt(userId)
        }
    })

    if (!site) {
        throw new Error('Site not found');
    }

    return true;
}

async function getSiteById(siteId, userId) {
    const site = await prisma.Site.findFirst({
        where: {
            id: siteId,
            id_owner: BigInt(userId)
        }
    });

    if (!site) {
        throw new Error('Site not found');
    }

    const result = {
        ...site,
        id_owner: Number(site.id_owner),
        opening_hour: site.opening_hour,
        closing_hour: site.closing_hour
    };
    return result;
}

// Función auxiliar para obtener sitio sin mostrar logs (para limpieza de archivos)
async function getSiteByIdForFileCleanup(siteId, userId) {
    const site = await prisma.Site.findFirst({
        where: {
            id: siteId,
            id_owner: BigInt(userId)
        }
    });

    if (!site) {
        throw new Error('Site not found');
    }

    return site;
}

async function getResourceCategories() {
    const categories = await prisma.ResourceType.findMany();
    return categories;
}

async function getSiteStats(siteId, userId) {
    await isOwner(siteId, userId);

    const now = new Date();
    
    // Fechas de referencia
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    
    const monthAgo = new Date(now);
    monthAgo.setMonth(now.getMonth() - 1);
    
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(now.getDate() - 28);
    
    const eightWeeksAgo = new Date(now);
    eightWeeksAgo.setDate(now.getDate() - 56);

    // Obtener todos los recursos del sitio
    const resources = await prisma.Resource.findMany({
        where: { id_site: siteId },
        select: { id: true, name: true }
    });
    const resourceIds = resources.map(r => r.id);

    if (resourceIds.length === 0) {
        return {
            totalReservas: 0,
            reservasUltimaSemana: 0,
            reservasUltimoMes: 0,
            tasaOcupacion: 0,
            reservasPorDia: [
                { dia: 'Lun', cantidad: 0 },
                { dia: 'Mar', cantidad: 0 },
                { dia: 'Mié', cantidad: 0 },
                { dia: 'Jue', cantidad: 0 },
                { dia: 'Vie', cantidad: 0 },
                { dia: 'Sáb', cantidad: 0 },
                { dia: 'Dom', cantidad: 0 }
            ],
            topRecursos: [],
            reservasPorSemana: [],
            horasPopulares: [],
            tiposReserva: { individuales: 0, grupales: 0 }
        };
    }

    // Total de reservas (todas las del sitio)
    const totalReservas = await prisma.Reserva.count({
        where: { id_resource: { in: resourceIds } }
    });

    // Reservas última semana
    const reservasUltimaSemana = await prisma.Reserva.count({
        where: {
            id_resource: { in: resourceIds },
            start_date: { gte: weekAgo }
        }
    });

    // Reservas último mes
    const reservasUltimoMes = await prisma.Reserva.count({
        where: {
            id_resource: { in: resourceIds },
            start_date: { gte: monthAgo }
        }
    });

    // Reservas por día (últimas 4 semanas)
    const reservasCuatroSemanas = await prisma.Reserva.findMany({
        where: {
            id_resource: { in: resourceIds },
            start_date: { gte: fourWeeksAgo }
        },
        select: { start_date: true }
    });

    const diasNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const conteoPorDia = [0, 0, 0, 0, 0, 0, 0]; // Dom=0, Lun=1, ..., Sáb=6
    
    reservasCuatroSemanas.forEach(r => {
        const dia = new Date(r.start_date).getDay();
        conteoPorDia[dia]++;
    });

    // Reordenar para que empiece en Lunes
    const reservasPorDia = [
        { dia: 'Lun', cantidad: conteoPorDia[1] },
        { dia: 'Mar', cantidad: conteoPorDia[2] },
        { dia: 'Mié', cantidad: conteoPorDia[3] },
        { dia: 'Jue', cantidad: conteoPorDia[4] },
        { dia: 'Vie', cantidad: conteoPorDia[5] },
        { dia: 'Sáb', cantidad: conteoPorDia[6] },
        { dia: 'Dom', cantidad: conteoPorDia[0] }
    ];

    // Top 5 recursos más reservados
    const reservasPorRecurso = await prisma.Reserva.groupBy({
        by: ['id_resource'],
        where: { id_resource: { in: resourceIds } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5
    });

    const maxReservas = reservasPorRecurso[0]?._count.id || 1;
    const topRecursos = reservasPorRecurso.map(r => {
        const recurso = resources.find(res => res.id === r.id_resource);
        return {
            nombre: recurso?.name || 'Desconocido',
            reservas: r._count.id,
            porcentaje: Math.round((r._count.id / maxReservas) * 100)
        };
    });

    // Reservas por semana (últimas 8 semanas)
    const reservasOchoSemanas = await prisma.Reserva.findMany({
        where: {
            id_resource: { in: resourceIds },
            start_date: { gte: eightWeeksAgo }
        },
        select: { start_date: true }
    });

    const reservasPorSemana = [];
    for (let i = 7; i >= 0; i--) {
        const inicioSemana = new Date(now);
        inicioSemana.setDate(now.getDate() - (i + 1) * 7);
        const finSemana = new Date(now);
        finSemana.setDate(now.getDate() - i * 7);

        const cantidad = reservasOchoSemanas.filter(r => {
            const fecha = new Date(r.start_date);
            return fecha >= inicioSemana && fecha < finSemana;
        }).length;

        reservasPorSemana.push({
            semana: `S${8 - i}`,
            cantidad
        });
    }

    // Horas populares (top 8)
    const todasReservas = await prisma.Reserva.findMany({
        where: { id_resource: { in: resourceIds } },
        select: { start_date: true }
    });

    const conteoPorHora = {};
    todasReservas.forEach(r => {
        const hora = new Date(r.start_date).getHours();
        const horaStr = `${hora.toString().padStart(2, '0')}:00`;
        conteoPorHora[horaStr] = (conteoPorHora[horaStr] || 0) + 1;
    });

    const horasPopulares = Object.entries(conteoPorHora)
        .map(([hora, cantidad]) => ({ hora, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 8);

    // Tipos de reserva (individuales vs grupales)
    const reservasGrupales = await prisma.Reserva.count({
        where: {
            id_resource: { in: resourceIds },
            id_group: { not: null }
        }
    });
    const reservasIndividuales = totalReservas - reservasGrupales;

    // Tasa de ocupación (aproximada basada en últimas 4 semanas)
    // Asumiendo horario de 8am a 10pm (14 horas) * 7 días * 4 semanas * cantidad de recursos
    const horasDisponibles = 14 * 28 * resourceIds.length;
    const horasReservadas = reservasCuatroSemanas.length; // Cada reserva = 1 hora aprox
    const tasaOcupacion = horasDisponibles > 0 
        ? Math.round((horasReservadas / horasDisponibles) * 100) 
        : 0;

    return {
        totalReservas,
        reservasUltimaSemana,
        reservasUltimoMes,
        tasaOcupacion,
        reservasPorDia,
        topRecursos,
        reservasPorSemana,
        horasPopulares,
        tiposReserva: {
            individuales: reservasIndividuales,
            grupales: reservasGrupales
        }
    };
}

module.exports = { getMySites, createSite, editSite, deleteSite, getSiteById, getResourceCategories, getSiteStats, getSiteByIdForFileCleanup };