const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: false,
  },
  rating: {
    type: Number,
    required: false,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  reviewerIpOrId: {
    type: String, // Can be anonymous IP or session id
  }
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
