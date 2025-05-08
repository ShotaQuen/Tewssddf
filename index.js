require('dotenv').config();
const express = require("express");
const cors = require("cors");
const secure = require("ssl-express-www");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(secure);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

// Simpan error ke errors.json
function logErrorToFile(error) {
  const errorEntry = {
    message: error.message,
    stack: error.stack,
    platform: process.platform,
    timestamp: new Date().toISOString()
  };

  const filePath = path.join(__dirname, 'errors.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    let errors = [];
    if (!err && data) {
      try {
        errors = JSON.parse(data);
      } catch (_) {}
    }

    errors.unshift(errorEntry);
    fs.writeFile(filePath, JSON.stringify(errors, null, 2), err => {
      if (err) console.error('Gagal menyimpan error:', err);
    });
  });
}

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API untuk mengambil semua error
app.get('/api/errors', (req, res) => {
  const filePath = path.join(__dirname, 'errors.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Gagal membaca file errors.json' });
    try {
      const errors = JSON.parse(data);
      res.json(errors);
    } catch {
      res.status(500).json({ message: 'Format file tidak valid' });
    }
  });
});

// Simulasi error
app.get("/api/test", (req, res) => {
  throw new Error("Simulasi error dari /api/test");
});

// Error middleware
app.use((err, req, res, next) => {
  console.error("Terjadi error:", err);
  logErrorToFile(err);
  res.status(500).send("Server error");
});

app.listen(port, () => {
  console.log("Server berjalan di http://localhost:" + port);
});
