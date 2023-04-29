const fileInput = document.getElementById('fileInput');
const sizeInput = document.getElementById('sizeInput');
const resizeButton = document.getElementById('resizeButton');
const resultContainer = document.getElementById('resultContainer');
const downloadAllButton = document.getElementById('downloadAllButton');
const sizeSelect = document.querySelector('#sizeSelect');



sizeSelect.addEventListener('change', () => {
  sizeInput.value = sizeSelect.value;
});

let prevSelectedFiles = [];
let resizedImages = [];

fileInput.addEventListener('change', () => {
  const newSelectedFiles = Array.from(fileInput.files).map(file => file.path);
  const diff = newSelectedFiles.filter(x => !prevSelectedFiles.includes(x));
  prevSelectedFiles = newSelectedFiles;
  if (diff.length > 0) {
    resizeButton.disabled = false;
  } else {
    resizeButton.disabled = true;
  }
});

resizeButton.addEventListener('click', async () => {
  resizeButton.disabled = true;
  const quality = 100;
  const size = Number(sizeInput.value);
  resultContainer.innerHTML = "";
console.log(prevSelectedFiles)
  resizedImages = await window.api.resizeImages(prevSelectedFiles, size, quality);

  if (resizedImages) {
    downloadAllButton.disabled = false;
    let resulthtml = '';
    for (const resizedImage of resizedImages) {
      const { filename, filepath } = resizedImage;
      resulthtml += `<a href="${filepath}" download><div class="resized"><p>${filename}</p></div></a>`;
    }
    resultContainer.innerHTML = resulthtml;
  } else {
    let mess = await window.api.showMessage("Něco se posralo","Error","error")
  }
  fileInput.value = '';
  resizeButton.disabled = false;
});

downloadAllButton.addEventListener('click', async () => {
  downloadAllButton.disabled = true;
  try {
    const result = await window.api.showSaveDialog({ properties: ['openDirectory'] });
    if (!result.canceled) {
      const outputDir = result.filePaths[0];
      const filenames = resizedImages.map((image) => image.filename);
      
      const dowland = await window.api.downloadFiles(filenames,outputDir)

      let mess = await window.api.showMessage("Obrázky byly staženy","Úspěch","info")
    }
    resizedImages = [];
    
    

  } catch (error) {
    console.error(`Error saving files: ${error.message}`);
    let mess = await window.api.showMessage("Obrázky se nepodařilo uložit","Error","error")
  }
  downloadAllButton.disabled = false;
});

