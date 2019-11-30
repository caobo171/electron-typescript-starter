const {app, BrowserWindow, Tray, Menu, nativeImage, dialog, session, protocol, ipcMain} = require('electron');
const electron = require('electron')
const path = require('path');
const Constants = require('./main/Constants');



app.setAppUserModelId(process.env.NODE_ENV === 'development' ? process.execPath : 'vn.base.checkin');

app.commandLine.appendSwitch('auth-server-whitelist', '*.base.vn, *.basecdn.net');

app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true
});


let tray = null;
let win = null;

const createWindow = () => {



    // Fix file:// absolute path created by React
    session.fromPartition(Constants.partition, {cache: true}).protocol.interceptFileProtocol('file', (request, callback) => {
        const url = request.url.substr(7);    /* all urls start with 'file://' */
        callback({ path: path.normalize(path.resolve(__dirname) + url)});
    }, (err) => {
        if (err) {dialog.showErrorBox('Failed to register protocol', err.toString())}
    });

    protocol.registerHttpProtocol('vn.base.checkin', (request, callback) => {
        console.log('request', request);

        return callback({uploadData: request.uploadData, url: request.url, method: request.method})
    }, error => {
        if (error) {
            console.error('Error', error)
        }
    });

    win = new BrowserWindow({
        minHeight: 820,
        minWidth: 1080,
        width: 1200,
        height: 820,
        useContentSize: true,
        icon: path.join(__dirname, 'build/icon.ico'),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            partition: Constants.partition
        }
    });

    const image = nativeImage.createFromPath(path.join(__dirname, 'build/icon.ico'));
    tray = new Tray(image);
    tray.setToolTip('Base.vn' + process.env.NODE_ENV === 'development' ? ' dev mode' : '');
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Exit', click: () => {win.destroy();app.quit();}},
        {label: 'Show',click: () => win.show()}
    ]);
    tray.setContextMenu(contextMenu);
    tray.on('click', () => win && win.show());

    win.loadURL(require('./main/getWindowLoadUrl'));

    win.webContents.openDevTools()

    win.on('close', e => {
        e.preventDefault();
        
        win.hide();
        return false;
    });

    require('./main/hotkey');
};

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, argv) => {
        if (!win) return;
        !!win.isMinimized() && win.restore();
        win.show();
        win.focus();

        if (argv[1] && argv[1].startsWith('vn.base.checkin://')) {
            ipcMain.emit('url.received', event, argv[1]);
        }
    });

    app.on('ready',createWindow);

    

    app.on('window-all-closed',app.quit);

    require('./main/autoUpdater');
}
