import express from 'express';
import { getUsers, uploadAvatar, updateProfile, deleteUser } from '../controllers/userController.js'; 
import { verifyToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Semua route di sini terproteksi (harus ada token)
router.get('/', verifyToken, getUsers); // GET /api/users
router.post('/avatar', verifyToken, upload.single('file'), uploadAvatar); // POST /api/users/avatar
router.put('/', verifyToken, updateProfile); // PUT /api/users
router.delete('/', verifyToken, deleteUser); // DELETE /api/users

export default router;