import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Eye, Trash2, HardDrive } from 'lucide-react';

const ScanReports = () => {
  const [reports, setReports] = useState([]);

  const fetchReports = () => {
    axios.get('http://localhost:5000/api/history')
      .then(res => {
        const filtered = res.data.filter(item => 
          (item.action === 'sorted' || item.action === 'threat_blocked' || item.action === 'duplicate_deleted') && !item.deleted && !item.undone
        );
        setReports(filtered);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getRelativePath = (fullPath) => {
    if (!fullPath) return '';
    // Support both Windows and Unix slashes
    const parts = fullPath.split(/[/\\]sorted_files[/\\]/);
    if (parts.length > 1) {
      return parts[1].replace(/\\/g, '/');
    }
    return '';
  };

  const handlePreview = (fullPath) => {
    const relPath = getRelativePath(fullPath);
    if (!relPath) return alert('Cannot find preview mapping for file. Was it moved?');
    const safePath = relPath.split('/').map(encodeURIComponent).join('/');
    window.open(`http://localhost:5000/files/${safePath}`, '_blank');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this file?')) return;
    try {
      await axios.post(`http://localhost:5000/api/delete/${id}`);
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete file');
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
          <h1>Security & <span className="text-gradient">Scans</span></h1>
          <p className="subtitle">Manage security analyses and file previews</p>
        </div>
      </header>

      <div className="history-board glass-panel">
        <div className="log-header">
          <div className="col action" style={{ width: '120px' }}>Status</div>
          <div className="col details">Result Details</div>
          <div className="col time">Options</div>
        </div>
        
        <div className="log-body">
          {reports.length === 0 ? (
            <div className="empty-log">No scans recorded yet...</div>
          ) : (
            reports.map((item, idx) => (
              <motion.div 
                key={item.id} 
                className="log-row"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="col action" style={{ width: '120px' }}>
                  {item.action === 'sorted' ? (
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={14}/> Safe
                    </span>
                  ) : item.action === 'duplicate_deleted' ? (
                    <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HardDrive size={14}/> Duplicate
                    </span>
                  ) : (
                    <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldAlert size={14}/> Malware
                    </span>
                  )}
                </div>
                <div className="col details" style={{ textDecoration: (item.undone || item.deleted) ? 'line-through' : 'none', opacity: (item.undone || item.deleted) ? 0.5 : 1 }}>
                  {item.details}
                  {item.action === 'threat_blocked' && (
                     <div style={{ fontSize: '0.8rem', color: 'var(--accent-tertiary)', marginTop: '4px' }}>
                       Quarantine protocol executed. Asset destroyed.
                     </div>
                  )}
                </div>
                <div className="col time d-flex-between" style={{flex: 1, justifyContent: 'flex-end', gap: '0.5rem'}}>
                  {(item.action === 'sorted' || item.action === 'duplicate_deleted') && !item.undone && !item.deleted && (
                    <>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => handlePreview(item.currentPath)}
                        style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                      >
                        <Eye size={14} style={{ marginRight: '6px' }} /> Preview
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDelete(item.id)}
                        style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                        title="Permanently Delete"
                      >
                        <Trash2 size={14} style={{ marginRight: '6px' }} /> Delete
                      </button>
                    </>
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

export default ScanReports;
