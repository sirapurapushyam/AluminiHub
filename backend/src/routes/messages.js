const express = require('express');
const { body } = require('express-validator');
const messageController = require('../controllers/messageController');
const { authenticateToken, requireApproval } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { uploadSingle, uploadMultiple } = require('../middleware/upload'); // Modified import

const router = express.Router();

// Send message
router.post('/send',
  authenticateToken,
  requireApproval,
  uploadMultiple('attachments', 5),
  [
    body('content').notEmpty().isLength({ max: 1000 }),
    body('receiverId').optional().isMongoId(),
    body('groupId').optional().isMongoId()
  ],
  validate,
  messageController.sendMessage
);

// Get conversations
router.get('/conversations',
  authenticateToken,
  requireApproval,
  messageController.getConversations
);

// Get messages with user
router.get('/user/:userId',
  authenticateToken,
  requireApproval,
  messageController.getMessages
);

// Get group messages
router.get('/group/:groupId',
  authenticateToken,
  requireApproval,
  messageController.getGroupMessages
);

// Mark message as read
router.put('/:messageId/read',
  authenticateToken,
  requireApproval,
  messageController.markAsRead
);

// Delete message
router.delete('/:messageId',
  authenticateToken,
  requireApproval,
  messageController.deleteMessage
);

// Create group
router.post('/groups',
  authenticateToken,
  requireApproval,
  uploadSingle('avatar'),
  [
    body('name').notEmpty().trim().isLength({ max: 100 }),
    body('description').optional().isLength({ max: 500 }),
    body('members').isArray(),
    body('groupType').isIn(['batch', 'department', 'interest', 'official', 'other'])
  ],
  validate,
  messageController.createGroup
);

// Update group
router.put('/groups/:groupId',
  authenticateToken,
  requireApproval,
  uploadSingle('avatar'),
  messageController.updateGroup
);

// Add/remove group members
router.post('/groups/:groupId/members',
  authenticateToken,
  requireApproval,
  [
    body('members').isArray(),
    body('action').isIn(['add', 'remove'])
  ],
  validate,
  messageController.updateGroupMembers
);

// Leave group
router.post('/groups/:groupId/leave',
  authenticateToken,
  requireApproval,
  messageController.leaveGroup
);

module.exports = router;
