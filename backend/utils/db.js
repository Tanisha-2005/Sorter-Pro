const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data.json');

const defaultDb = {
    history: [],
    customRules: [], // { name: 'Large Files', condition: { sizeGreaterThan: 100 }, destination: 'Large_Files' }
    analytics: {
        totalFilesSorted: 0,
        totalDiskSpaceSaved: 0,
        extensions: {}, 
        threatsBlocked: 0
    }
};

const getDb = () => {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeJsonSync(DB_PATH, defaultDb, { spaces: 2 });
    }
    return fs.readJsonSync(DB_PATH);
};

const saveDb = (data) => {
    fs.writeJsonSync(DB_PATH, data, { spaces: 2 });
};

const logHistory = (action, details, originalPath, currentPath, size = 0) => {
    const db = getDb();
    db.history.unshift({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action,
        details,
        originalPath,
        currentPath,
        size,
        undone: false
    });
    if (db.history.length > 200) db.history.pop();
    saveDb(db);
};

const undoAction = (id) => {
    const db = getDb();
    const item = db.history.find(i => i.id === id);
    if (!item) return { success: false, reason: 'Log not found' };
    if (item.undone) return { success: false, reason: 'Already undone' };
    if (item.action !== 'sorted') return { success: false, reason: 'Can only undo successful sort actions' };

    if (fs.existsSync(item.currentPath)) {
        let size = fs.statSync(item.currentPath).size;
        let extMatch = item.currentPath.match(/\.([a-zA-Z0-9]+)$/);
        let ext = extMatch ? extMatch[1].toLowerCase() : 'unknown';

        // Ensure original directory exists
        fs.ensureDirSync(path.dirname(item.originalPath));
        // Move back
        fs.moveSync(item.currentPath, item.originalPath);
        item.undone = true;

        // Decrement analytics
        db.analytics.totalFilesSorted = Math.max(0, db.analytics.totalFilesSorted - 1);
        if (db.analytics.extensions[ext]) {
            db.analytics.extensions[ext].count = Math.max(0, db.analytics.extensions[ext].count - 1);
            db.analytics.extensions[ext].size = Math.max(0, db.analytics.extensions[ext].size - size);
        }

        saveDb(db);
        return { success: true };
    }
    return { success: false, reason: 'File no longer exists at destination' };
};

const updateAnalytics = (ext, size, isDuplicate = false, isThreat = false) => {
    const db = getDb();
    if (isThreat) {
        db.analytics.threatsBlocked += 1;
    } else if (isDuplicate) {
        db.analytics.totalDiskSpaceSaved += size;
    } else {
        db.analytics.totalFilesSorted += 1;
        ext = ext || 'unknown';
        if (!db.analytics.extensions[ext]) {
            db.analytics.extensions[ext] = { count: 0, size: 0 };
        }
        db.analytics.extensions[ext].count += 1;
        db.analytics.extensions[ext].size += size;
    }
    saveDb(db);
};

const addCustomRule = (rule) => {
    const db = getDb();
    // basic rule structure
    rule.id = Date.now().toString();
    db.customRules.push(rule);
    saveDb(db);
    return rule;
};

module.exports = { getDb, saveDb, logHistory, updateAnalytics, undoAction, addCustomRule };
