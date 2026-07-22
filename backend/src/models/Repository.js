const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  cloudinaryRawUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['unhosted', 'hosted'],
    default: 'unhosted'
  },
  activeWebsiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
  }
}, { timestamps: true });

const Repository = mongoose.model('Repository', repositorySchema);
module.exports = Repository;
