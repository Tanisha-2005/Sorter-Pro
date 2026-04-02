const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const crypto = require('crypto');
const apiRoutes = require('./routes/api');
const { startAutoSort } = require('./utils/sorter');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Directories setup
const BASE_DIR = path.join(__dirname, 'sorted_files');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PREVIEWS_DIR = path.join(__dirname, 'previews');

fs.ensureDirSync(BASE_DIR);
fs.ensureDirSync(UPLOADS_DIR);
fs.ensureDirSync(PREVIEWS_DIR);

app.use('/api', apiRoutes);
app.use('/previews', express.static(PREVIEWS_DIR));
app.use('/files', express.static(BASE_DIR));

// Setup Auto Sort Watcher on the uploads directory
startAutoSort(UPLOADS_DIR, BASE_DIR);

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
