require('dotenv').config({ path: '../.env' }); // Adjust path to reach the root .env
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://web-host-manager-c8pthvsul.vercel.app'], // Allow both local and production
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

const initAdmin = require('./src/utils/initAdmin');
const setupCronJobs = require('./src/utils/cronJobs');

// Connect to Database
connectDB().then(() => {
  // Initialize Singleton Admin after DB connects
  initAdmin();
});

const telemetryService = require('./src/services/telemetryService');

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // When a user authenticates on the frontend, they should emit 'join' with their user ID
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their notification room.`);
  });

  // Subscribe to telemetry for a specific website
  socket.on('subscribe-telemetry', (websiteId) => {
    socket.join(`telemetry-${websiteId}`);
    console.log(`User subscribed to telemetry for website ${websiteId}`);
  });

  socket.on('unsubscribe-telemetry', (websiteId) => {
    socket.leave(`telemetry-${websiteId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Broadcast telemetry data every 3 seconds
setInterval(async () => {
  const Website = require('./src/models/Website');
  const Subscription = require('./src/models/Subscription');

  try {
    // Only broadcast to rooms that have listeners
    const rooms = io.sockets.adapter.rooms;
    
    for (const [roomName, clients] of rooms.entries()) {
      if (roomName.startsWith('telemetry-') && clients.size > 0) {
        const websiteId = roomName.split('-')[1];
        
        // Find website and its plan to correctly simulate resources
        const website = await Website.findById(websiteId);
        if (website) {
          const sub = await Subscription.findOne({ user: website.user, status: 'active' }).populate('plan');
          const planTier = sub ? sub.plan.name : 'Basic Starter';
          
          const metrics = telemetryService.getWebsiteMetrics(websiteId, planTier);
          
          io.to(roomName).emit('telemetry-update', metrics);
        }
      }
    }
  } catch (error) {
    console.error('Error broadcasting telemetry:', error);
  }
}, 3000);

// Start Cron Jobs
setupCronJobs(io);

// Start Server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
