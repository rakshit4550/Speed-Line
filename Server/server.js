import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRouter from './routes/user.js';
import whitelabelRouter from './routes/whiteLabel.js';
import prooftypeRouter from './routes/prooftype.js';
import { initializeProofs } from './controllers/prooftype.js';
import sportsRouter from './routes/sports.js';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  })
);

app.use('/uploads', express.static('uploads'));

app.use(express.json());

app.use('/user', userRouter);

app.use('/whitelabel', whitelabelRouter);

app.use('/prooftype', prooftypeRouter);

app.use('/sports', sportsRouter);

const PORT = 2030;

mongoose
  .connect('mongodb://127.0.0.1:27017/SpeedLine')
  .then(() => {
    console.log('MongoDB Connected Successfully...!');
    app.listen(PORT, async () => {
      await initializeProofs();
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB Connection Error:', err));