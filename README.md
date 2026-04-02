# 📁 Sorter Pro

**Sorter Pro** is a modern, AI-driven file organization and cybersecurity platform. It automatically categorizes your uploads into smart directories based on file content, metadata, and security signatures, helping you maintain a pristine digital workspace.

![Sorter Pro Dashboard](https://github.com/user-attachments/assets/b6a2f7c0-2e4a-4c27-9fb6-59270281b0b7) *(Note: Replace with your actual screenshot!)*

## 🚀 Key Features

- **🔍 Smart AI Sorting**: Uses NLP (Natural Language Processing) to scan text-based files and automatically route them to specific folders like "Job Docs" for resumes or "Study Material" for lectures.
- **🛡️ Security Scanner**: Every uploaded file is scanned for malicious signatures and hidden extensions. Threats are quarantined or blocked automatically.
- **🧠 Duplicate Detection**: Identifies identical files using SHA-256 hashing to clear up wasted disk space.
- **📅 Time-Based Organization**: Files are dynamically nested into year/month subfolders (e.g., `Documents/2026-04/report.pdf`) for superior historical tracking.
- **📊 Interactive Analytics**: A beautiful, real-time dashboard showing your sorting precision, extension distribution, and all-time space managed.
- **🔄 Undo & History**: Complete audit logs of every move. Made a mistake? Hit the Undo button to instantly return a file to its original location.
- **🧹 Folder Cleanup**: One-click recursion to wipe out empty directories and temporary cache files.

## 🛠️ Technology Stack

- **Frontend**: React, Vite, Framer Motion (Animations), Lucide-React (Icons), Chart.js (Data Vis).
- **Backend**: Node.js, Express, Multer, Chokidar (File Watching), FS-Extra (File Ops).
- **Style**: Modern "Humanized" Light Theme with Glassmorphism and responsive design.

## ⚙️ Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sorter-pro.git
   cd sorter-pro
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   ```

## 🏃 Running the Application

For a quick launch, use the included root `start_all.bat` (if on Windows) or run the components manually:

**Backend Server (Port 5000):**
```bash
cd backend
npm start
```

**Frontend Dev Server (Port 5173):**
```bash
cd frontend
npm run dev
```

Visit **http://localhost:5173** to access the Sorter Pro Dashboard.

## 📁 Project Structure

```text
├── backend/
│   ├── routes/        # API Endpoints
│   ├── utils/         # Sorter Logic & DB Helpers
│   ├── sorted_files/  # Default Sorting Destination
│   └── data.json      # History & Settings DB
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI pieces
│   │   ├── pages/      # Main application views
│   │   └── index.css   # Main design system
```

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ for better productivity.
