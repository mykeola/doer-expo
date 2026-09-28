import sequelize from './src/Config/db.js';
import Message from './src/Chat/Models/Message.js';
import User from './src/Auth/Models/User.js';

const checkMessages = async () => {
  try {
    await sequelize.authenticate();
    const msgs = await Message.findAll({ raw: true });
    console.log("All Messages:", msgs);
    const users = await User.findAll({ attributes: ['id', 'fullName', 'role'], raw: true });
    console.log("All Users:", users);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
};

checkMessages();
