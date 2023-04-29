const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  resizeImages: async (images, size, quality) => {
    try {
      const resizedImages = await ipcRenderer.invoke('resize-images', images, size, quality);
      return resizedImages;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  showSaveDialog: async () => {
    try {
      const result = await ipcRenderer.invoke('show-save-dialog');
      return result;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  saveFile: async (path, directory) => {
    try {
      const result = await ipcRenderer.invoke('save-file', path, directory);
      return result;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  downloadFiles: async (filePaths, outputDir) => {
    try {
      const result = await ipcRenderer.invoke('download-images', filePaths, outputDir);
      return result;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  showMessage: async (message,title,type) =>{
    try {
      const result = await ipcRenderer.invoke("show-message",message,title,type)
      return result;
    } catch (error) {
      console.error(e)
      return false;
    }
  }
});