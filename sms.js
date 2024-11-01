const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

// Get message history
router.get('/history', async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ sendTime: -1 })
      .limit(100);
    
    res.json({
      success: true,
      data: messages
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving message history'
    });
  }
});

// Get message status
router.get('/status/:messageId', async (req, res) => {
  try {
    const message = await Message.findOne({ 
      messageId: req.params.messageId 
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: {
        status: message.status,
        error: message.error
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving message status'
    });
  }
});

module.exports = router;