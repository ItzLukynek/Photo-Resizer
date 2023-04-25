const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const sharp = require('sharp')
const fs = require('fs')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'backend/preload/indexPreload.js'),
      contextIsolation: true,
      worldSafeExecuteJavaScript: true
    }
  })

  mainWindow.loadFile('frontend/view/index.html')
  mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('resize-images', async (event, images, size, quality) => {
  const promises = images.map(async (image) => {
    try {
      const imageBuffer = await sharp(image)
        .resize({ width: size })
        .jpeg({ quality })
        .toBuffer();

      const outputPath = path.join(
        path.dirname(image),
        path.parse(image).name + '_resized.jpg'
      );

      fs.writeFileSync(outputPath, imageBuffer);

      return { filename: path.basename(image), outputPath };
    } catch (e) {
      console.error(e);
      return null;
    }
  });

  const resizedImages = await Promise.all(promises);

  return resizedImages.filter((ri) => ri !== null);
});

ipcMain.handle('show-save-dialog', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  } else {
    return null;
  }
});

ipcMain.handle('save-file', async (event, pathh, directory) => {
  try {
    const fileData = await fs.promises.readFile(pathh);
    const filePath = directory;
    console.log(pathh)
    console.log(directory)
    await fs.promises.writeFile(filePath, fileData);
    return true;
  } catch (error) {
    console.error(`Error saving file ${pathh}: ${error.message}`);
    return false;
  }
});
