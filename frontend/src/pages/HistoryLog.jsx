import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Clock, DownloadCloud, Trash2, Shield, Activity, Save, Undo, FolderMinus } from 'lucide-react';
import './HistoryLog.css';

const HistoryLog = () => {
  const [history, setHistory] = useState([]);
  const [loadingUndo, setLoadingUndo] = useState(null);

  const fetchHistory = () => {
    axios.get('http://localhost:5000/api/history')
      .then(res => {
        const filtered = res.data.filter(item => !item.deleted && !item.undone);
        setHistory(filtered);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleBackup = () => {
    window.open('http://localhost:5000/api/backup', '_blank');
  };

  const handleUndo = async (id) => {
    setLoadingUndo(id);
    try {
      await axios.post(`http://localhost:5000/api/undo/${id}`);
      fetchHistory(); // Refresh to cross it out
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to undo');
    }
    setLoadingUndo(null);
  };

  const handleCleanup = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/cleanup');
      alert(`Cleanup Complete: ${res.data.itemsRemoved} items/folders removed.`);
    } catch (err) {
      alert('Cleanup failed');
    }
  };

  return (
    <motion.div 
      className="history-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header className="page-header d-flex-between">
        <div>
          <h1>Activity <span className="text-gradient">History</span></h1>
          <p className="subtitle">Track your organized files and recent actions</p>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button className="btn btn-outline" onClick={handleCleanup}>
            <FolderMinus size={18} /> Cleanup Empty Folders
          </button>
          <button className="btn btn-outline" onClick={handleBackup}>
            <Save size={18} /> Backup Files
          </button>
        </div>
      </header>

      <div className="history-board glass-panel">
        <div className="log-header">
          <div className="col action">Action</div>
          <div className="col details">Details</div>
          <div className="col time">Date / Undo</div>
        </div>
        
        <div className="log-body">
          {history.length === 0 ? (
            <div className="empty-log">Awaiting System Activity...</div>
          ) : (
            history.map((item, idx) => (
              <motion.div 
                key={item.id} 
                className={`log-row ${item.undone ? 'undone' : ''}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="col action">
                  {item.action === 'sorted' && <span className="badge badge-success"><Activity size={14}/> Sorted</span>}
                  {item.action === 'threat_blocked' && <span className="badge badge-danger"><Shield size={14}/> Threat</span>}
                  {item.action === 'duplicate_deleted' && <span className="badge badge-warning"><Trash2 size={14}/> Dupe</span>}
                </div>
                <div className="col details" style={{ textDecoration: item.undone ? 'line-through' : 'none', color: item.undone ? 'gray' : 'inherit' }}>
                  {item.details}
                </div>
                <div className="col time d-flex-between" style={{flex: 1, justifyContent: 'flex-end'}}>
                  <span>
                    <Clock size={14} className="text-muted" style={{marginRight: '5px', verticalAlign: 'middle'}} />
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  {item.action === 'sorted' && !item.undone && (
                    <button 
                      className="btn-icon-small" 
                      onClick={() => handleUndo(item.id)}
                      disabled={loadingUndo === item.id}
                      title="Undo this action"
                    >
                      <Undo size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HistoryLog;
