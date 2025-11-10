const groupService = require('../services/groupsServices');

async function getGroups(req, res) {
    try {
        const groups = await groupService.getMyGroups(req.user.userId);
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function create(req, res) {
    try {
        const groupData = req.body;
        const newGroup = await groupService.createGroup(groupData, req.user.userId);
        res.status(201).json(newGroup);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getGroups, create }