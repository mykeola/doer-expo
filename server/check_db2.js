import sequelize from './src/Config/db.js';
import Message from './src/Chat/Models/Message.js';
import { Op } from 'sequelize';

const testQuery = async () => {
  try {
    const userId1 = 1;
    const userId2 = '5'; // string test

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 }
        ]
      },
      order: [['createdAt', 'ASC']],
      raw: true
    });
    console.log("Conversation:", messages);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
};

testQuery();
