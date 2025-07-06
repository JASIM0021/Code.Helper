const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  onSettingsChanged: (callback) => ipcRenderer.on('settings-data', (event, settings) => callback(settings)),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings)
}); 