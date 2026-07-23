const Website = require('../models/Website');
const Subscription = require('../models/Subscription');
const WebsiteService = require('../services/websiteService');
const telemetryService = require('../services/telemetryService');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios'); 

// @desc    Upload HTML and create website entry
// @route   POST /api/websites
// @access  Private
const createWebsite = async (req, res) => {
  try {
    const { name, customSlug } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'HTML file is required' });
    }

    // Check if user has an active subscription
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' }).populate('plan');
    if (!subscription) {
      return res.status(403).json({ message: 'Active subscription required to host a website' });
    }

    // Check plan limits
    const websiteCount = await Website.countDocuments({ user: req.user._id });
    if (websiteCount >= subscription.plan.maxWebsites) {
      return res.status(403).json({ message: 'Plan website limit reached' });
    }

    // Determine slug
    let shortUrlAlias = customSlug ? customSlug.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase() : uuidv4().substring(0, 6);
    
    // Check slug uniqueness
    const existingSlug = await Website.findOne({ shortUrlAlias });
    if (existingSlug) {
      return res.status(400).json({ message: 'Custom slug is already taken' });
    }

    // Upload to Cloudinary
    const cloudinaryUrl = await WebsiteService.uploadHTMLToCloudinary(req.file.buffer, req.file.originalname);
    
    const website = await Website.create({
      user: req.user._id,
      name,
      shortUrlAlias,
      cloudinaryRawUrl: cloudinaryUrl,
      status: 'active',
      enableFeedback: true
    });

    res.status(201).json(website);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's websites
// @route   GET /api/websites
// @access  Private
const getMyWebsites = async (req, res) => {
  try {
    const websites = await Website.find({ user: req.user._id });
    res.json(websites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a legacy website
// @route   DELETE /api/websites/:id
// @access  Private
const deleteWebsite = async (req, res) => {
  try {
    const website = await Website.findOne({ _id: req.params.id, user: req.user._id });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }
    
    // Check if it's linked to a repository (it shouldn't be for legacy nodes, but just in case)
    const Repository = require('../models/Repository');
    const linkedRepo = await Repository.findOne({ activeWebsiteId: website._id });
    if (linkedRepo) {
      linkedRepo.status = 'unhosted';
      linkedRepo.activeWebsiteId = undefined;
      await linkedRepo.save();
    }

    await Website.deleteOne({ _id: website._id });
    res.status(200).json({ message: 'Website deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI Insights based on Feedback and Code
// @route   GET /api/websites/:id/ai-insights
// @access  Private
const getAIInsights = async (req, res) => {
  try {
    const websiteId = req.params.id;
    const forceRefresh = req.query.refresh === 'true';
    
    // 1. Fetch Website
    const website = await Website.findOne({ _id: websiteId, user: req.user._id });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    // Return cached insights if they exist and we aren't forcing a refresh
    if (!forceRefresh && website.aiInsightsCache) {
      return res.status(200).json({ 
        insights: website.aiInsightsCache, 
        updatedAt: website.aiInsightsUpdatedAt 
      });
    }

    // 2. Fetch Feedback
    const Feedback = require('../models/Feedback');
    const feedbacks = await Feedback.find({ website: websiteId }).limit(20); // Get recent feedback

    // 3. Fetch Source Code from Cloudinary
    let htmlSnippet = '';
    try {
      const response = await axios.get(website.cloudinaryRawUrl, { responseType: 'text' });
      // Truncate to first 10,000 characters to prevent token limits
      htmlSnippet = response.data.substring(0, 10000); 
    } catch (err) {
      console.warn('Could not fetch source code for AI:', err.message);
      htmlSnippet = 'Source code unavailable.';
    }

    // 4. Generate AI Insights
    const AIService = require('../services/aiService');
    const aiReport = await AIService.analyzeFeedbackAndCode(website.name, feedbacks, htmlSnippet);

    // Save to DB Cache
    website.aiInsightsCache = aiReport;
    website.aiInsightsUpdatedAt = new Date();
    await website.save();

    res.status(200).json({ 
      insights: website.aiInsightsCache,
      updatedAt: website.aiInsightsUpdatedAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Serve the hosted website publicly
// @route   GET /s/:shortUrlAlias
// @access  Public
const serveWebsite = async (req, res) => {
  try {
    const { shortUrlAlias } = req.params;
    
    const website = await Website.findOne({ shortUrlAlias });
    if (!website) {
      return res.status(404).send('<h1>404 - Website Not Found</h1>');
    }

    // Check if owner has an active subscription
    const subscription = await Subscription.findOne({ user: website.user, status: 'active' });

    if (!subscription) {
      return res.status(403).send(`
        <div style="text-align: center; font-family: sans-serif; padding: 50px;">
          <h1 style="color: #e74c3c;">Website Suspended</h1>
          <p>This website is currently unavailable due to an expired hosting plan.</p>
        </div>
      `);
    }

    // Log Telemetry
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (clientIp.includes(',')) {
      clientIp = clientIp.split(',')[0].trim();
    }
    telemetryService.logVisit(website._id.toString(), clientIp);

    // Fetch HTML from Cloudinary
    const response = await axios.get(website.cloudinaryRawUrl);
    let htmlContent = response.data;
    
    // Inject Feedback Widget if enabled
    if (website.enableFeedback !== false) {
      const feedbackWidget = `
        <div id="whm-feedback-widget" style="position: fixed; bottom: 20px; right: 20px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999; font-family: sans-serif;">
          <h4>Leave Feedback</h4>
          <input type="number" id="whm-rating" min="1" max="5" placeholder="Rating (1-5)" style="display:block; margin-bottom:5px; width:100%;">
          <textarea id="whm-comment" placeholder="Comment" style="display:block; margin-bottom:5px; width:100%;"></textarea>
          <button onclick="submitFeedback()" style="background:#007bff; color:white; border:none; padding:5px 10px; cursor:pointer; width:100%;">Submit</button>
          <script>
            function submitFeedback() {
              const ratingStr = document.getElementById('whm-rating').value;
              const comment = document.getElementById('whm-comment').value;
              const rating = ratingStr ? parseInt(ratingStr, 10) : undefined;
              
              if (!comment) {
                alert('Comment is required');
                return;
              }

              fetch('/api/feedback/${shortUrlAlias}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment })
              }).then(async (res) => {
                if (!res.ok) {
                  const errorData = await res.json();
                  throw new Error(errorData.message || 'Failed to submit');
                }
                return res.json();
              }).then(data => {
                alert('Feedback submitted successfully!');
                document.getElementById('whm-feedback-widget').style.display = 'none';
              }).catch(err => alert(err.message));
            }
          </script>
        </div>
      `;
      if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', feedbackWidget + '</body>');
      } else {
        htmlContent += feedbackWidget;
      }
    }

    res.set('Content-Type', 'text/html');
    res.send(htmlContent);
    
  } catch (error) {
    res.status(500).send('<h1>500 - Internal Server Error</h1>');
  }
};

module.exports = { createWebsite, getMyWebsites, serveWebsite, deleteWebsite, getAIInsights };
