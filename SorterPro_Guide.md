# SorterPro AI - Command Center Manual

Welcome to **SorterPro AI**, your advanced AI-powered file organization and cybersecurity platform. 

## Features Developed

1. **Smart AI Sorting Engine**: Groups files not just by extensions but logically mapping them to semantic categories (e.g., Images, Documents, Videos, Code) using advanced categorization matrices.
2. **Cyber-Security Intrusion Detection**: Inspects file contents upon upload. If a trace signature of malware is found, the asset is automatically rejected and destroyed.
3. **Redundancy & Deduplication AI**: Hashes all uploaded files via robust **SHA-256**. Identical files will be pruned to save you disk space.
4. **Real-time Auto-Sorting**: A watcher running in the background persistently scans external folders. You can drag and drop assets manually into the dashboard directly.
5. **Analytics Dashboard Engine**: Full React-based visual overview of your system's efficiency, storage saved, and file distribution. Fully animated and beautifully built.
6. **Action Telemetry (History)**: Monitor every step of the matrix through detailed network logs.
7. **Cloud Backup & Compression Engine**: With a single click on "Initiate Core Backup" in the History pane, all sorted categories are packed, heavily compressed, and securely downloaded to your device as a `.zip`.

## Running the Application Locally

We've configured everything under a Monorepo environment on your desktop (`C:\Users\user\Desktop\File sorter pro`).

### Booting the System
1. Go to your terminal and simply double click or run `start_all.bat`.
2. This creates automated background tasks to ignite both the **Node.js API AI Engine** and the **Vite React Frontend Web UI**.
3. Alternatively:
   - Backend: Go to `/backend` and `npm start`
   - Frontend: Go to `/frontend` and `npm run dev`

### Accessing the Web Version
Once the engine is running, open your browser and navigate to:
**[http://localhost:5173/](http://localhost:5173/)**

## Advanced Cyber Aesthetics
The user interface has been equipped with a premium *Dark Cyber* glassmorphism design. Expect high-end gradient overlays, responsive hover micro-interactions, robust routing, and futuristic UI components driven by `framer-motion` and custom CSS properties.
