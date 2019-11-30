const { globalShortcut, ipcMain } = require('electron');

globalShortcut.register('Alt+Shift+B', () => {
    ipcMain.emit('open.window', null, 'vn.base.checkin://search', {}, {
        frame: false,
        useContentSize: true
    });
});
