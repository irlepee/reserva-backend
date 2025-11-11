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
            id_entidad: siteData.id_entidad,
            id_municipio: siteData.id_municipio,
            id_localidad: siteData.id_localidad,
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

    const updatedSite = await prisma.Site.update({
        where: { id: siteId },
        data: {
            name: siteData.name,
            description: siteData.description,
            id_entidad: siteData.id_entidad,
            id_municipio: siteData.id_municipio,
            id_localidad: siteData.id_localidad,
        },
    });

    const safeSite = {
        ...updatedSite,
        id_owner: Number(updatedSite.id_owner)
    };

    return safeSite;
}

async function deleteSite(siteId, userId) {

    await isOwner(siteId, userId);

    await prisma.Site.delete({
        where: { id: siteId },
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

module.exports = { getMySites, createSite, editSite, deleteSite };