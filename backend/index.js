// index.js - UPDATED TO USE NEW MODEL SYSTEM

const express = require('express');
const dotenv = require('dotenv');

// Import the centralized models (this initializes everything)
const { sequelize } = require('./models'); // ← CHANGED: Now imports from models/index.js

const testPool = require('./test-pool');

dotenv.config();

const app = express();
app.use(express.json());


// Import routes
const authRoutes = require('./routes/auth.routes');
const movieRoutes = require('./routes/movie.routes');        
const showtimeRoutes = require('./routes/showtime.routes');   
const bookingRoutes = require('./routes/booking.routes'); 
const paymentRoutes = require('./routes/payment.routes');      
const healthRoutes = require('./routes/health.routes');        
const searchRoutes = require('./routes/search.routes'); 
const adminRoutes = require('./routes/admin.routes');
const profileRoutes = require('./routes/profile.routes');



// Use routes
app.use('api/auth', authRoutes);
app.use('api/movies', movieRoutes);                               
app.use('api/showtime', showtimeRoutes);
app.use('api/booking', bookingRoutes);
app.use('api/search', searchRoutes);
app.use('api/payment', paymentRoutes);
app.use('api/health', healthRoutes);
app.use('api/admin', adminRoutes);
app.use('api/profile', profileRoutes);

   


app.get('/ping', (req, res) => {
    res.send('pong');
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        console.log(`✅ Server running on port ${PORT}`);
        console.log('✅ Database connected successfully');
        
        // Start the reminder scheduler
        const SchedulerService = require('./services/scheduler.service');
        SchedulerService.start();
        
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        process.exit(1);
    }
});

testPool();
