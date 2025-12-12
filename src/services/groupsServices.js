const { PrismaClient } = require('@prisma/client');
const { success } = require('zod');
const { id } = require('zod/locales');
const notificationsService = require('./notificationsService');
const prisma = new PrismaClient();

async function getMyGroups(userId) {
    const numUserId = BigInt(userId);

    // Obtener grupos que el usuario posee
    const ownedGroups = await prisma.Group.findMany({
        where: {
            id_owner: numUserId
        }
    });

    // Obtener grupos en los que el usuario es miembro
    const memberGroups = await prisma.UserGroup.findMany({
        where: {
            id_user: numUserId
        },
        select: { id_group: true }
    });

    // Obtener detalles de los grupos en los que es miembro
    const memberGroupIds = memberGroups.map(mg => mg.id_group);
    const groupsAsMember = memberGroupIds.length > 0
        ? await prisma.Group.findMany({
            where: {
                id: { in: memberGroupIds }
            }
        })
        : [];

    // Combinar y evitar duplicados
    const allGroupsMap = new Map();

    // Añadir grupos propios
    ownedGroups.forEach(group => {
        allGroupsMap.set(group.id, {
            ...group,
            id_owner: Number(group.id_owner),
            role: 'owner'
        });
    });

    // Añadir grupos donde es miembro (no sobrescribir propios)
    groupsAsMember.forEach(group => {
        if (!allGroupsMap.has(group.id)) {
            allGroupsMap.set(group.id, {
                ...group,
                id_owner: Number(group.id_owner),
                role: 'member'
            });
        }
    });

    const allGroups = Array.from(allGroupsMap.values());

    return allGroups;
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

    // Eliminar todas las invitaciones del grupo
    await prisma.Invitation.deleteMany({
        where: { id_group: groupId }
    });

    // Eliminar todos los miembros del grupo
    await prisma.UserGroup.deleteMany({
        where: { id_group: groupId }
    });

    // Finalmente eliminar el grupo
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
        }
    });

    return Number(user.id) || null;
}

async function getGroupInfoById(groupId) {

    const group = await prisma.Group.findUnique({
        where: { id: groupId },
    });

    const safeGroup = { ...group, id_owner: Number(group.id_owner) };

    return safeGroup;
}

async function getGroupAdminById(groupId) {

    const group = await prisma.Group.findUnique({
        where: { id: groupId },
        select: { id_owner: true }
    });

    const admin = await prisma.User.findUnique({
        where: { id: group.id_owner },
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
            lastname: true
        }
    });

    const safeAdmin = {
        ...admin,
        id: Number(admin.id)
    }

    return safeAdmin;
}

async function getAllGroupMembers(groupId) {

    const members = await prisma.UserGroup.findMany({
        where: { id_group: groupId },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                    name: true
                }
            }
        }
    });

    const safeMembers = members.map(member => ({
        id_user: Number(member.id_user),
        user: {
            id: Number(member.user.id),
            username: member.user.username,
            lastname: member.user.lastname,
            email: member.user.email,
            name: member.user.name
        }
    }));

    return safeMembers;
}


// INVITE AND MEMBER MANAGEMENT FUNCTIONS

async function getUserGroupInvitations(userId) {
    const invitations = await prisma.Invitation.findMany({
        where: { id_user: BigInt(userId) },
    });

    if (invitations.length === 0) {
        return [];
    }

    const groups = await prisma.Group.findMany({
        where: {
            id: { in: invitations.map(invite => invite.id_group) }
        }
    });

    const safeGroups = groups.map(group => ({
        ...group,
        id_owner: Number(group.id_owner)
    }));

    return safeGroups;
}

async function inviteMembersToGroup(groupId, users, userId) {

    await isOwnedByUser(groupId, userId);

    // Obtener info del grupo
    const group = await prisma.Group.findUnique({ where: { id: groupId } });

    // Convertir a array si es necesario
    const usersList = Array.isArray(users) ? users : [users];

    try {
        // Intentar insertar con skipDuplicates para ignorar ya invitados
        const invitations = await prisma.Invitation.createMany({
            data: usersList.map(invitedUserId => ({
                id_user: invitedUserId,
                id_group: groupId
            })),
            skipDuplicates: true  // Ignora registros que violarían unique constraint
        });

        // Emitir notificaciones a los usuarios invitados
        for (const invitedUserId of usersList) {
            await notificationsService.createNotification(
                invitedUserId,
                'invitation_received',
                `Invitación al grupo: ${group.name}`,
                `Fuiste invitado a unirte al grupo "${group.name}"`,
                { groupId, groupName: group.name }
            );
        }

        return {
            success: true,
            message: 'Invitations sent successfully',
            count: invitations.count
        };
    } catch (error) {
        throw error;
    }
}

async function acceptInvitationToGroup(data, userId) {

    // Invitación existe
    const invitation = await prisma.Invitation.findFirst({
        where: {
            id_user: userId,
            id_group: data.groupId
        },
        include: { group: true }
    });

    if (!invitation) {
        throw new Error('Invitation not found');
    }

    // Agregar a UserGroup
    await prisma.UserGroup.create({
        data: {
            id_user: userId,
            id_group: data.groupId
        }
    });

    // Eliminar invitación
    await prisma.Invitation.delete({
        where: {
            id_user_id_group: {
                id_user: invitation.id_user,
                id_group: invitation.id_group
            }
        }
    });

    // Notificar al propietario que la invitación fue aceptada
    const groupOwner = invitation.group.id_owner;
    await notificationsService.createNotification(
        Number(groupOwner),
        'invitation_accepted',
        `Invitación aceptada: ${invitation.group.name}`,
        `Un usuario aceptó la invitación al grupo "${invitation.group.name}"`,
        { groupId: data.groupId, groupName: invitation.group.name }
    );

    return { success: true, message: 'Invitation accepted and member added to group' };
}

async function declineInvitationToGroup(data, userId) {

    const invitation = await prisma.Invitation.findFirst({
        where: {
            id_user: userId,
            id_group: data.id_group
        },
        include: { group: true }
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

    // Notificar al propietario que la invitación fue rechazada
    const groupOwner = invitation.group.id_owner;
    await notificationsService.createNotification(
        Number(groupOwner),
        'invitation_rejected',
        `Invitación rechazada: ${invitation.group.name}`,
        `Un usuario rechazó la invitación al grupo "${invitation.group.name}"`,
        { groupId: data.id_group, groupName: invitation.group.name }
    );

    return { success: true, message: 'Invitation declined successfully' };

}

async function removeMemberFromGroup(groupId, memberId, userId) {

    await isOwnedByUser(groupId, userId);

    const group = await prisma.Group.findUnique({ where: { id: groupId } });

    await prisma.UserGroup.delete({
        where: {
            id_user_id_group: {
                id_user: memberId,
                id_group: groupId
            }
        }
    });

    // Notificar al miembro que fue removido
    await notificationsService.createNotification(
        memberId,
        'group_member_removed',
        `Removido del grupo: ${group.name}`,
        `Fuiste removido del grupo "${group.name}"`,
        { groupId, groupName: group.name }
    );

    return { success: true, message: 'Member removed successfully' };

}

module.exports = { getMyGroups, createGroup, editGroup, deleteGroupById, getGroupInfoById, checkUserExistsByIdentifier, getAllGroupMembers, inviteMembersToGroup, removeMemberFromGroup, getUserGroupInvitations, acceptInvitationToGroup, declineInvitationToGroup, getGroupAdminById };