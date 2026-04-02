# ⚙️ Sorter Pro - Backend Core

The high-performance **Node.js/Express** brain of the **Sorter Pro** platform. This server manages thousands of files per second with automated NLP sorting, malware scanning, and duplicate detection.

## 🧱 Key Features

- **📂 Smart Sorter Engine**: Automatically routes files including resumes into study-specific folders.
- **📅 Month/Year Nested Directories**: Hierarchical storage to maintain clean filing structures.
- **🛡️ Security Layer**: Scans files on arrival for malicious signatures and illegal file extensions.
- **🧠 Logical Hashing**: MD5/SHA256 signature checking to detect and move duplicated content.
- **💾 JSON-Store DB**: Lightweight, local persistent storage using `data.json`.
- **🔄 File Action Logging**: Complete audit record system for Undo/Recovery.

## 🛠️ Main Tech Stack

| Module | Library |
| :--- | :--- |
| Server | Node.js / Express |
| Upload Management| Multer |
| File Operations | FS-Extra |
| File Watching | Chokidar |
| Compression | Archiver |

## 🚀 Getting Started

Ensure you have [Node.js](https://nodejs.org/) installed, then:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the production server:
   ```bash
   npm start
   ```
3. The server will run at `http://localhost:5000`.

## 📂 Project Structure

- `/routes/api.js`: Main Express router for analytics and management.
- `/utils/sorter.js`: The algorithmic engine for file processing.
- `/utils/db.js`: Low-level database management for JSON storage. 
- `/sorted_files`: Physical storage location for all managed files.
- `data.json`: Current state of history and analytics.
