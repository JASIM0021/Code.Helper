const { BrowserWindow, screen, clipboard } = require('electron');
const path = require('path');
const { getSettings, saveSettings } = require('../utils/settings');
const robot = require('robotjs');
const { exec } = require('child_process');
let mainWindow = null;
let overlayWindow = null;

/**
 * Create the main settings window
 * @returns {BrowserWindow} Main window instance
 */
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: path.join(__dirname, '../../../assets/icon.png'),
        show: false // Hide initially
    });

    mainWindow.loadFile(path.join(__dirname, '../../renderer/pages/settings.html'));
    
    // Hide the main window initially
    mainWindow.on('ready-to-show', () => {
        // Don't show the main window automatically
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    return mainWindow;
}

/**
 * Create the overlay window
 * @returns {BrowserWindow} Overlay window instance
 */
function createOverlayWindow() {
    const display = screen.getPrimaryDisplay();
    const { width, height } = display.workAreaSize;
    const settings = getSettings();
    
    let x, y;
    const overlayWidth = 400;
    const overlayHeight = 400;
    
    // Position based on settings
    switch (settings.overlayPosition) {
        case 'bottom-right':
            x = width - overlayWidth - 20;
            y = height - overlayHeight - 10;
            break;
        case 'bottom-left':
            x = 20;
            y = height - overlayHeight - 20;
            break;
        case 'top-right':
            x = width - overlayWidth - 20;
            y = 20;
            break;
        case 'top-left':
            x = 20;
            y = 20;
            break;
        case 'center':
        default:
            x = Math.round((width - overlayWidth) / 2);
            y = Math.round((height - overlayHeight) / 2);
            break;
    }
    
    overlayWindow = new BrowserWindow({
        width: overlayWidth,
        height: overlayHeight,
        x: x,
        y: y,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: true,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    overlayWindow.loadFile(path.join(__dirname, '../../renderer/pages/overlay.html'));
    
    // Open DevTools for overlay window in development
    // if (process.env.NODE_ENV === 'development') {
        // overlayWindow.webContents.openDevTools();
    // }
    
    overlayWindow.on('closed', () => {
        overlayWindow = null;
    });

    return overlayWindow;
}

/**
 * Show the overlay window
 * @param {BrowserWindow} overlay - Overlay window instance
 */




async function autoCopyText() {
  try {
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'command' : 'control';

    // First check if there's already selected text in clipboard
    let text = clipboard.readText();
    if (text && text.trim() !== '') {
      console.log('Using existing clipboard text:', text);
      return text;
    }

    // Clear clipboard to ensure fresh copy
    clipboard.clear();

    // Simulate copy command (try multiple times if needed)
    let attempts = 0;
    while (attempts < 3) {
      robot.keyTap('c', modifier);
      await new Promise(resolve => setTimeout(resolve, 200));

      text = clipboard.readText();
      if (text && text.trim() !== '') {
        break;
      }
      attempts++;
    }

    if (!text || text.trim() === '') {
      throw new Error('Failed to copy selected text after 3 attempts');
    }

   

    return text;
  } catch (error) {
    console.error('Copy failed:', error);
    throw error;
  }
}

async function showOverlay(overlay = overlayWindow) {
  let selectedText = clipboard.readText();

  const isMac = process.platform === 'darwin';
  // Get and save mouse position
  const pos = robot.getMousePos();
  console.log('Mouse position:', pos);
  saveSettings({ pos });
  selectedText = await autoCopyText();
  await new Promise(resolve => setTimeout(resolve, 200));

  // clipboard.readText();
  // Check if the overlay window is destroyed or null
  if (!overlay || overlay.isDestroyed()) {
    overlay = createOverlayWindow();
  }

  // If overlay is already visible, hide it
  if (overlay && !overlay.isDestroyed() && overlay.isVisible()) {
    overlay.hide();
    return;
  }

  // Check again before sending message to ensure window is still valid
  if (overlay && !overlay.isDestroyed()) {
    overlay.webContents.send('show-overlay', selectedText);
    overlay.show();
    overlay.focus();
  }
}

/**
 * Hide the overlay window
 * @param {BrowserWindow} overlay - Overlay window instance
 */
function hideOverlay(overlay = overlayWindow) {
    if (overlay) {
        overlay.hide();
    }
}

/**
 * Show the main window
 * @param {BrowserWindow} main - Main window instance
 */
function showMainWindow(main = mainWindow) {
    if (!main) {
        main = createMainWindow();
    }
    main.show();
    main.focus();
}

/**
 * Recreate overlay window with new settings
 */
function recreateOverlayWindow() {
    if (overlayWindow) {
        overlayWindow.close();
    }
    overlayWindow = createOverlayWindow();
    return overlayWindow;
}

/**
 * Get window position based on settings
 * @param {Object} settings - Application settings
 * @param {number} windowWidth - Window width
 * @param {number} windowHeight - Window height
 * @returns {Object} Position coordinates {x, y}
 */
function getWindowPosition(settings, windowWidth, windowHeight) {
    const display = screen.getPrimaryDisplay();
    const { width, height } = display.workAreaSize;
    
    switch (settings.overlayPosition) {
        case 'top-left':
            return { x: 20, y: 20 };
        case 'top-center':
            return { x: Math.round((width - windowWidth) / 2), y: 20 };
        case 'top-right':
            return { x: width - windowWidth - 20, y: 20 };
        case 'center-left':
            return { x: 20, y: Math.round((height - windowHeight) / 2) };
        case 'center':
            return { x: Math.round((width - windowWidth) / 2), y: Math.round((height - windowHeight) / 2) };
        case 'center-right':
            return { x: width - windowWidth - 20, y: Math.round((height - windowHeight) / 2) };
        case 'bottom-left':
            return { x: 20, y: height - windowHeight - 20 };
        case 'bottom-center':
            return { x: Math.round((width - windowWidth) / 2), y: height - windowHeight - 20 };
        case 'bottom-right':
        default:
            return { x: width - windowWidth - 20, y: height - windowHeight - 20 };
    }
}

module.exports = {
    createMainWindow,
    createOverlayWindow,
    showOverlay,
    hideOverlay,
    showMainWindow,
    recreateOverlayWindow,
    getWindowPosition,
    getMainWindow: () => mainWindow,
    getOverlayWindow: () => overlayWindow
};
