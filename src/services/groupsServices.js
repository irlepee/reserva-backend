const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getMyGroups(userId) {
    const groups = await prisma.Group.findMany({
        where: {
            id_owner: BigInt(userId)
        }
    });

    return groups.map(group => ({
        ...group,
        id_owner: Number(group.id_owner)
    }));
}

async function createGroup(groupData, userId) {
    const newGroup = await prisma.Group.create({
        data: {
            id_owner: BigInt(userId),
            name: groupData.name,
        }
    });

    const safeGroup = {
        ...newGroup,
        id_owner: Number(newGroup.id_owner)
    }
    return safeGroup;
}

module.exports = { getMyGroups, createGroup }