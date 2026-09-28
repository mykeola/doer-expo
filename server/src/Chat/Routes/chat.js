import express from 'express';
import { sendNewMessage, getMessagesWithUser, getInbox } from '../Controllers/ChatController.js';
import { protect } from '../../Auth/Middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All chat routes require authentication

router.get('/inbox', getInbox);
router.post('/', sendNewMessage);
router.get('/:partnerId', getMessagesWithUser);

export default router;
