import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize, { connectDB } from './src/Config/db.js';
import authRoutes from './src/Auth/Routes/auth.js';
import doerRoutes from './src/Doers/Routes/doers.js';
import chatRoutes from './src/Chat/Routes/chat.js';
import jobRoutes from './src/Jobs/Routes/jobs.js';
import './src/Auth/Models/User.js'; // Ensure models are loaded
import './src/Doers/Models/DoerProfile.js';
import './src/Chat/Models/Message.js';
import './src/Jobs/Models/Job.js';
import './src/Jobs/Models/JobApplication.js';
import './src/Jobs/Models/Review.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doers', doerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/jobs', jobRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

// Connect to DB and sync models, then start server
connectDB().then(async () => {
  try {
    await sequelize.sync(); // Create tables if they don't exist
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to sync db: ' + err.message);
  }
});
