import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import createError from 'http-errors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import adminUsersRoutes from './routes/adminUsers.routes.js';
import adminProjectsRoutes from './routes/adminProjects.routes.js';
import adminContactsRoutes from './routes/adminContacts.routes.js';
import adminNotificationsRoutes from './routes/adminNotifications.routes.js';
import taskRoutes from './routes/task.routes.js';
import contactsRoutes from './routes/contacts.routes.js';


dotenv.config();


connectDB();


const app = express();


const PORT = process.env.PORT || 3000;


app.use(helmet()); 


const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://plan-mint-ynan.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); 
app.use(morgan('production')); 
app.use(compression()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());


app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    database: 'connected'
  });
});


app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});


app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Test endpoint working!',
    data: {
      method: req.method,
      path: req.path
    }
  });
});


app.use('/api/auth', authRoutes);


app.use('/api/users', usersRoutes);


app.use('/api/projects', projectsRoutes);


app.use('/api/notifications', notificationsRoutes);


app.use('/api/admin', adminUsersRoutes);


app.use('/api/admin', adminProjectsRoutes);

app.use('/api/admin', adminContactsRoutes);


app.use('/api/admin/notifications', adminNotificationsRoutes);


app.use('/api', taskRoutes);


app.use('/api', contactsRoutes);


app.use((req, res, next) => {
  next(createError(404, 'Route not found'));
});


app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'production' && { stack: err.stack })
  });
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
});


process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT signal received: closing HTTP server');
  process.exit(0);
});
