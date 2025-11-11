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
            color: groupData.color || 0
        }
    });

    const safeGroup = {
        ...newGroup,
        id_owner: Number(newGroup.id_owner)
    }
    return safeGroup;
}

async function editGroup(groupId, groupData, userId) {

    await isOwnedByUser(groupId, userId);

    const updatedGroup = await prisma.Group.update({
        where: { id: groupId },
        data: {
            name: groupData.name,
            color: groupData.color
        }
    });

    //Trabajar el BigInt
    const safeGroup = {
        ...updatedGroup,
        id_owner: Number(updatedGroup.id_owner)
    }

    return safeGroup;
}

async function deleteGroup(groupId, userId) {

    console.log("1");

    await isOwnedByUser(groupId, userId);

    await prisma.Group.delete({
        where: { id: groupId }
    });

    console.log("2");

    return { message: 'Group deleted successfully' };
}

async function isOwnedByUser(groupId, userId) {
    const group = await prisma.Group.findFirst({
        where: {
            id: groupId, id_owner: BigInt(userId)
        }
    });

    if (!group) {
        throw new Error('Group not found');
    }
}

module.exports = { getMyGroups, createGroup, editGroup, deleteGroup }