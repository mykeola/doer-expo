import Message from '../Models/Message.js';
import { Op } from 'sequelize';

export const sendMessage = async (senderId, receiverId, content) => {
  const message = await Message.create({
    senderId,
    receiverId,
    content
  });
  return message;
};

export const getConversation = async (userId1, userId2) => {
  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 }
      ]
    },
    order: [['createdAt', 'ASC']]
  });
  return messages;
};
