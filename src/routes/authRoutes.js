import express from 'express';
import { register, login } from '../controllers/authController.js';
const router = express.Router();

// Endpoint Publik: tidak butuh token
router.post('/register', register);
router.post('/login', login);

export default router;