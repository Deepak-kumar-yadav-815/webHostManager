const Feedback = require('../models/Feedback');
const Website = require('../models/Website');
// For socket access we can require it if we export it, or we can use a simpler approach.
// But we'll just mock the socket emit by using the global or a specific utility if available.
// For now, we'll assume we can handle the DB creation and leave the socket emit to a cleaner pub/sub if needed.

// @desc    Post feedback for a website
// @route   POST /api/feedback/:shortUrlAlias
// @access  Public
const postFeedback = async (req, res) => {
  try {
    const { shortUrlAlias } = req.params;
    const { rating, comment } = req.body;
    const reviewerIpOrId = req.ip;

    const website = await Website.findOne({ shortUrlAlias });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const feedback = await Feedback.create({
      website: website._id,
      rating,
      comment,
      reviewerIpOrId
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get feedback for a website
// @route   GET /api/feedback/website/:websiteId
// @access  Private
const getWebsiteFeedback = async (req, res) => {
  try {
    // Check if the user owns the website
    const website = await Website.findOne({ _id: req.params.websiteId, user: req.user._id });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const feedback = await Feedback.find({ website: website._id }).sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit general platform feedback (Contact Us)
// @route   POST /api/feedback/platform
// @access  Public
const submitPlatformFeedback = async (req, res) => {
  try {
    const { name, email, comment } = req.body;
    const reviewerIpOrId = req.ip;

    const feedback = await Feedback.create({
      name,
      email,
      comment,
      reviewerIpOrId
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all platform feedback (Admin)
// @route   GET /api/feedback/platform
// @access  Private/Admin
const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({}).sort({ createdAt: -1 }).populate('website');
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Verify ownership of the website that the feedback belongs to
    const website = await Website.findOne({ _id: feedback.website, user: req.user._id });
    
    // Allow deletion if the user owns the website, OR if they are an admin
    if (!website && req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'Not authorized to delete this feedback' });
    }

    await feedback.deleteOne();
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { postFeedback, getWebsiteFeedback, submitPlatformFeedback, getAllFeedback, deleteFeedback };
