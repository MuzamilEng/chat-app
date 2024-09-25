const mongoose = require('mongoose');

const SecretInfo = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
  },
  info: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SecretInfo', SecretInfo);
