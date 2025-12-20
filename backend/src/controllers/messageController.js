const { Message, MessageGroup } = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');
const { getIo, onlineUsers } = require('../socket');
const { getPaginationParams } = require('../utils/helpers');

const messageController = {
  // Send message (refactored to use chat logic)
  async sendMessage(req, res) {
    try {
      const { content, receiverId } = req.body;
      const senderId = req.user._id;

      if (!receiverId) {
        return res.status(400).json({ success: false, message: 'Receiver required' });
      }

      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return res.status(404).json({ success: false, message: 'Receiver not found' });
      }

      const newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
        messageType: 'text',
        collegeCode: req.user.collegeCode
      });

      await newMessage.save();
      await newMessage.populate({ path: 'sender', select: 'firstName lastName profile' });

      // Emit to receiver if online
      const { getReceiverSocketId, getIo } = require('../socket');
      const receiverSocketId = getReceiverSocketId(receiverId.toString());
      console.log('Receiver Socket ID:', receiverSocketId, 'Receiver ID:', receiverId);
      if (receiverSocketId) {
        getIo().to(receiverSocketId).emit('newMessage', newMessage);
        console.log('Emitted newMessage to receiver:', receiverId);
      } else {
        console.log('Receiver not online, could not emit newMessage');
      }

      // Optionally emit to sender for instant UI update
      const senderSocketId = getReceiverSocketId(senderId.toString());
      console.log('Sender Socket ID:', senderSocketId, 'Sender ID:', senderId);
      if (senderSocketId) {
        getIo().to(senderSocketId).emit('newMessage', newMessage);
        console.log('Emitted newMessage to sender:', senderId);
      }

      return res.status(201).json(newMessage);
        } catch (error) {
          console.error('Error sending message:', error);
          return res.status(500).json({ success: false, message: 'Failed to send message' });
        }
      },
  // Get conversations
  async getConversations(req, res) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user._id);

      // Find all conversations the user is a part of
      const conversations = await Message.aggregate([
        // Find all messages sent or received by the user
        { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
        // Sort by date to easily find the last message
        { $sort: { createdAt: -1 } },
        // Group by conversation partner
        {
          $group: {
            _id: { $cond: [{ $eq: ['$sender', userId] }, '$receiver', '$sender'] },
            lastMessage: { $first: '$$ROOT' }
          }
        },
        // Populate the other user's details
        {
          $lookup: {
            from: 'users',
            let: { otherUserId: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$otherUserId'] } } },
              { $project: { firstName: 1, lastName: 1, 'profile.profileImage': 1, role: 1 } }
            ],
            as: 'user'
          }
        },
        { $unwind: '$user' },
        // Format the output
        {
          $project: {
            _id: 1,
            user: 1,
            lastMessage: 1,
            updatedAt: '$lastMessage.createdAt'
          }
        },
        // Sort conversations by the most recent message
        { $sort: { updatedAt: -1 } }
      ]);

      // Get groups
      const groups = await MessageGroup.find({
        members: req.user._id,
        isActive: true
      }).select('name description avatar members');

      res.json({
        success: true,
        conversations: conversations.map(c => ({
          _id: c.user._id,
          firstName: c.user.firstName,
          lastName: c.user.lastName,
          profileImage: c.user.profile?.profileImage,
          role: c.user.role,
          lastMessage: c.lastMessage,
          updatedAt: c.updatedAt,
          // unreadCount can be added here with another pipeline stage if needed
          // For simplicity and performance, we can handle this on the client or a separate query
          unreadCount: 0 
        })),
        groups
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
    }
  },

  // Get messages with user
  async getMessages(req, res) {
    try {
      const { userId } = req.params;
      const { page, limit } = req.query;
      const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);

      const messages = await Message.find({
        $or: [
          { sender: req.user._id, receiver: userId },
          { sender: userId, receiver: req.user._id }
        ],
        deletedFor: { $ne: req.user._id }
      })
      .populate('sender', 'firstName lastName profile')
      .populate('receiver', 'firstName lastName profile')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

      // Mark messages as read
      await Message.updateMany(
        {
          sender: userId,
          receiver: req.user._id,
          status: { $ne: 'read' }
        },
        {
          $set: { status: 'read' },
          $push: {
            readBy: {
              user: req.user._id,
              readAt: new Date()
            }
          }
        }
      );

      const total = await Message.countDocuments({
        $or: [
          { sender: req.user._id, receiver: userId },
          { sender: userId, receiver: req.user._id }
        ],
        deletedFor: { $ne: req.user._id }
      });

      res.json({
        success: true,
        messages: messages.reverse(),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
  },

  // Get group messages
  async getGroupMessages(req, res) {
    try {
      const { groupId } = req.params;
      const { page, limit } = req.query;
      const { skip, limit: limitNum, page: pageNum } = getPaginationParams(page, limit);

      // Check if user is member of group
      const group = await MessageGroup.findById(groupId);
      if (!group || !group.members.includes(req.user._id)) {
        return res.status(403).json({ success: false, message: 'Not a member of this group' });
      }

      const messages = await Message.find({
        group: groupId,
        deletedFor: { $ne: req.user._id }
      })
      .populate('sender', 'firstName lastName profile.profileImage')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

      // Mark messages as read
      await Message.updateMany(
        {
          group: groupId,
          sender: { $ne: req.user._id },
          'readBy.user': { $ne: req.user._id }
        },
        {
          $push: {
            readBy: {
              user: req.user._id,
              readAt: new Date()
            }
          }
        }
      );

      const total = await Message.countDocuments({
        group: groupId,
        deletedFor: { $ne: req.user._id }
      });

      res.json({
        success: true,
        messages: messages.reverse(),
        group,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to fetch group messages' });
    }
  },

  // Mark message as read
  async markAsRead(req, res) {
    try {
      const message = await Message.findOne({
        _id: req.params.messageId,
        receiver: req.user._id
      });

      if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }

      message.status = 'read';
      if (!message.readBy.find(r => r.user.toString() === req.user._id.toString())) {
        message.readBy.push({
          user: req.user._id,
          readAt: new Date()
        });
      }

      await message.save();

      // Emit socket event to sender for read receipt
      const { getReceiverSocketId, getIo } = require('../socket');
      const senderSocketId = getReceiverSocketId(message.sender.toString());
      if (senderSocketId) {
        getIo().to(senderSocketId).emit('messageRead', {
          messageId: message._id,
          readerId: req.user._id,
          readAt: new Date()
        });
      }

      res.json({
        success: true,
        message: 'Message marked as read'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to mark as read' });
    }
  },

  // Delete message
  async deleteMessage(req, res) {
    try {
      const message = await Message.findById(req.params.messageId);

      if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }

      // Check if user is sender or receiver
      if (message.sender.toString() !== req.user._id.toString() && 
          message.receiver?.toString() !== req.user._id.toString() &&
          !message.group) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      // Soft delete for user
      message.deletedFor.push(req.user._id);
      await message.save();

      res.json({
        success: true,
        message: 'Message deleted'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to delete message' });
    }
  },

  // Create group
  async createGroup(req, res) {
    try {
      const { name, description, members, groupType } = req.body;

      // Validate members
      const validMembers = await User.find({
        _id: { $in: members },
        collegeCode: req.user.collegeCode,
        approvalStatus: 'approved'
      });

      if (validMembers.length !== members.length) {
        return res.status(400).json({ success: false, message: 'Some members are invalid' });
      }

      const group = new MessageGroup({
        name,
        description,
        members: [...members, req.user._id],
        admins: [req.user._id],
        collegeCode: req.user.collegeCode,
        college: req.user.college._id,
        groupType
      });

      if (req.file) {
        group.avatar = fileService.getFileUrl(req.file.filename, 'groups/');
      }

      await group.save();
      await group.populate('members', 'firstName lastName');

      res.status(201).json({
        success: true,
        message: 'Group created successfully',
        group
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to create group' });
    }
  },

  // Update group
  async updateGroup(req, res) {
    try {
      const group = await MessageGroup.findOne({
        _id: req.params.groupId,
        admins: req.user._id
      });

      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found or unauthorized' });
      }

      const { name, description } = req.body;
      if (name) group.name = name;
      if (description) group.description = description;

      if (req.file) {
        // Delete old avatar
        if (group.avatar) {
          const oldFilename = group.avatar.split('/').pop();
          await fileService.deleteFile(`uploads/groups/${oldFilename}`);
        }
        group.avatar = fileService.getFileUrl(req.file.filename, 'groups/');
      }

      await group.save();

      res.json({
        success: true,
        message: 'Group updated successfully',
        group
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to update group' });
    }
  },

  // Update group members
  async updateGroupMembers(req, res) {
    try {
      const { members, action } = req.body;
      const group = await MessageGroup.findOne({
        _id: req.params.groupId,
        admins: req.user._id
      });

      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found or unauthorized' });
      }

      if (action === 'add') {
        // Validate new members
        const validMembers = await User.find({
          _id: { $in: members },
          collegeCode: req.user.collegeCode,
          approvalStatus: 'approved'
        });

        if (validMembers.length !== members.length) {
          return res.status(400).json({ success: false, message: 'Some members are invalid' });
        }

        // Add members
        const newMembers = members.filter(m => !group.members.includes(m));
        group.members.push(...newMembers);
      } else if (action === 'remove') {
        // Remove members
        group.members = group.members.filter(m => !members.includes(m.toString()));
        // Remove from admins if they were admins
        group.admins = group.admins.filter(a => !members.includes(a.toString()));
      }

      await group.save();
      await group.populate('members', 'firstName lastName');

      res.json({
        success: true,
        message: `Members ${action === 'add' ? 'added' : 'removed'} successfully`,
        group
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to update members' });
    }
  },

  // Leave group
  async leaveGroup(req, res) {
    try {
      const group = await MessageGroup.findOne({
        _id: req.params.groupId,
        members: req.user._id
      });

      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }

      // Remove from members
      group.members = group.members.filter(m => m.toString() !== req.user._id.toString());
      
      // Remove from admins if admin
      group.admins = group.admins.filter(a => a.toString() !== req.user._id.toString());

      // If no admins left, make the first member admin
      if (group.admins.length === 0 && group.members.length > 0) {
        group.admins.push(group.members[0]);
      }

      // Delete group if no members left
      if (group.members.length === 0) {
        await MessageGroup.findByIdAndDelete(group._id);
        return res.json({
          success: true,
          message: 'Group deleted as no members left'
        });
      }

      await group.save();

      res.json({
        success: true,
        message: 'Left group successfully'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to leave group' });
    }
  }
};

module.exports = messageController;