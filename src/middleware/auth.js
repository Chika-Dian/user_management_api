import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const verifyToken = (req, res, next) => {
  // Mengambil token dari header 'Authorization: Bearer <token>'
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(403).json({ message: 'Token missing (Akses ditolak)' });

  // Memverifikasi token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: 'Invalid token (Tidak sah)' });
    
    // Menyimpan data user (ID, email, role) dari token ke objek req
    req.user = user;
    next(); // Lanjut ke controller
  });
};