const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;
const IMAGES_DIR = path.join(__dirname, 'images');

// Basic CORS and static file serving
app.use(cors());
app.use('/images', express.static(IMAGES_DIR));

// Redirect root to image list
app.get('/', (req, res) => {
    res.redirect('/images/list');
});

// Endpoint untuk mengirim daftar nama file gambar di folder images/
app.get('/images/list', (req, res) => {
    fs.readdir(IMAGES_DIR, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Gagal membaca folder images' });
        }
        // Filter hanya file gambar
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
        res.json(imageFiles);
    });
});

app.listen(PORT, () => {
    console.log(`Image server running at http://localhost:${PORT}`);
});
