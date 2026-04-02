# 🎨 Sorter Pro - Frontend Interface

The frontend for **Sorter Pro**, a high-performance React application built on **Vite**. It features a modern, humanized dashboard design, smooth Framer Motion animations, and real-time visualization of your backend file-system state.

## 🧱 Key Features

- **📊 Dynamic Dashboard**: Responsive charts for extension distribution and managed space.
- **📁 Drag & Drop Interface**: Seamless multiple-file uploading via `FileUploader`.
- **🕒 Full Audit Trail**: Complete, filterable History Log with Undo and Preview capabilities.
- **🛡️ Security Center**: Audit logs for malware detections and duplicate management.

## 🛠️ Main Tech Stack

| Feature | Library |
| :--- | :--- |
| Framework | React (Vite) |
| Animations | Framer Motion |
| Icons | Lucide-React |
| Charts | Chart.js / react-chartjs-2 |
| API Layer | Axios |

## 🚀 Getting Started

Ensure you have [Node.js](https://nodejs.org/) installed, then:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Visit `http://localhost:5173` to view the application.

## 📂 Project Structure

- `/src/pages`: Main view components like Dashboard, FileUploader, HistoryLog.
- `/src/components`: UI shared components like Sidebar and Navigation.
- `/src/App.jsx`: Main routing logic.
- `/index.css`: Shared design system and Tailwind-like utility classes.
