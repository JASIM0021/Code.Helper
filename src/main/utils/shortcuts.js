const { globalShortcut } = require('electron');
const { getSettings } = require('./settings');

/**
 * Register global shortcuts
 * @param {Function} showOverlayCallback - Callback to show overlay
 */
function registerGlobalShortcuts(showOverlayCallback) {
    // Unregister existing shortcuts first
    globalShortcut.unregisterAll();
    
    const settings = getSettings();
    const shortcuts = [
        { key: settings.shortcuts.activate, action: showOverlayCallback },
        { key: settings.shortcuts.quickHelp, action: showOverlayCallback },
        { key: settings.shortcuts.devMode, action: showOverlayCallback }
    ];
    
    // Add custom shortcuts
    if (settings.customShortcuts && settings.customShortcuts.length > 0) {
        settings.customShortcuts.forEach(shortcut => {
            if (shortcut.key) {
                shortcuts.push({ key: shortcut.key, action: showOverlayCallback });
            }
        });
    }
    
    // Register each shortcut
    shortcuts.forEach(shortcut => {
        try {
            if (shortcut.key) {
                const registered = globalShortcut.register(shortcut.key, shortcut.action);
                if (registered) {
                    console.log(`Registered shortcut: ${shortcut.key}`);
                } else {
                    console.warn(`Failed to register shortcut: ${shortcut.key}`);
                }
            }
        } catch (error) {
            console.error(`Error registering shortcut ${shortcut.key}:`, error.message);
        }
    });
}

/**
 * Unregister all shortcuts
 */
function unregisterAllShortcuts() {
    globalShortcut.unregisterAll();
    console.log('All shortcuts unregistered');
}

/**
 * Check if shortcut is registered
 * @param {string} accelerator - Shortcut key combination
 * @returns {boolean} Whether shortcut is registered
 */
function isShortcutRegistered(accelerator) {
    return globalShortcut.isRegistered(accelerator);
}

/**
 * Get all registered shortcuts
 * @returns {Array} Array of registered shortcuts
 */
function getRegisteredShortcuts() {
    const settings = getSettings();
    const shortcuts = [];
    
    if (settings.shortcuts) {
        Object.entries(settings.shortcuts).forEach(([name, key]) => {
            if (key && isShortcutRegistered(key)) {
                shortcuts.push({ name, key, registered: true });
            }
        });
    }
    
    if (settings.customShortcuts) {
        settings.customShortcuts.forEach((shortcut, index) => {
            if (shortcut.key && isShortcutRegistered(shortcut.key)) {
                shortcuts.push({ 
                    name: shortcut.description || `Custom ${index + 1}`, 
                    key: shortcut.key, 
                    registered: true 
                });
            }
        });
    }
    
    return shortcuts;
}

/**
 * Validate shortcut format
 * @param {string} accelerator - Shortcut key combination
 * @returns {boolean} Whether shortcut format is valid
 */
function validateShortcut(accelerator) {
    if (!accelerator || typeof accelerator !== 'string') {
        return false;
    }
    
    try {
        // Try to register temporarily to validate format
        const tempCallback = () => {};
        const registered = globalShortcut.register(accelerator, tempCallback);
        if (registered) {
            globalShortcut.unregister(accelerator);
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

module.exports = {
    registerGlobalShortcuts,
    unregisterAllShortcuts,
    isShortcutRegistered,
    getRegisteredShortcuts,
    validateShortcut
};
