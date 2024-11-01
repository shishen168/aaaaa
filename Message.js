const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true
  },
  recipient: {
    type: String,
    required: true
  },
  sender: String,
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'failed'],
    default: 'sent'
  },
  direction: {
    type: String,
    enum: ['outbound', 'inbound'],
    required: true
  },
  sendTime: {
    type: Date,
    default: Date.now
  },
  deliveryTime: Date,
  error: String,
  userId: String
});

module.exports = mongoose.model('Message', messageSchema);