const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getDb, undoAction, addCustomRule } = require('../utils/db');
const { manuallyTriggerSort, cleanupFolders } = require('../utils/sorter');
const archiver = require('archiver');
const fs = require('fs-extra');

const tempUploadsDir = path.join(__dirname, '../temp_uploads');
fs.ensureDirSync(tempUploadsDir);
const upload = multer({ dest: tempUploadsDir });
const BASE_DIR = path.join(__dirname, '../sorted_files');

router.get('/analytics', (req, res) => {
    const db = getDb();
    const activeHistory = db.history.filter(item => !item.deleted && !item.undone);
    
    let totalFilesSorted = 0;
    let threatsBlocked = 0;
    let totalDiskSpaceSaved = 0;
    let extensions = {};
    
    for (const item of activeHistory) {
      let size = item.size || 0;
      try {
          if (item.currentPath && fs.existsSync(item.currentPath)) {
              size = fs.statSync(item.currentPath).size;
          }
      } catch (e) {}

      if (item.action === 'sorted') {
          totalFilesSorted++;
          totalDiskSpaceSaved += size;
          
          let ext = 'unknown';
          try {
              if (item.currentPath) {
                  const extMatch = item.currentPath.match(/\.([a-zA-Z0-9]+)$/);
                  if (extMatch) ext = extMatch[1].toLowerCase();
              } else {
                  const extMatch = item.details.match(/\.([a-zA-Z0-9]+)(\s|$)/);
                  if (extMatch) ext = extMatch[1].toLowerCase();
              }
          } catch (e) {}
          
          if (!extensions[ext]) {
             extensions[ext] = { count: 0, size: 0 };
          }
           extensions[ext].count++;
           extensions[ext].size += size;
      } else if (item.action === 'threat_blocked') {
          threatsBlocked++;
      } else if (item.action === 'duplicate_deleted') {
          totalDiskSpaceSaved += size;
      }
    }

    res.json({
        totalFilesSorted,
        totalDiskSpaceSaved,
        threatsBlocked,
        extensions
    });
});

router.get('/dashboard-activity', (req, res) => {
    const db = getDb();
    const sorted = db.history.filter(i => i.action === 'sorted' && !i.deleted && !i.undone).slice(0, 5);
    const enriched = sorted.map(item => {
        let size = 0;
        let name = "Unknown File";
        let category = "Unknown";
        
        try {
            if (item.currentPath && fs.existsSync(item.currentPath)) {
                size = fs.statSync(item.currentPath).size;
                name = path.basename(item.currentPath);
                
                // Try to infer category from path
                const parts = item.currentPath.split(/[/\\]sorted_files[/\\]/);
                if (parts.length > 1) {
                    category = parts[1].split(/[/\\]/)[0]; // e.g. 'documents'
                }
            } else {
                // Infer from details string if currentPath fails
                const match = item.details.match(/Sorted (.*?) \-\> (.*?)[\/\\]/);
                if (match) {
                    name = match[1];
                    category = match[2];
                }
            }
        } catch (e) {}

        return {
            id: item.id,
            timestamp: item.timestamp,
            name,
            category,
            size
        };
    });
    
    res.json(enriched);
});

router.get('/history', (req, res) => {
    res.json(getDb().history);
});

router.post('/undo/:id', (req, res) => {
    const result = undoAction(req.params.id);
    if (result.success) {
        res.json({ message: 'Undo successful' });
    } else {
        res.status(400).json({ error: result.reason });
    }
});

router.post('/upload', upload.array('files'), async (req, res) => {
    try {
        const results = [];
        for (const file of req.files) {
            const timestampName = Date.now() + '_' + file.originalname;
            const renamedPath = path.join(file.destination, timestampName);
            fs.renameSync(file.path, renamedPath);
            
            // Note: Update manuallyTriggerSort signature below to accept originalName
            const result = await manuallyTriggerSort(renamedPath, BASE_DIR, file.originalname);
            results.push({ filename: file.originalname, result });
        }
        res.json({ message: 'Upload completed', results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/delete/:id', (req, res) => {
    const { getDb, saveDb } = require('../utils/db');
    try {
        const db = getDb();
        const item = db.history.find(i => i.id === req.params.id);
        
        if (!item) {
            return res.status(404).json({ error: 'File log not found' });
        }
        
        let sizeToSubtract = 0;
        let ext = 'unknown';

        if (item.currentPath && fs.existsSync(item.currentPath)) {
            sizeToSubtract = fs.statSync(item.currentPath).size;
            const extMatch = item.currentPath.match(/\.([a-zA-Z0-9]+)$/);
            if (extMatch) ext = extMatch[1].toLowerCase();
            fs.removeSync(item.currentPath);
        } else {
            // infer extension if currentPath missing
            const extMatch = item.details.match(/\.([a-zA-Z0-9]+)(\s|$)/);
            if (extMatch) ext = extMatch[1].toLowerCase();
        }
        
        // Update analytics
        if (item.action === 'sorted') {
            db.analytics.totalFilesSorted = Math.max(0, db.analytics.totalFilesSorted - 1);
            if (db.analytics.extensions[ext]) {
                db.analytics.extensions[ext].count = Math.max(0, db.analytics.extensions[ext].count - 1);
                if (sizeToSubtract > 0) {
                    db.analytics.extensions[ext].size = Math.max(0, db.analytics.extensions[ext].size - sizeToSubtract);
                }
            }
        } else if (item.action === 'threat_blocked') {
            db.analytics.threatsBlocked = Math.max(0, db.analytics.threatsBlocked - 1);
        } else if (item.action === 'duplicate_deleted') {
            // Hard to accurately guess space saved if missing size, but if file existed, we minus it
            if (sizeToSubtract > 0) {
                db.analytics.totalDiskSpaceSaved = Math.max(0, db.analytics.totalDiskSpaceSaved - sizeToSubtract);
            }
        }
        
        item.details += ' (Deleted)';
        item.deleted = true;
        saveDb(db);
        
        res.json({ message: 'File deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/cleanup', (req, res) => {
    try {
        const deleted = cleanupFolders(BASE_DIR);
        res.json({ message: 'Cleanup complete', itemsRemoved: deleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/files', (req, res) => {
    const buildTree = (dir) => {
        if (!fs.existsSync(dir)) return [];
        const items = fs.readdirSync(dir);
        return items.map(item => {
            const itemPath = path.join(dir, item);
            const stats = fs.statSync(itemPath);
            if (stats.isDirectory()) {
                return { name: item, type: 'directory', children: buildTree(itemPath), path: itemPath };
            }
            return { name: item, type: 'file', size: stats.size, path: itemPath };
        });
    };
    res.json(buildTree(BASE_DIR));
});

router.get('/backup', (req, res) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    res.attachment('backup-sorted-files.zip');
    archive.pipe(res);
    archive.directory(BASE_DIR, false);
    archive.finalize();
});

router.get('/rules', (req, res) => {
    res.json(getDb().customRules || []);
});

router.post('/rules', (req, res) => {
    try {
        const rule = addCustomRule(req.body);
        res.json(rule);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
