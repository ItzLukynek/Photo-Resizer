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
const resizedImages = [];
ipcMain.handle('resize-images', async (event, images, size, quality) => {
    try {
      
  
      for (const imagePath of images) {
        const image = sharp(imagePath);
        const metadata = await image.metadata();
        const width = Math.min(size, metadata.width);
  
        const { dir, name, ext } = path.parse(imagePath);
        const resizedImagePath = path.join(__dirname, 'public', 'resizedImages',name + ext);
  
        await image.resize({ width }).jpeg({ quality }).toFile(resizedImagePath);
  
        resizedImages.push({
          filename: name + ext,
          filepath: resizedImagePath,
        });
      }
  
      return resizedImages;
    } catch (error) {
      console.error(`Error resizing images: ${error.message}`);
      return null;
    }
  });
  
  ipcMain.handle('save-file', async (event, pathh, directory) => {
    try {
      const fileData = await fs.promises.readFile(pathh);
      const fileName = path.basename(pathh);
      const filePath = path.join(directory, fileName);
      await fs.promises.writeFile(filePath, fileData);
      return true;
    } catch (error) {
      console.error(`Error saving file ${pathh}: ${error.message}`);
      return false;
    }
  });
  
  ipcMain.handle('show-save-dialog', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      });
      return result;
    } catch (error) {
      console.error(`Error showing save dialog: ${error.message}`);
      return null;
    }
  });
  
  ipcMain.handle('download-images', async (event, images, directory) => {
    try {
      for (const image of images) {
        const { filename, filepath } = image;
  
        const outputPath = path.join(directory, filename);
  
        await fs.promises.copyFile(filepath, outputPath);
      }
  
      return true;
    } catch (error) {
      console.error(`Error downloading images: ${error.message}`);
      return false;
    }
  });