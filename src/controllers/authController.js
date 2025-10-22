import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // --- Validasi Input ---
        if (!email || !password || !username) {
            return res.status(400).json({ message: 'Semua field wajib diisi' });
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
             return res.status(400).json({ message: 'Format email tidak valid' });
        }
        if (password.length < 6) {
             return res.status(400).json({ message: 'Password minimal 6 karakter' });
        }
        // -----------------------

        const hashed = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email';
        const { rows } = await pool.query(query, [username, email, hashed]);
        
        res.status(201).json({ message: 'User berhasil didaftarkan', user: rows[0] });
    } catch (err) {
        if (err.code === '23505') { 
            return res.status(409).json({ message: 'Username atau Email sudah terdaftar' });
        }
        res.status(500).json({ message: 'Gagal mendaftarkan user', error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email dan password wajib diisi' });
        }
        
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await pool.query(query, [email]);
        if (!rows.length) return res.status(404).json({ message: 'User tidak ditemukan' });

        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Email atau password salah' });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, // Payload token
            process.env.JWT_SECRET, 
            { expiresIn: '2h' }
        );
        
        res.json({ message: 'Login berhasil', token });
    } catch (err) {
        res.status(500).json({ message: 'Login gagal', error: err.message });
    }
};