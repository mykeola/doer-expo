import sequelize from './src/Config/db.js';
import DoerProfile from './src/Doers/Models/DoerProfile.js';

async function test() {
  try {
    const profile = await DoerProfile.findOne({ where: { userId: undefined } });
    console.log("findOne returned:", profile);
  } catch (err) {
    console.error("Error:", err.message);
  }
  process.exit(0);
}

test();
