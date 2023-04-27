const fileInput = document.getElementById('fileInput');
const sizeInput = document.getElementById('sizeInput');
const resizeButton = document.getElementById('resizeButton');
const resultContainer = document.getElementById('resultContainer');
const downloadAllButton = document.getElementById('downloadAllButton');

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    resizeButton.disabled = false;
  } else {
    resizeButton.disabled = true;
  }
});
let resizedImages;

resizeButton.addEventListener('click', async () => {
  resizeButton.disabled = true;
  resultContainer.innerHTML = '';

  const images = Array.from(fileInput.files).map(file => file.path);
  const quality = 100;
  const size = Number(sizeInput.value);

  
  resizedImages = await window.api.resizeImages(images, size, quality);

  if (resizedImages) {
    downloadAllButton.disabled = false;

    for (const resizedImage of resizedImages) {
      const { filename, filepath } = resizedImage;

      const a = document.createElement('a');
      a.href = filepath;
      a.download = filename;

      const imgElement = document.createElement('img');
      imgElement.src = filepath;

      const filenameElement = document.createElement('div');
      filenameElement.textContent = filename;

      resultContainer.appendChild(a);
      a.appendChild(imgElement);
      resultContainer.appendChild(filenameElement);
    }
  } else {
    const errorElement = document.createElement('div');
    errorElement.textContent = 'Error resizing images.';
    resultContainer.appendChild(errorElement);
  }

  resizeButton.disabled = false;
});

downloadAllButton.addEventListener('click', async () => {
  downloadAllButton.disabled = true;

  try {
    const result = await window.api.showSaveDialog({ properties: ['openDirectory'] });

    if (!result.canceled) {
      const outputDir = result.filePaths[0];

      const filenames = resizedImages.map((image) => image.filename);

      for (const filename of filenames) {
        const path = `public/resizedImages/${filename}`;
        await window.api.saveFile(path, outputDir);
      }
    }
  } catch (error) {
    console.error(`Error saving files: ${error.message}`);
  }

  downloadAllButton.disabled = false;
});
