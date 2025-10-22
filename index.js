import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

// --- Middleware Keamanan ---
app.use(cors({
  origin: ['http://localhost:3000'], // Sesuaikan dengan domain frontend Anda
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(helmet()); 

// --- Routes (Penyambungan) ---
app.use('/api/auth', authRoutes); 
app.use('/api/users', userRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});