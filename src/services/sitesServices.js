const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSite(siteData) {
    const newSite = await prisma.Site.create({
        data: {
            id_owner: siteData.id_owner,
            name: siteData.name,
            description: siteData.description,
            date_created: new Date(),
            id_estado: siteData.id_estado,
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

module.exports = { createSite };