const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllResources(siteId) {
    const resources = await prisma.Resource.findMany({
        where: { id_site: siteId }
    })

    return resources;
}

async function createResource(siteId, siteData, userId) {
    const siteOwner = await prisma.site.findFirst({
        where: { id : siteId, id_owner : BigInt(userId) }
    });

    if (!siteOwner) {
        throw new Error("Site not found")
    }

    const newResource = await prisma.Resource.create({
        data: {
            id_site: siteId,
            name: siteData.name,
            resource_type: siteData.resource_type,
            capacity: siteData.capacity,
            status: "Available",
        }
    })

    return newResource;
}

//HAY QUE EXTRAER LA INFO DE RESOURCE DATA CORRECTAMENTE, MÁS QUE NADA EL ID DEL RECURSO Y USAR ESO
async function editResource(siteId, resourceId, resourceData, userId) {
    
    const siteOwner = await prisma.Site.findFirst({
        where : { id : siteId, id_owner : BigInt(userId) }
    })

    if (!siteOwner) {
        throw new Error("Site not found");
    }

    const resourceOwner = await prisma.Resource.findFirst({
        where : { id : resourceId, id_site : siteId }
    })

    if (!resourceOwner) {
        throw new Error("Resource not found")
    }

    const resourceUpdated = prisma.Resource.update({
        where : { id : resourceId },
        data : {
            name : resourceData.name,
            color : resourceData.color
        }
    })

    return resourceUpdated;

}

async function deleteResource(siteId, resourceId, userId) {
    
    const siteOwner = await prisma.Site.findFirst({
        where : { id : siteId, id_owner : BigInt(userId) }
    })

    if (!siteOwner) {
        throw new Error("Site not found");
    }

    const resourceOwner = await prisma.Resource.findFirst({
        where : { id : resourceId, id_site : siteId }
    })

    if (!resourceOwner) {
        throw new Error("Resource not found")
    }

    const resource = await prisma.Resource.delete({
        where : { id : resourceId }
    })

    return { message : 'Resource deleted successfully'}
}

module.exports = { getAllResources, createResource, editResource, deleteResource }