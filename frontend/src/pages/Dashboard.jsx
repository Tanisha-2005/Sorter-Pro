import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HardDrive, FileText, ShieldAlert, Zap, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/analytics')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
      
    axios.get('http://localhost:5000/api/dashboard-activity')
      .then(res => setRecentFiles(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!stats) return <div className="loading text-gradient">Initializing AI Core...</div>;

  const chartData = {
    labels: Object.keys(stats.extensions || {}),
    datasets: [
      {
        data: Object.values(stats.extensions || {}).map(e => e.count),
        backgroundColor: [
          '#4318FF', '#39B8FF', '#05CD99', '#FFCE20', '#EE5D50', '#A3AED0'
        ],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const chartOptions = {
    plugins: {
      legend: { position: 'right', labels: { color: '#2B3674', font: { family: 'Inter', weight: '500' } } }
    },
    cutout: '75%'
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, dm = 2, sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div 
      className="dashboard-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header className="page-header">
        <h1>Welcome Back</h1>
        <p className="subtitle" style={{ color: 'var(--text-secondary)' }}>Here relates your filing and sorting overview</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card glass-panel" style={{ cursor: 'pointer' }} onClick={() => navigate('/history')}>
          <div className="icon-wrapper primary"><FileText size={24} /></div>
          <div className="stat-info">
            <h3>{stats.totalFilesSorted}</h3>
            <p>Files Sorted</p>
          </div>
        </div>
        <div className="stat-card glass-panel" style={{ cursor: 'pointer' }} onClick={() => navigate('/reports')}>
          <div className="icon-wrapper success"><HardDrive size={24} /></div>
          <div className="stat-info">
            <h3>{formatBytes(stats.totalDiskSpaceSaved)}</h3>
            <p>Space Saved</p>
          </div>
        </div>
        <div className="stat-card glass-panel" style={{ cursor: 'pointer' }} onClick={() => navigate('/reports')}>
          <div className="icon-wrapper warning"><ShieldAlert size={24} /></div>
          <div className="stat-info">
            <h3>{stats.threatsBlocked}</h3>
            <p>Threats Blocked</p>
          </div>
        </div>
        <div className="stat-card glass-panel" style={{ cursor: 'pointer' }} onClick={() => navigate('/upload')}>
          <div className="icon-wrapper secondary"><Zap size={24} /></div>
          <div className="stat-info">
            <h3>AI Active</h3>
            <p>Engine Status</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card glass-panel">
          <div className="card-header">
            <h3>Extension Distribution</h3>
            <TrendingUp size={18} className="text-gradient" />
          </div>
          <div className="chart-wrapper">
            {Object.keys(stats.extensions || {}).length > 0 ? (
              <Doughnut data={chartData} options={chartOptions} />
            ) : (
              <p className="no-data">No data yet</p>
            )}
          </div>
        </div>

        <div className="recent-activity-card glass-panel">
          <div className="card-header">
            <h3>Recent Sort Activity</h3>
            <Clock size={18} className="text-gradient" />
          </div>
          <div className="activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentFiles.length === 0 ? (
              <p className="no-data" style={{ padding: '2rem 0', textAlign: 'center' }}>No recent files sorted.</p>
            ) : (
              recentFiles.map((file, i) => (
                <div key={file.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'var(--bg-main)', borderRadius: '10px' }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{file.category} • {formatDate(file.timestamp)}</div>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--accent-primary)' }}>{formatBytes(file.size)}</div>
                    <button 
                      onClick={() => navigate('/history')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', marginTop: '0.2rem', padding: '0' }}
                    >
                      View <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
