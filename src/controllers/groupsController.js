//const { ca } = require('zod/locales');
const groupService = require('../services/groupsServices');

async function getGroups(req, res) {
    try {
        const groups = await groupService.getMyGroups(req.user.userId);
        res.status(200).json(groups);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message || "Ocurrio un error inesperado" });
    }
}

async function create(req, res) {
    try {
        const groupData = req.body;
        const newGroup = await groupService.createGroup(groupData, req.user.userId);
        res.status(201).json(newGroup);
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message || "Ocurrio un error inesperado" });
    }
}

async function edit(req, res) {
    try {
        const groupId = parseInt(req.params.groupId);
        const groupData = req.body;
        const updatedGroup = await groupService.editGroup(groupId, groupData, req.user.userId);
        res.status(200).json(updatedGroup);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message || "Ocurrio un error inesperado" });
    }
}

async function deleteGroup(req, res) {
    try {
        const groupId = parseInt(req.params.groupId);
        const result = await groupService.deleteGroupById(groupId, req.user.userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message || "Ocurrio un error inesperado" });
    }
}

async function checkUserExists(req, res) {
    try {
        const { identifier } = req.body;
        const exists = await groupService.checkUserExistsByIdentifier(identifier);
        res.status(200).json({ exists });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message || "Ocurrio un error inesperado" });
    }
}

async function getGroupInfo(req, res) {
    try {
        const groupId = parseInt(req.params.groupId);
        const group = await groupService.getGroupInfoById(groupId, req.user.userId);
        res.status(200).json(group);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message || "Ocurrio un error inesperado" });
    }
}

async function getGroupMembers(req, res) {
    try {
        const groupId = parseInt(req.params.groupId);
        const members = await groupService.getAllGroupMembers(groupId, req.user.userId);
        res.status(200).json(members);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message || "Ocurrio un error inesperado" });
    }
}


// INVITATIONS AND MEMBERS HANDLERS

async function getInvitations(req, res) {
    try {
        console.log("Controller: Getting invitations for userId:", req.user.userId);
        const invitations = await groupService.getUserGroupInvitations(req.user.userId);
        res.status(200).json(invitations);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message || "Ocurrio un error inesperado" });
    }
}

async function inviteMember(req, res) {
    try {
        const { users } = req.body;
        const result = await groupService.inviteMembersToGroup(parseInt(req.params.groupId), users, req.user.userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message || "Ocurrio un error inesperado" });
    }

}

async function acceptInvitation(req, res) {
    try {
        const data = req.body;
        const result = await groupService.acceptInvitationToGroup(data, req.user.userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message || "Ocurrio un error inesperado" });
    }
}

async function declineInvitation(req, res) {
    try {
        const data = req.body;
        const result = await groupService.declineInvitationToGroup(data, req.user.userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message || "Ocurrio un error inesperado" });
    }
}

async function removeMember(req, res) {
    try {
        const { userId } = req.body;
        const result = await groupService.removeMemberFromGroup(parseInt(req.params.groupId), userId, req.user.userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message || "Ocurrio un error inesperado" });
    }
}



module.exports = { getGroups, create, edit, deleteGroup, checkUserExists, getGroupInfo, getGroupMembers, getInvitations, inviteMember, removeMember, acceptInvitation, declineInvitation };