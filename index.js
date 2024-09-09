const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const APIRoutes = require('./helpers/geminiInterface.js');
const testRoutes = require('./routes/testRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const parsonsProblemsRoutes = require('./routes/parsonsProblemsRoutes.js');
const cookieParser = require('cookie-parser');


const requestHandler = require('./middleware/requestHandler');


require('dotenv').config();

const app = express();

// Middleware for reading json
app.use(express.json());
app.use(cors());

// Middleware for cookies
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/test', requestHandler, testRoutes);

app.use('/api/users', requestHandler, userRoutes);
app.use('/api/parsonProblem', requestHandler, parsonsProblemsRoutes);


mongoose.connect(config.db.uri, config.db.options)
    .then(() => {
        console.log('Connected to ATLAS MongoDB');
        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
        });
    }).catch((err) => {
        console.error(`Database connection error: ${err}`);
    });