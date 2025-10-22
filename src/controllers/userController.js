import pool from '../config/db.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import bcrypt from 'bcryptjs';

// R (Read All Users)
export const getUsers = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, username, email, role, avatar_url, updated_at FROM users');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Gagal mengambil data user', error: err.message });
    }
};

// U (Update/Edit Profile) - Hanya diri sendiri
export const updateProfile = async (req, res) => {
    try {
        const { id } = req.user; // ID user yang login
        const { username, email, password } = req.body;
        let updateQuery = 'UPDATE users SET updated_at = NOW()';
        const queryParams = [];
        let paramIndex = 1;

        if (username) {
            updateQuery += `, username = $${paramIndex++}`;
            queryParams.push(username);
        }
        if (email) {
            updateQuery += `, email = $${paramIndex++}`;
            queryParams.push(email);
        }
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            updateQuery += `, password = $${paramIndex++}`;
            queryParams.push(hashed);
        }

        if (queryParams.length === 0) {
            return res.status(400).json({ message: 'Tidak ada data yang dikirim untuk diupdate' });
        }

        updateQuery += ` WHERE id = $${paramIndex} RETURNING id, username, email, role, avatar_url, updated_at`;
        queryParams.push(id); 

        const { rows } = await pool.query(updateQuery, queryParams);

        if (rows.length === 0) {
             return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        res.json({ message: 'Profil berhasil diperbarui', user: rows[0] });

    } catch (err) {
        if (err.code === '23505') { 
            return res.status(409).json({ message: 'Username atau Email sudah digunakan' });
        }
        res.status(500).json({ message: 'Gagal memperbarui profil', error: err.message });
    }
};

// D (Delete User) - Hanya diri sendiri
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.user; 
        
        const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        
        if (rowCount === 0) {
             return res.status(404).json({ message: 'User tidak ditemukan' });
        }
        
        res.json({ message: 'User berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal menghapus user', error: err.message });
    }
};

// Upload Avatar ke Cloudinary
export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Tidak ada file diunggah' });

        // Proses streaming upload ke Cloudinary dari buffer memori
        const uploadStream = () =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { 
                  folder: 'avatars', 
                  public_id: `avatar-${req.user.id}` 
              },
              (err, result) => {
                if (err) reject(err);
                else resolve(result);
              }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
          });

        const result = await uploadStream();
        const { id } = req.user; 

        // Update URL avatar dan waktu update di database
        const query = 'UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2 RETURNING avatar_url';
        await pool.query(query, [result.secure_url, id]);

        res.json({ message: 'Avatar berhasil diunggah', avatar_url: result.secure_url });
    } catch (err) {
        res.status(500).json({ message: 'Upload gagal', error: err.message });
    }
};