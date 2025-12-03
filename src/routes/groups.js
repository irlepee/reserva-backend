const express = require('express');
const router = express.Router();
const groupsController = require('../controllers/groupsController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/exists', authMiddleware.jwtauthenticator, groupsController.checkUserExists);
router.get('/invitations', authMiddleware.jwtauthenticator, groupsController.getInvitations)

router.post('/:groupId/invite', authMiddleware.jwtauthenticator, groupsController.inviteMember);
router.post('/:groupId/remove', authMiddleware.jwtauthenticator, groupsController.removeMember);
router.post('/accept', authMiddleware.jwtauthenticator, groupsController.acceptInvitation);
router.post('/reject', authMiddleware.jwtauthenticator, groupsController.declineInvitation);

// ----------------------------------------------------------------------------------------------------

router.get('/', authMiddleware.jwtauthenticator, groupsController.getGroups);

router.post('/', authMiddleware.jwtauthenticator, groupsController.create);

router.get('/:groupId', authMiddleware.jwtauthenticator, groupsController.getGroupInfo);
router.put('/:groupId', authMiddleware.jwtauthenticator, groupsController.edit);
router.delete('/:groupId', authMiddleware.jwtauthenticator, groupsController.deleteGroup);
router.get('/:groupId/members', authMiddleware.jwtauthenticator, groupsController.getGroupMembers);
router.get('/:groupId/admin', authMiddleware.jwtauthenticator, groupsController.getGroupAdmin);

module.exports = router;