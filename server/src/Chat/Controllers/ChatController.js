import asyncHandler from 'express-async-handler';
import { sendMessage, getConversation } from '../Services/ChatService.js';

export const sendNewMessage = asyncHandler(async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.user.id;

  if (!receiverId || !content) {
    res.status(400);
    throw new Error('Receiver ID and content are required');
  }

  const message = await sendMessage(senderId, receiverId, content);
  res.status(201).json({ success: true, data: message });
});

export const getMessagesWithUser = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const partnerId = req.params.partnerId;

  const messages = await getConversation(currentUserId, partnerId);
  res.status(200).json({ success: true, data: messages });
});

import Message from '../Models/Message.js';
import User from '../../Auth/Models/User.js';
import { Op } from 'sequelize';

export const getInbox = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;

  // Find all messages where the user is sender or receiver
  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { senderId: currentUserId },
        { receiverId: currentUserId }
      ]
    },
    include: [
      { model: User, as: 'sender', attributes: ['id', 'fullName'] },
      { model: User, as: 'receiver', attributes: ['id', 'fullName'] }
    ],
    order: [['createdAt', 'DESC']]
  });

  // Group by partnerId
  const inboxMap = new Map();
  messages.forEach(msg => {
    const isSender = msg.senderId === currentUserId;
    const partnerId = isSender ? msg.receiverId : msg.senderId;
    const partner = isSender ? msg.receiver : msg.sender;

    if (!inboxMap.has(partnerId)) {
      inboxMap.set(partnerId, {
        partnerId,
        partnerName: partner.fullName,
        lastMessage: msg.content,
        lastMessageTime: msg.createdAt,
        unreadCount: (!isSender && !msg.read) ? 1 : 0
      });
    } else {
      if (!isSender && !msg.read) {
        const entry = inboxMap.get(partnerId);
        entry.unreadCount += 1;
      }
    }
  });

  const inbox = Array.from(inboxMap.values());

  res.status(200).json({ success: true, data: inbox });
});
