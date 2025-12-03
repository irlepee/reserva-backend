const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllResources(siteId) {
    const resources = await prisma.Resource.findMany({
        where: { id_site: siteId }
    })

    return resources;
}

async function createResource(siteId, siteData, userId) {
    const siteOwner = await prisma.Site.findFirst({
        where: { id : siteId, id_owner : BigInt(userId) }
    });

    if (!siteOwner) {
        throw new Error("Site not found")
    }

    if (!siteData.resource_type) {
        throw new Error("resource_type is required");
    }

    const newResource = await prisma.Resource.create({
        data: {
            id_site: siteId,
            name: siteData.name,
            resource_type: parseInt(siteData.resource_type),
            capacity: siteData.capacity ? parseInt(siteData.capacity) : null,
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

    const updateData = {
        name: resourceData.name,
    };

    if (resourceData.capacity !== undefined) {
        updateData.capacity = resourceData.capacity ? parseInt(resourceData.capacity) : null;
    }

    if (resourceData.resource_type !== undefined) {
        updateData.resource_type = parseInt(resourceData.resource_type);
    }

    if (resourceData.status !== undefined) {
        updateData.status = resourceData.status;
    }

    const resourceUpdated = await prisma.Resource.update({
        where : { id : resourceId },
        data : updateData
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

async function getResourceCategories() {
    const categories = await prisma.ResourceType.findMany();
    return categories;
}

module.exports = { getAllResources, createResource, editResource, deleteResource, getResourceCategories }