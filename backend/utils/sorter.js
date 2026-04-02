const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const crypto = require('crypto');
const { updateAnalytics, logHistory, getDb } = require('./db');
const { scanFile } = require('./scanner');

const getFileHash = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
};

const analyzeTextContent = (filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
        // Naive NLP content matching
        const jobKeywords = ['resume', 'experience', 'education', 'skills', 'job', 'employment', 'cv'];
        const studyKeywords = ['chapter', 'lecture', 'assignment', 'syllabus', 'course', 'university', 'exam'];
        
        let jobScore = 0;
        let studyScore = 0;

        jobKeywords.forEach(k => { if (content.includes(k)) jobScore++; });
        studyKeywords.forEach(k => { if (content.includes(k)) studyScore++; });

        if (jobScore > 2 && jobScore > studyScore) return 'Job Docs';
        if (studyScore > 2 && studyScore > jobScore) return 'Study Material';
        
        return null;
    } catch {
        return null;
    }
};

const determineCategoryByCustomRules = (fileName, ext, size) => {
    const db = getDb();
    if (!db.customRules || db.customRules.length === 0) return null;
    
    for (const rule of db.customRules) {
        if (rule.condition.extension && rule.condition.extension.includes(ext.replace('.', ''))) {
            return rule.destination;
        }
        if (rule.condition.sizeGreaterThan && size > rule.condition.sizeGreaterThan * 1024 * 1024) {
            return rule.destination;
        }
        if (rule.condition.nameContains && fileName.toLowerCase().includes(rule.condition.nameContains.toLowerCase())) {
            return rule.destination;
        }
    }
    return null;
};

const getExtensionCategory = (ext) => {
    ext = ext.toLowerCase().replace('.', '');
    const categories = {
        images: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'],
        documents: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx'],
        videos: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv'],
        audio: ['mp3', 'wav', 'ogg', 'm4a', 'flac'],
        archives: ['zip', 'rar', '7z', 'tar', 'gz'],
        code: ['js', 'html', 'css', 'py', 'java', 'c', 'cpp', 'h', 'ts', 'json', 'xml'],
    };

    for (const [category, extensions] of Object.entries(categories)) {
        if (extensions.includes(ext)) {
            return category;
        }
    }
    return 'Others';
};

let fileHashes = new Map();

const sortFile = async (filePath, baseDir, stats, sourceName = 'Manual Upload', isAuto = false, originalFileName = null) => {
    try {
        const fileName = originalFileName || path.basename(filePath);
        const ext = path.extname(fileName) || '.unknown';
        const cleanExt = ext.toLowerCase().replace('.', '');
        const size = stats ? stats.size : fs.statSync(filePath).size;
        
        // 1. Cyber Security Scan
        const isSafe = scanFile(filePath);
        if (!isSafe) {
            updateAnalytics(cleanExt, size, false, true);
            logHistory('threat_blocked', `Malicious content detected in ${fileName}`, filePath, null, size);
            fs.removeSync(filePath);
            return { status: 'rejected', reason: 'Security scan failed (Malware Detected)' };
        }

        // 2. Duplicate Check
        const hash = getFileHash(filePath);
        if (fileHashes.has(hash)) {
            updateAnalytics(cleanExt, size, true, false);
            // Instead of immediate delete, we can move it to a "Duplicates" folder, but to save space we just delete it based on req (or user choice). For now we move to Duplicates.
            const dupDir = path.join(baseDir, 'Duplicates');
            fs.ensureDirSync(dupDir);
            const dupPath = path.join(dupDir, fileName);
            fs.moveSync(filePath, dupPath, { overwrite: true });
            logHistory('duplicate_deleted', `Moved duplicate ${fileName} to Duplicates`, filePath, dupPath, size);
            return { status: 'duplicate', path: dupPath };
        }

        // 3. Smart Sorting Logic Hierarchy
        let category = determineCategoryByCustomRules(fileName, cleanExt, size);
        
        if (!category && (cleanExt === 'txt' || cleanExt === 'md' || cleanExt === 'rtf')) {
            category = analyzeTextContent(filePath);
        }

        if (!category) {
            category = getExtensionCategory(cleanExt);
        }

        // Handle time-based sub-sorting (Option to sort by Date)
        const dateObj = new Date();
        const monthYear = `${dateObj.getFullYear()}-${(dateObj.getMonth()+1).toString().padStart(2, '0')}`;
        
        // Target Dir => Base / Category / MonthYear (or just Ext)
        // Let's use Category -> MonthYear to implement time-based grouping
        const targetDir = path.join(baseDir, category, monthYear);
        fs.ensureDirSync(targetDir);

        const targetPath = path.join(targetDir, fileName);

        // Resolve naming conflicts
        let finalPath = targetPath;
        let counter = 1;
        while (fs.existsSync(finalPath)) {
            const nameWithoutExt = path.basename(fileName, ext);
            finalPath = path.join(targetDir, `${nameWithoutExt}_${counter}${ext}`);
            counter++;
        }

        fs.moveSync(filePath, finalPath);
        fileHashes.set(hash, finalPath);

        updateAnalytics(cleanExt, size);
        logHistory('sorted', `Sorted ${fileName} -> ${category}/${monthYear}`, filePath, finalPath, size);

        return { status: 'sorted', path: finalPath, category, ext: cleanExt };

    } catch (err) {
        console.error(`Error sorting ${filePath}:`, err);
        return { status: 'error', error: err.message };
    }
};

const startAutoSort = (uploadDir, baseDir) => {
    const watcher = chokidar.watch(uploadDir, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 1000,
            pollInterval: 100
        }
    });

    watcher.on('add', (filePath, stats) => {
        sortFile(filePath, baseDir, stats, 'Auto-Sync', true);
    });
};

const manuallyTriggerSort = async (filePath, baseDir, originalFileName) => {
    return await sortFile(filePath, baseDir, null, 'Manual Upload', false, originalFileName);
};

// Folder Cleanup Feature
const cleanupFolders = (dir) => {
    let deletedCount = 0;
    if (!fs.existsSync(dir)) return deletedCount;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            deletedCount += cleanupFolders(fullPath);
            // Check if empty after inner clean
            if (fs.readdirSync(fullPath).length === 0) {
                fs.removeSync(fullPath);
                deletedCount++;
            }
        } else {
            // Remove Temp/Cache files
            if (item.endsWith('.tmp') || item === '.DS_Store' || item === 'Thumbs.db') {
                fs.removeSync(fullPath);
                deletedCount++;
            }
        }
    }
    return deletedCount;
};


module.exports = { startAutoSort, manuallyTriggerSort, cleanupFolders };
