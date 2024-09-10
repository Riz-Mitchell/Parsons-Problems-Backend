const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/config.js');
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const APIRoutes = require('./helpers/geminiInterface.js');
const testRoutes = require('./routes/testRoutes.js');
const feedbackRoutes = require('./routes/feedbackRoutes.js');
const parsonsProblemsRoutes = require('./routes/parsonsProblemsRoutes.js');
const cookieParser = require('cookie-parser');
const { spawn } = require('child_process');


const requestHandler = require('./middleware/requestHandler.js');


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
app.use('/api/feedback', feedbackRoutes);

app.get('/run-python', (req, res) => {
    const pythonProcess = spawn('python3', ['./python/script.py']);
    try {
        pythonProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            res.json(JSON.parse(data));
        });
    
        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
            res.status(500).send('Error running Python script');
        });
    
        pythonProcess.on('close', (code) => {
            console.log(`Python script exited with code ${code}`);
        });
    } catch (error) {
        console.log(error);
    }
});

mongoose.connect(config.db.uri, config.db.options)
    .then(() => {
        console.log('Connected to ATLAS MongoDB');
        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
        });
    }).catch((err) => {
        console.error(`Database connection error: ${err}`);
    });