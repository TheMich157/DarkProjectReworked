const { contextBridge } = require('electron');

// Expose a minimal bridge for the renderer to detect it's running inside Electron
contextBridge.exposeInMainWorld('darkProjectBridge', {
  platform: process.platform,
  isElectron: true,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});
