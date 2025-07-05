const { ipcMain, clipboard } = require('electron');
const { saveSettings, getSettings } = require('../utils/settings');
const { registerGlobalShortcuts } = require('../utils/shortcuts');
const { recreateOverlayWindow, showOverlay, hideOverlay, showMainWindow } = require('../windows/window-manager');
const { generateCodeWithAI } = require('../ai-providers/ai-manager');
const { analyzeCode } = require('../utils/code-analyzer');

const robot = require('robotjs');

/**
 * Setup IPC handlers for communication between main and renderer processes
 * @param {BrowserWindow} mainWindow - Main window instance
 * @param {BrowserWindow} overlayWindow - Overlay window instance
 */
function setupIpcHandlers(mainWindow, overlayWindow) {
    // Settings handlers
    ipcMain.on('get-settings', (event) => {
        const settings = getSettings();
        event.reply('settings-data', settings);
    });

    ipcMain.on('save-settings', async (event, newSettings) => {
        try {
            await saveSettings(newSettings);
            event.reply('settings-saved');
        } catch (error) {
            event.reply('settings-error', error.message);
        }
    });

    // Overlay management
    ipcMain.on('hide-overlay', () => {
        hideOverlay(overlayWindow);
    });

    ipcMain.on('show-main-window', () => {
        showMainWindow(mainWindow);
    });

    // Clipboard operations
    ipcMain.on('copy-to-clipboard', (event, text) => {
        clipboard.writeText(text);
    });

    // Overlay position update
    ipcMain.on('update-overlay-position', async (event, position) => {
        try {
            await saveSettings({ overlayPosition: position });
            overlayWindow = recreateOverlayWindow();
        } catch (error) {
            console.error('Failed to update overlay position:', error);
        }
    });

    // Overlay settings
    ipcMain.on('save-overlay-settings', async (event, overlaySettings) => {
        try {
            await saveSettings(overlaySettings);
            
            // Apply overlay settings
            if (overlayWindow) {
                overlayWindow.setOpacity(overlaySettings.overlayOpacity || 0.95);
                
                // Recreate with new position if changed
                if (overlaySettings.overlayPosition) {
                    overlayWindow = recreateOverlayWindow();
                }
            }
            
            event.reply('overlay-settings-saved');
        } catch (error) {
            event.reply('overlay-settings-error', error.message);
        }
    });

    // Shortcut settings
    ipcMain.on('save-shortcut-settings', async (event, shortcutSettings) => {
        try {
            await saveSettings(shortcutSettings);
            
            // Re-register shortcuts
            registerGlobalShortcuts(() => showOverlay(overlayWindow));
            
            event.reply('shortcut-settings-saved');
        } catch (error) {
            event.reply('shortcut-settings-error', error.message);
        }
    });

    // Code analysis
    ipcMain.on('analyze-code', (event, code) => {
        try {
            const analysis = analyzeCode(code);
            event.reply('code-analysis', analysis);
        } catch (error) {
            console.error('Code analysis error:', error);
            event.reply('code-analysis-error', error.message);
        }
    });

    // AI code generation

  
  
  ipcMain.on('generate-code', async (event, { prompt, code, context }) => {
        try {
            const response = await generateCodeWithAI(prompt, code, context);
            event.reply('code-generated', response);
        } catch (error) {
            console.error('Code generation error:', error);
            event.reply('code-generation-error', error.message);
        }
    });
  
 ipcMain.on('apply-code', (event, code) => {
   // 1. Copy code to clipboard
   clipboard.writeText(code);
   const settings = getSettings();
   robot.moveMouse(settings.pos.x, settings.pos.y);
   robot.mouseClick();
   const lines = code.split('\n');
   robot.setKeyboardDelay(30); // 20ms per keystroke

  //  lines.forEach((line, index) => {
  //    robot.typeString(line);
  //    if (index < lines.length - 1) {
  //      robot.keyTap('enter'); // Add line break
  //    }
  //  });


   clipboard.writeText(code);
   robot.keyTap('v', process.platform === 'darwin' ? 'command' : 'control');

 });


    console.log('IPC handlers setup complete');
}

module.exports = {
    setupIpcHandlers
};
