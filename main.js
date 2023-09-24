const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const createWindow = () => {
    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,

            //preload: path.resolve(app.getAppPath(), 'preload.js')
        }
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()
    ipcMain.handle('dialog', (event, method, params) => {
        dialog[method](params);
    });
})


ipcMain.handle('showSaveDialog', async(event, options) => {
    return await dialog.showSaveDialog(options);
});
ipcMain.handle('showOpenDialog', async(event, options) => {
    return await dialog.showOpenDialog(options);
});