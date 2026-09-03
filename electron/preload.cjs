const { contextBridge, ipcRenderer } = require('electron');

// Expose minimal bridge for renderer context
contextBridge.exposeInMainWorld('darkProjectBridge', {
  platform: process.platform,
  isElectron: true,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  restartAndInstall: () => ipcRenderer.invoke('restart-and-install-update'),
  onUpdaterStatus: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('updater-status', handler);
    return () => ipcRenderer.removeListener('updater-status', handler);
  }
});
