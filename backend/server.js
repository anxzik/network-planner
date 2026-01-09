const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
   // useNewUrlParser: false,
   // useUnifiedTopology: false,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('Network Planner API is running');
});

// Import Routes
const authRoutes = require('./routes/auth');
const networkRoutes = require('./routes/networks');

app.use('/api/auth', authRoutes);
app.use('/api/networks', networkRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
