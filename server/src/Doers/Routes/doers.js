import express from 'express';
import { getProfile, updateProfile, getDoers, getDoerById } from '../Controllers/DoerController.js';
import { protect, doerOnly } from '../../Auth/Middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile')
  .get(protect, doerOnly, getProfile)
  .put(protect, doerOnly, updateProfile)
  .post(protect, doerOnly, updateProfile); // Create or update

router.get('/', getDoers); // Public or protected depending on needs, assume public to search doers for MVP
router.get('/:id', getDoerById); // Public route to fetch a single Doer profile

export default router;
