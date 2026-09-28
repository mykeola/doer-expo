import Job from '../Models/Job.js';
import JobApplication from '../Models/JobApplication.js';
import Review from '../Models/Review.js';
import User from '../../Auth/Models/User.js';
import DoerProfile from '../../Doers/Models/DoerProfile.js';

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Customer)
export const createJob = async (req, res) => {
  try {
    const { title, description, category, budget, location } = req.body;

    const job = await Job.create({
      title,
      description,
      category,
      budget,
      location,
      customerId: req.user.id
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all jobs posted by the logged-in customer
// @route   GET /api/jobs/my-jobs
// @access  Private (Customer)
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { customerId: req.user.id },
      include: [
        { model: JobApplication, as: 'applications', include: [{ model: User, as: 'doer', attributes: ['id', 'fullName'] }] },
        { model: User, as: 'assignedDoer', attributes: ['id', 'fullName'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all open jobs (for Doers to browse)
// @route   GET /api/jobs
// @access  Private (Doer) or Public
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { status: 'open' },
      include: [
        { model: User, as: 'customer', attributes: ['id', 'fullName'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply to a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Doer)
export const applyToJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { coverLetter, proposedPrice } = req.body;

    const job = await Job.findByPk(jobId);
    if (!job || job.status !== 'open') {
      return res.status(404).json({ success: false, message: 'Job not found or not open' });
    }

    const application = await JobApplication.create({
      jobId,
      doerId: req.user.id,
      coverLetter,
      proposedPrice
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single job by ID
// @route   GET /api/jobs/:id
// @access  Private
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'fullName'] },
        { 
          model: JobApplication, 
          as: 'applications',
          include: [{ model: User, as: 'doer', attributes: ['id', 'fullName', 'email', 'phone'] }] 
        },
        {
          model: Review,
          as: 'review'
        }
      ]
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const responseData = job.toJSON();
    
    // Only show applications if the requester is the customer who created the job
    if (req.user.id !== job.customerId) {
      delete responseData.applications;
    }

    // Flag to easily check if the requester is the assigned doer
    responseData.isAssignedToMe = (job.assignedDoerId === req.user.id);

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept or reject a job application
// @route   PUT /api/jobs/:jobId/applications/:appId
// @access  Private (Customer)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { jobId, appId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const job = await Job.findByPk(jobId);
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.customerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const application = await JobApplication.findOne({
      where: { id: appId, jobId: jobId }
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Update application status
    application.status = status;
    await application.save();

    // If accepted, update the job and reject other applications
    if (status === 'accepted') {
      job.status = 'in_progress';
      job.assignedDoerId = application.doerId;
      await job.save();

      // Reject all other pending applications for this job
      await JobApplication.update(
        { status: 'rejected' },
        { 
          where: { 
            jobId: jobId, 
            status: 'pending' 
          } 
        }
      );
    }

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Leave a review and mark job completed
// @route   POST /api/jobs/:id/review
// @access  Private (Customer)
export const leaveReview = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid rating between 1 and 5' });
    }

    const job = await Job.findByPk(jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.customerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!job.assignedDoerId) {
      return res.status(400).json({ success: false, message: 'Job is not assigned to a Doer yet' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ where: { jobId } });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Review already submitted for this job' });
    }

    // Create review
    const review = await Review.create({
      jobId,
      customerId: req.user.id,
      doerId: job.assignedDoerId,
      rating,
      comment
    });

    // Mark job as completed if it isn't already
    if (job.status !== 'completed') {
      job.status = 'completed';
      await job.save();
    }

    // Update DoerProfile ratings
    const profile = await DoerProfile.findOne({ where: { userId: job.assignedDoerId } });
    if (profile) {
      const allReviews = await Review.findAll({ where: { doerId: job.assignedDoerId } });
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      profile.averageRating = totalRating / allReviews.length;
      profile.totalJobs = allReviews.length;
      await profile.save();
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
