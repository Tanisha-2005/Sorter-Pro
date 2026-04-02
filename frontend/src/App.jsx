import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import FileUploader from './pages/FileUploader';
import HistoryLog from './pages/HistoryLog';
import ScanReports from './pages/ScanReports';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<FileUploader />} />
          <Route path="/history" element={<HistoryLog />} />
          <Route path="/reports" element={<ScanReports />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
