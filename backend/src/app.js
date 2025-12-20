const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const session = require('express-session');
const passport = require('./config/passport');

// Import database connection
require('./config/database');
require("./config/passport");

const notificationService = require('./services/notificationService');

// Import routes
const authRoutes = require('./routes/auth');
const collegeRoutes = require('./routes/colleges');
const userRoutes = require('./routes/users');
const contentRoutes = require('./routes/content');
const adminRoutes = require('./routes/admin');

const eventRoutes = require('./routes/events');
const jobRoutes = require('./routes/jobs');
const mentorshipRoutes = require('./routes/mentorship');
const messageRoutes = require('./routes/messages');
const donationRoutes = require('./routes/donations');
const queryRoutes = require('./routes/queries');
const superAdminRoutes = require('./routes/superAdmin');
const allATSRoutes = require('./routes/allATSRoutes');
const studentATSRoutes = require('./routes/studentATSRoutes');
const recommendationRoutes = require('./routes/recommendation');
// Add this line with your other route imports
const collegeAdminRoutes = require('./routes/collegeAdmin');




// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use((req, res, next) => {
  req.notificationService = notificationService;
  next();
});

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60 * 1000 // 10 minutes
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Auth specific rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
// Add this line with your other route uses (after super admin routes)
app.use('/api/college-admin', collegeAdminRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/all-ats', allATSRoutes);
app.use('/api/student-ats', studentATSRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;