// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express(); // INI HARUS SEBELUM app.get / app.post / app.use
const PORT = process.env.PORT || 3000;

// === Koneksi ke database MySQL ===
const db = mysql
  .createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'nusantara',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .promise();

// === Middleware ===
app.use(cors());
app.use(express.json());

// === Health Check ===
app.get('/', (_req, res) => {
  res.status(200).send('✅ API Nusantara Flix Aktif');
});

// =======================================================
// GET /media — Ambil semua data media
// =======================================================
app.get('/media', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM media');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('GET /media error:', error);
    return res.status(500).json({ message: 'Kesalahan Server' });
  }
});

// =======================================================
// POST /media — Tambah media baru
// =======================================================
app.post('/media', async (req, res) => {
  const { judul, tahun_rilis, genre } = req.body;

  if (!judul || !tahun_rilis || !genre) {
    return res
      .status(400)
      .json({ message: 'Semua field (judul, tahun_rilis, genre) wajib diisi' });
  }

  try {
    const sql = 'INSERT INTO media (judul, tahun_rilis, genre) VALUES (?, ?, ?)';
    const [result] = await db.query(sql, [judul, tahun_rilis, genre]);

    return res.status(201).json({
      message: 'Media berhasil ditambahkan',
      data: {
        id_media: result.insertId,
        judul,
        tahun_rilis,
        genre,
      },
    });
  } catch (error) {
    console.error('POST /media error:', error);
    return res.status(500).json({ message: 'Kesalahan Server' });
  }
});

// =======================================================
// PUT /media/:id_media — Perbarui data media
// =======================================================
app.put('/media/:id_media', async (req, res) => {
  const { id_media } = req.params;
  const { judul, tahun_rilis, genre } = req.body;

  if (!judul || !tahun_rilis || !genre) {
    return res
      .status(400)
      .json({ message: 'Semua field (judul, tahun_rilis, genre) harus diisi' });
  }

  try {
    const sql = `
      UPDATE media
      SET judul = ?, tahun_rilis = ?, genre = ?
      WHERE id_media = ?
    `;
    const [result] = await db.query(sql, [judul, tahun_rilis, genre, id_media]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Media tidak ditemukan' });
    }

    return res.status(200).json({
      message: 'Data media berhasil diperbarui',
      data: { id_media: Number(id_media), judul, tahun_rilis, genre }
    });
  } catch (error) {
    console.error('PUT /media/:id_media error:', error);
    return res.status(500).json({ message: 'Kesalahan Server' });
  }
});

// === Jalankan server ===
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
