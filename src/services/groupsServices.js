const { PrismaClient } = require('@prisma/client');
const { success } = require('zod');
const { id } = require('zod/locales');
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
            color: groupData.color || 0,
            description: groupData.description || ''
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
            color: groupData.color,
            description: groupData.description
        }
    });

    //Trabajar el BigInt
    const safeGroup = {
        ...updatedGroup,
        id_owner: Number(updatedGroup.id_owner)
    }

    return safeGroup;
}

async function deleteGroupById(groupId, userId) {

    await isOwnedByUser(groupId, userId);

    await prisma.Group.delete({
        where: { id: groupId }
    });

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

async function checkUserExistsByIdentifier(identifier) {
    const user = await prisma.User.findFirst({
        where: {
            OR: [{ username: identifier },
            { email: identifier }]
        },
    });

    return user !== null;
}

async function getGroupInfoById(groupId, userId) {

    await isOwnedByUser(groupId, userId);

    const group = await prisma.Group.findUnique({
        where: { id: groupId },
    });

    const safeGroup = { ...group, id_owner: Number(group.id_owner) };

    return safeGroup;
}

async function getAllGroupMembers(groupId, userId) {

    await isOwnedByUser(groupId, userId);

    const members = await prisma.UserGroup.findMany({
        where: { id_group: groupId },
        select: { id_user: true }
    });

    console.log("Fetched members:", members);

    const safeMembers = members.map(member => ({
        id_user: Number(member.id_user)
    }));

    return safeMembers;
}


// INVITE AND MEMBER MANAGEMENT FUNCTIONS

async function getUserGroupInvitations(userId) {
    console.log("Fetching invitations for userId:", userId);
    const invitations = await prisma.Invitation.findMany({
        where: { id_user: BigInt(userId) },
    });

    safeInvitations = invitations.map(invitation => ({
        ...invitation,
        id_user: Number(invitation.id_user),
    }));
    return safeInvitations;
}

async function inviteMembersToGroup(groupId, users, userId) {

    await isOwnedByUser(groupId, userId);

    // Convertir a array si es necesario
    const usersList = Array.isArray(users) ? users : [users];

    try {
        // Intentar insertar con skipDuplicates para ignorar ya invitados
        const invitations = await prisma.Invitation.createMany({
            data: usersList.map(userId => ({
                id_user: userId,
                id_group: groupId
            })),
            skipDuplicates: true  // Ignora registros que violarían unique constraint
        });

        return {
            success: true, 
            message: 'Invitations sent successfully', 
            count: invitations.count
        };
    } catch (error) {
        console.error("Error creating invitations:", error);
        throw error;
    }
}

async function acceptInvitationToGroup(data, userId) {

    console.log("Service: Accepting invitation with data:", data, "for userId:", userId);

    // Invitación existe
    const invitation = await prisma.Invitation.findFirst({
        where: {
            id_user: userId,
            id_group: data.id_group
        }
    });

    if (!invitation) {
        throw new Error('Invitation not found');
    }

    // Agregar a UserGroup
    await prisma.UserGroup.create({
        data: {
            id_user: userId,
            id_group: data.id_group
        }
    });

    console.log("Service: User added to group:", data.id_group);

    // Eliminar invitación
    await prisma.Invitation.delete({
        where: {
            id_user_id_group: {
                id_user: invitation.id_user,
                id_group: invitation.id_group
            }
        }
    });

    return { success: true, message: 'Invitation accepted and member added to group' };
}

async function declineInvitationToGroup(data, userId) {

    const invitation = await prisma.Invitation.findFirst({
        where: {
            id_user: userId,
            id_group: data.id_group
        }
    });

    if (!invitation) {
        throw new Error('Invitation not found');
    }

    await prisma.Invitation.delete({
        where: {
            id_user_id_group: {
                id_user: invitation.id_user,
                id_group: invitation.id_group
            }
        }
    });

    return { success: true, message: 'Invitation declined successfully' };

}

async function removeMemberFromGroup(groupId, memberId, userId) {

    await isOwnedByUser(groupId, userId);

    await prisma.UserGroup.delete({
        where: {
            id_user_id_group: {
                id_user: memberId,
                id_group: groupId
            }
        }
    });

    return { success: true, message: 'Member removed successfully' };

}

module.exports = { getMyGroups, createGroup, editGroup, deleteGroupById, getGroupInfoById, checkUserExistsByIdentifier, getAllGroupMembers, inviteMembersToGroup, removeMemberFromGroup, getUserGroupInvitations, acceptInvitationToGroup, declineInvitationToGroup };