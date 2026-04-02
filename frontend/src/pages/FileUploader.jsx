import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Upload, CheckCircle, AlertTriangle, File, HardDrive, Cpu, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './FileUploader.css';

const FileUploader = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    setFiles(acceptedFiles);
    setResults(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResults(res.data.results);
      setFiles([]);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div 
      className="uploader-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header className="page-header">
        <h1>Smart <span className="text-gradient">Upload</span></h1>
        <p className="subtitle">Upload and automatically organize your files</p>
      </header>

      <div className="upload-layout">
        <div className="upload-main glass-panel">
          <div 
            {...getRootProps()} 
            className={`dropzone ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            <motion.div 
              className="dropzone-content"
              animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
            >
              <div className="upload-icon-wrapper">
                <Upload size={48} className="text-accent" />
                <div className="pulse-ring"></div>
              </div>
              <h3>{isDragActive ? "Drop the assets here..." : "Drag & Drop Files"}</h3>
              <p>or click to browse local storage</p>
            </motion.div>
          </div>

          <AnimatePresence>
            {files.length > 0 && (
              <motion.div 
                className="selected-files"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h4>Selected Files ({files.length})</h4>
                <ul className="file-list">
                  {files.slice(0, 5).map((file, idx) => (
                    <li key={idx} className="file-item">
                      <File size={16} />
                      <span className="truncate">{file.name}</span>
                      <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </li>
                  ))}
                  {files.length > 5 && (
                    <li className="file-item more">
                      + {files.length - 5} more files
                    </li>
                  )}
                </ul>
                <button 
                  className="btn btn-primary upload-btn" 
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <div className="spinner"></div> Organizing Files...
                    </>
                  ) : (
                    <>
                      <Cpu size={18} /> Upload & Sort
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="side-panel">
          {results ? (
            <motion.div 
              className="results-panel glass-panel"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3>Sort Results</h3>
              <div className="results-list">
                {results.map((res, idx) => (
                  <div key={idx} className={`result-item ${res.result.status}`}>
                    {res.result.status === 'sorted' ? (
                      <CheckCircle className="status-icon success" />
                    ) : (
                      <AlertTriangle className="status-icon warning" />
                    )}
                    <div className="result-details">
                      <p className="filename">{res.filename}</p>
                      <p className="status-text text-gradient">
                        {res.result.status === 'sorted' ? `Moved to ${res.result.category}` : res.result.reason || 'Duplicate Found'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="info-panel glass-panel">
              <h3>Features</h3>
              <ul className="protocols-list">
                <li><HardDrive size={16} /> Delete Duplicates</li>
                <li><Cpu size={16} /> Smart Categories</li>
                <li><ShieldAlert size={16} /> Scan for threats</li>
              </ul>
              <div className="hologram-effect"></div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FileUploader;
