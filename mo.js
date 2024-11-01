const Message = require('../models/Message');

exports.handleMO = async (req, res) => {
  try {
    const { from, to, text, message_id } = req.body;

    const message = new Message({
      messageId: message_id,
      recipient: to,
      sender: from,
      content: text,
      direction: 'inbound',
      status: 'delivered',
      sendTime: new Date()
    });

    await message.save();

    // Emit new message via Socket.IO
    const io = req.app.get('io');
    io.emit('new_message', {
      from,
      to,
      text,
      messageId: message_id,
      timestamp: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    console.error('MO handling error:', err);
    res.status(500).json({
      success: false,
      message: 'Error processing MO'
    });
  }
};