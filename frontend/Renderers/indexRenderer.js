const fileInput = document.getElementById('fileInput');
const sizeInput = document.getElementById('sizeInput');
const qualityInput = document.getElementById('qualityInput');
const resizeButton = document.getElementById('resizeButton');
const resultContainer = document.getElementById('resultContainer');

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    resizeButton.disabled = false;
  } else {
    resizeButton.disabled = true;
  }
});

resizeButton.addEventListener('click', async () => {
  resizeButton.disabled = true;
  resultContainer.innerHTML = '';

  const images = Array.from(fileInput.files).map(file => file.path);
  const quality = 100;
  const size = Number(sizeInput.value);

  let resizedImages;
  resizedImages = await window.api.resizeImages(images, size, quality);

  if (resizedImages) {
    const downloadAllButton = document.createElement('button');
    downloadAllButton.textContent = 'Download All Resized Images';
    downloadAllButton.addEventListener('click', async () => {
      const { dialog } = window.api;

      // Generate a single save dialog for the user to choose the output directory
      const result = await window.api.showSaveDialog({
        properties: ['openDirectory']
      });

      if (!result.canceled) {
        const outputDir = result;
        console.log(result)

        for (const resizedImage of resizedImages) {
          const { filename, outputPath } = resizedImage;

          try {
            await window.api.saveFile(outputPath, outputDir);
          } catch (error) {
            console.error(`Error saving file ${outputPath}: ${error.message}`);
          }
        }
      }
    });
    resultContainer.appendChild(downloadAllButton);

    for (const resizedImage of resizedImages) {
      const { filename, outputPath } = resizedImage;

      const a = document.createElement('a');
      a.href = `file://${outputPath}`;
      a.download = filename;

      const imgElement = document.createElement('img');
      imgElement.src = `file://${outputPath}`;

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
