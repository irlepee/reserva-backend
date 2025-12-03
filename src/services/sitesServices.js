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
    console.log('Service: Creating site with data:', { 
        name: siteData.name, 
        description: siteData.description,
        imagesCount: siteData.images?.length || 0,
        images: siteData.images
    });

    const newSite = await prisma.Site.create({
        data: {
            id_owner: BigInt(userId),
            name: siteData.name,
            description: siteData.description,
            id_entidad: siteData.id_entidad ? parseInt(siteData.id_entidad) : null,
            id_municipio: siteData.id_municipio ? parseInt(siteData.id_municipio) : null,
            id_localidad: siteData.id_localidad ? parseInt(siteData.id_localidad) : null,
            images: siteData.images || []  // Añadir imágenes si existen
        },
    });

    console.log('Service: Site created with ID:', newSite.id);

    const safeSite = {
        ...newSite,
        id_owner: Number(newSite.id_owner)
    };

    return safeSite;
}

async function editSite(siteId, siteData, userId) {

    await isOwner(siteId, userId);

    console.log('Service: Editing site:', siteId, 'with data:', {
        name: siteData.name,
        description: siteData.description,
        imagesCount: siteData.images?.length || 0
    });

    const updateData = {
        name: siteData.name,
        description: siteData.description,
        id_entidad: siteData.id_entidad ? parseInt(siteData.id_entidad) : null,
        id_municipio: siteData.id_municipio ? parseInt(siteData.id_municipio) : null,
        id_localidad: siteData.id_localidad ? parseInt(siteData.id_localidad) : null,
    };

    // Si hay imágenes nuevas, reemplazar. Si no, mantener las existentes
    if (siteData.images && siteData.images.length > 0) {
        updateData.images = siteData.images;
        console.log('Service: Updating images:', updateData.images);
    } else {
        console.log('Service: No new images, keeping existing ones');
    }

    const updatedSite = await prisma.Site.update({
        where: { id: siteId },
        data: updateData,
    });

    console.log('Service: Site updated successfully');

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

    return {
        ...site,
        id_owner: Number(site.id_owner)
    };
}

async function getResourceCategories() {
    const categories = await prisma.ResourceType.findMany();
    return categories;
}

module.exports = { getMySites, createSite, editSite, deleteSite, getSiteById, getResourceCategories };