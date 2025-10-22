import multer from 'multer';

// Menggunakan memoryStorage agar file disimpan di RAM sementara
const storage = multer.memoryStorage();
const upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 } // Batas ukuran file 5MB
});

export default upload;