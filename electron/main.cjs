const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow = null;

// Configure autoUpdater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function setupAutoUpdater() {
  if (!app.isPackaged) return;

  autoUpdater.on('checking-for-update', () => {
    mainWindow?.webContents.send('updater-status', { status: 'checking' });
  });

  autoUpdater.on('update-available', (info) => {
    mainWindow?.webContents.send('updater-status', { status: 'available', version: info.version });
  });

  autoUpdater.on('update-not-available', (info) => {
    mainWindow?.webContents.send('updater-status', { status: 'up-to-date', version: info.version });
  });

  autoUpdater.on('error', (err) => {
    mainWindow?.webContents.send('updater-status', { status: 'error', message: err.message });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow?.webContents.send('updater-status', {
      status: 'downloading',
      percent: progressObj.percent,
      bytesPerSecond: progressObj.bytesPerSecond
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow?.webContents.send('updater-status', { status: 'downloaded', version: info.version });
  });

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(err => console.error('AutoUpdate check error:', err));
  }, 4000);
}

ipcMain.handle('check-for-updates', async () => {
  if (!app.isPackaged) {
    return { status: 'dev-mode', message: 'Running in development mode' };
  }
  return autoUpdater.checkForUpdates();
});

ipcMain.handle('restart-and-install-update', () => {
  autoUpdater.quitAndInstall();
});

function createWindow() {
  const isMac = process.platform === 'darwin';

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 1080,
    minHeight: 700,
    backgroundColor: '#07090e',
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    autoHideMenuBar: true,
    frame: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Enable WebHID and WebBluetooth device permission handlers
  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    return true;
  });

  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    return true;
  });

  // WebHID device picker automatic approval
  mainWindow.webContents.session.on('select-hid-device', (event, details, callback) => {
    event.preventDefault();
    if (details.deviceList && details.deviceList.length > 0) {
      callback(details.deviceList[0].deviceId);
    } else {
      callback('');
    }
  });

  // Load Vite dev server or production dist bundle
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  setupAutoUpdater();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
