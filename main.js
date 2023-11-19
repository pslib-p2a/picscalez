// Import the app and BrowserWindow modules
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const storage = require('electron-json-storage');

// Create a function to create the browser window
const createWindow = () => {
    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        icon: 'public/logo.ico',
    })

    win.loadFile('index.html')
}

// Create the window when the app is ready
app.whenReady().then(() => {
    createWindow()

    // Handle the dialog requests from the renderer process
    ipcMain.handle('dialog', (event, method, params) => {
        dialog[method](params);
    });
})

// Handle the showSaveDialog request from the renderer process
ipcMain.handle('showSaveDialog', async(event, options) => {
    return await dialog.showSaveDialog(options);
});

// Handle the showOpenDialog request from the renderer process
ipcMain.handle('showOpenDialog', async(event, options) => {
    return await dialog.showOpenDialog(options);
});

storage.setDataPath(app.getPath('userData'));

function setSaves(save) {
    return storage.set('saves', save);
}

function getSaves() {
    return storage.getSync('saves') || [];
}

ipcMain.handle('setSaves', (event, save) => {
    return setSaves(save)
});

ipcMain.handle('getSaves', (event) => {
    return getSaves()
});