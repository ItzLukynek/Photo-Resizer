const { app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')
const sharp = require('sharp')
const fs = require('fs')
const localShortcut = require('electron-localshortcut')

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
  mainWindow.maximize();
  mainWindow.setMenu(null);

  localShortcut.register(mainWindow, 'Ctrl+F12', () => {
    mainWindow.webContents.openDevTools()
  })
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

async function saveFile(pathh,directory){
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
}

async function showMessage(message, title, type) {
  const options = {
    type: type || 'info',
    title: title || '',
    message: message || '',
    buttons: ['OK'],
    defaultId: 0,
    noLink: true,
    normalizeAccessKeys: true,
    cancelId: 0,
    detail: '',
  };

  const response = await dialog.showMessageBox(options);

  return response;
}

ipcMain.handle('show-message', async (event, message, title, type) => {
  try {
    const result = await showMessage(message, title, type)
    return result;
  } catch (error) {
    console.error(`Error showing message: ${error.message}`);
    return null;
  }
});


ipcMain.handle('resize-images', async (event, images, size, quality) => {
    try {
      const resizedImages = [];

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
      let save = await saveFile(pathh,directory);
      return true
    } catch (error) {
      console.error("error saving file" + error.message)
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
  
      for (const filename of images) {
        const path = `public/resizedImages/${filename}`;
        const save = await saveFile(path,directory)
      }
      
      fs.readdir(path.join(__dirname,"public","resizedImages"), (err, files) => {
        if (err) throw err;
  
        for (const file of files) {
          fs.unlink(path.join(__dirname,"public","resizedImages", file), err => {
            if (err) throw err;
          });
        }
      });
      
      return true;
    } catch (error) {
      console.error(`Error downloading images: ${error.message}`);
      return false;
    }
  });