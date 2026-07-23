const Repository = require('../models/Repository');
const Website = require('../models/Website');
const Subscription = require('../models/Subscription');
const WebsiteService = require('../services/websiteService');

// @desc    Upload HTML and create a repository entry (unhosted)
// @route   POST /api/repositories
// @access  Private
const uploadRepository = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'HTML file is required' });
    }

    // Upload to Cloudinary
    const cloudinaryUrl = await WebsiteService.uploadHTMLToCloudinary(req.file.buffer, req.file.originalname);
    
    const repository = await Repository.create({
      user: req.user._id,
      name,
      cloudinaryRawUrl: cloudinaryUrl,
      status: 'unhosted'
    });

    res.status(201).json(repository);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's repositories
// @route   GET /api/repositories
// @access  Private
const getMyRepositories = async (req, res) => {
  try {
    const repositories = await Repository.find({ user: req.user._id }).populate('activeWebsiteId');
    res.json(repositories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Host a repository
// @route   POST /api/repositories/:id/host
// @access  Private
const hostRepository = async (req, res) => {
  try {
    const { customSlug } = req.body;
    const repositoryId = req.params.id;

    const repository = await Repository.findOne({ _id: repositoryId, user: req.user._id });
    if (!repository) return res.status(404).json({ message: 'Repository not found' });
    
    if (repository.status === 'hosted') {
      return res.status(400).json({ message: 'Repository is already hosted' });
    }

    // Check if user has an active subscription
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' }).populate('plan');
    if (!subscription) {
      return res.status(403).json({ message: 'Active subscription required to host a website' });
    }

    // Check plan limits
    const websiteCount = await Website.countDocuments({ user: req.user._id });
    if (websiteCount >= subscription.plan.maxWebsites) {
      return res.status(403).json({ message: 'Plan website limit reached. Please upgrade your plan.' });
    }

    if (!customSlug) {
      return res.status(400).json({ message: 'Domain name / Custom slug is required' });
    }

    const shortUrlAlias = customSlug.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    
    // Check slug uniqueness
    const existingSlug = await Website.findOne({ shortUrlAlias });
    if (existingSlug) {
      return res.status(400).json({ message: 'Domain name is already taken' });
    }

    // Create the website
    const website = await Website.create({
      user: req.user._id,
      name: repository.name,
      shortUrlAlias,
      cloudinaryRawUrl: repository.cloudinaryRawUrl,
      status: 'active',
      enableFeedback: true
    });

    repository.status = 'hosted';
    repository.activeWebsiteId = website._id;
    await repository.save();

    res.status(200).json({ message: 'Website hosted successfully', website, repository });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Unhost a repository
// @route   POST /api/repositories/:id/unhost
// @access  Private
const unhostRepository = async (req, res) => {
  try {
    const repositoryId = req.params.id;

    const repository = await Repository.findOne({ _id: repositoryId, user: req.user._id });
    if (!repository) return res.status(404).json({ message: 'Repository not found' });
    
    if (repository.status !== 'hosted' || !repository.activeWebsiteId) {
      return res.status(400).json({ message: 'Repository is not currently hosted' });
    }

    // Delete the active website
    await Website.findByIdAndDelete(repository.activeWebsiteId);

    repository.status = 'unhosted';
    repository.activeWebsiteId = undefined;
    await repository.save();

    res.status(200).json({ message: 'Website unhosted successfully', repository });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a repository
// @route   DELETE /api/repositories/:id
// @access  Private
const deleteRepository = async (req, res) => {
  try {
    const repositoryId = req.params.id;

    const repository = await Repository.findOne({ _id: repositoryId, user: req.user._id });
    if (!repository) return res.status(404).json({ message: 'Repository not found' });
    
    // If it's hosted, unhost it by deleting the Website document
    if (repository.activeWebsiteId) {
      await Website.findByIdAndDelete(repository.activeWebsiteId);
    }

    // Delete the file from Cloudinary
    if (repository.cloudinaryRawUrl) {
      await WebsiteService.deleteHTMLFromCloudinary(repository.cloudinaryRawUrl);
    }

    // Delete the Repository document
    await Repository.findByIdAndDelete(repositoryId);

    res.status(200).json({ message: 'Repository deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { uploadRepository, getMyRepositories, hostRepository, unhostRepository, deleteRepository };
