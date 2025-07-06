const fs = require('fs').promises;
const path = require('path');

// Default settings
const DEFAULT_SETTINGS = {
    overlayPosition: 'bottom-right',
    overlayOpacity: 0.95,
    autoHideDelay: 0,
    apiKeys: {
        openai: '',
        gemini: '',
        claude: '',
        ollama: ''
    },
    apiProvider: 'openai',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    shortcuts: {
        activate: 'CommandOrControl+L',
        quickHelp: 'CommandOrControl+Shift+C',
        devMode: 'F12'
    },
    customShortcuts: []
};

let currentSettings = { ...DEFAULT_SETTINGS };

/**
 * Get the settings file path
 * @returns {string} Path to settings file
 */
function getSettingsPath() {
    return path.join(__dirname, '../../../settings.json');
}

/**
 * Load settings from file
 * @returns {Promise<Object>} Current settings
 */
async function loadSettings() {
    try {
        const settingsPath = getSettingsPath();
        const data = await fs.readFile(settingsPath, 'utf8');
        const loadedSettings = JSON.parse(data);
        console.log('loadedSettings', loadedSettings)
        
        // Merge with defaults to ensure all properties exist
        currentSettings = {
            ...DEFAULT_SETTINGS,
            ...loadedSettings,
            apiKeys: { ...DEFAULT_SETTINGS.apiKeys, ...(loadedSettings.apiKeys || {}) },
            shortcuts: { ...DEFAULT_SETTINGS.shortcuts, ...(loadedSettings.shortcuts || {}) }
        };
        
        console.log('Settings loaded successfully');
        return currentSettings;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('Settings file not found, using defaults');
            await saveSettings();
        } else {
            console.error('Error loading settings:', error);
        }
        return currentSettings;
    }
}

/**
 * Save settings to file
 * @param {Object} newSettings - Settings to save (optional, uses current if not provided)
 * @returns {Promise<void>}
 */
async function saveSettings(newSettings = null) {
    try {
        if (newSettings) {
            currentSettings = {
                ...currentSettings,
                ...newSettings,
                apiKeys: { ...currentSettings.apiKeys, ...(newSettings.apiKeys || {}) },
                shortcuts: { ...currentSettings.shortcuts, ...(newSettings.shortcuts || {}) }
            };
        }
        
        const settingsPath = getSettingsPath();
        await fs.writeFile(settingsPath, JSON.stringify(currentSettings, null, 2));
        console.log('Settings saved successfully');
    } catch (error) {
        console.error('Error saving settings:', error);
        throw error;
    }
}

/**
 * Get current settings
 * @returns {Object} Current settings
 */
function getSettings() {
    return { ...currentSettings };
}

/**
 * Update specific setting
 * @param {string} key - Setting key
 * @param {any} value - Setting value
 * @returns {Promise<void>}
 */
async function updateSetting(key, value) {
    currentSettings[key] = value;
    await saveSettings();
}

/**
 * Update API key for specific provider
 * @param {string} provider - AI provider name
 * @param {string} apiKey - API key
 * @returns {Promise<void>}
 */
async function updateApiKey(provider, apiKey) {
    if (!currentSettings.apiKeys) {
        currentSettings.apiKeys = {};
    }
    currentSettings.apiKeys[provider] = apiKey;
    await saveSettings();
}

/**
 * Get API key for specific provider
 * @param {string} provider - AI provider name
 * @returns {string} API key
 */
function getApiKey(provider) {
    return currentSettings.apiKeys && currentSettings.apiKeys[provider] 
        ? currentSettings.apiKeys[provider] 
        : '';
}

/**
 * Reset settings to defaults
 * @returns {Promise<void>}
 */
async function resetSettings() {
    currentSettings = { ...DEFAULT_SETTINGS };
    await saveSettings();
}

module.exports = {
    loadSettings,
    saveSettings,
    getSettings,
    updateSetting,
    updateApiKey,
    getApiKey,
    resetSettings,
    DEFAULT_SETTINGS
};
