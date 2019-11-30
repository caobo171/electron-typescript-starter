const {autoUpdater} = require("electron-updater");
const dialog = require("electron");
const { IS_DEV } = require("./Constants")

/**
 * @var {UpdateCheckResult} result
 */

if(!IS_DEV){
    autoUpdater.checkForUpdates().then(
        (result) => {console.log('result: ', result.updateInfo);},
        (error) => console.log('error', error));
    
    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
        console.log('update-downloaded');
    
        const dialogOpts = {
            type: 'info',
            buttons: ['Restart', 'Later'],
            title: 'Application Update',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: 'A new version has been downloaded. Restart the application to apply the updates.'
        };
    
        dialog.showMessageBox(dialogOpts, (response) => {
            if (response === 0) autoUpdater.quitAndInstall()
        })
    });
}


