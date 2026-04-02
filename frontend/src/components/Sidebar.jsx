import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, History, Settings, ShieldAlert, FolderTree, FileText } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { name: 'Overview', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Upload Files', path: '/upload', icon: <UploadCloud size={20} /> },
    { name: 'History', path: '/history', icon: <History size={20} /> },
    { name: 'Security Scans', path: '/reports', icon: <ShieldAlert size={20} /> }
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <div className="logo-icon"><FileText size={20} color="#fff" /></div>
        <h2 className="text-gradient" style={{ fontSize: '1.25rem' }}>Sorter Pro</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            to={item.path} 
            key={item.name}
            className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <div className="status-dot"></div>
          <span>System Active</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
