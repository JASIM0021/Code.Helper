const { app, globalShortcut } = require('electron');
const path = require('path');

// Import modules
const { loadSettings, saveSettings, getSettings } = require('./utils/settings');
const {
  createMainWindow,
  createOverlayWindow,
  showOverlay,
  hideOverlay,
} = require('./windows/window-manager');
const { registerGlobalShortcuts } = require('./utils/shortcuts');
const { setupIpcHandlers } = require('./ipc/ipc-handlers');

// Global state
let mainWindow;
let overlayWindow;

async function initialize() {
  try {
    // Load settings first
    await loadSettings();

    // Create windows
    mainWindow = createMainWindow();
    overlayWindow = createOverlayWindow();

    // Setup IPC communication
    setupIpcHandlers(mainWindow, overlayWindow);

    // Register global shortcuts
    registerGlobalShortcuts(() => showOverlay(overlayWindow));

    console.log('Code Helper initialized successfully');

    const env = process.env.NODE_ENV || 'development';

    // If development environment
    // if (env === 'development') {
    //   try {
    //     require('electron-reloader')(module, {
    //       debug: true,
    //       watchRenderer: true,
    //     });
    //   } catch (_) {
    //     console.log('Error');
    //   }
    // }
  } catch (error) {
    console.error('Failed to initialize Code Helper:', error);
  }
}

// App event handlers
app.whenReady().then(initialize);

app.dock.setIcon(path.join(process.cwd(), 'assets', 'icon.png'));

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = createMainWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Handle app quit
app.on('before-quit', () => {
  saveSettings();
});

// Export for testing
module.exports = {
  initialize,
  getMainWindow: () => mainWindow,
  getOverlayWindow: () => overlayWindow,
};
