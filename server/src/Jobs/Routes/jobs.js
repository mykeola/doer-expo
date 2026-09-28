import express from 'express';
import { createJob, getMyJobs, getAllJobs, applyToJob, getJobById, updateApplicationStatus, leaveReview } from '../Controllers/JobController.js';
import { protect, customerOnly, doerOnly } from '../../Auth/Middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, customerOnly, createJob)
  .get(protect, getAllJobs);

router.get('/my-jobs', protect, customerOnly, getMyJobs);

router.get('/:id', protect, getJobById);
router.post('/:id/apply', protect, doerOnly, applyToJob);
router.post('/:id/review', protect, customerOnly, leaveReview);
router.put('/:jobId/applications/:appId', protect, customerOnly, updateApplicationStatus);

export default router;
