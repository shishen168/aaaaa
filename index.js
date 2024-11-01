require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const smsRoutes = require('./routes/sms');
const moController = require('./controllers/mo');
const dlrController = require('./controllers/dlr');

const app = express();
const httpServer = createServer(app);

// Socket.IO configuration with proper CORS
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
    transports: ['websocket', 'polling']
  },
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(morgan('dev'));
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'SMS Platform API' });
});

// API routes
app.use('/api/sms', smsRoutes);
app.post('/api/mo', moController.handleMO);
app.post('/api/dlr', dlrController.handleDLR);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
  });

  // Handle incoming SMS
  socket.on('send_message', async (data) => {
    try {
      const { to, text, userId } = data;
      
      // Emit to all connected clients
      io.emit('new_message', {
        from: to,
        text,
        userId,
        timestamp: new Date()
      });

      socket.emit('message_sent', {
        success: true,
        to,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('message_error', {
        error: 'Failed to process message',
        timestamp: new Date()
      });
    }
  });

  // Handle delivery reports
  socket.on('delivery_report', (data) => {
    io.emit('dlr_update', data);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing HTTP server...');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});