const Message = require('../models/Message');

exports.handleDLR = async (req, res) => {
  try {
    const { message_id, status, error } = req.body;

    const message = await Message.findOne({ messageId: message_id });
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    message.status = status === 'delivered' ? 'delivered' : 'failed';
    message.deliveryTime = new Date();
    if (error) {
      message.error = error;
    }
    await message.save();

    // Emit status update via Socket.IO
    const io = req.app.get('io');
    io.emit('dlr_update', {
      messageId: message_id,
      status,
      error,
      timestamp: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    console.error('DLR handling error:', err);
    res.status(500).json({
      success: false,
      message: 'Error processing DLR'
    });
  }
};