const mongoose = require('mongoose')

const InviteSchema = new mongoose.Schema({
  email: {
    type: String,
    index: true
  },
  sender: { type:mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inviteeEmail: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
  createdAt: {
    type: Date
  },

}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('Invite', InviteSchema);
