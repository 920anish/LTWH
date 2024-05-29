document.getElementById('fileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
  const file = event.target.files[0];
  const fileReader = new FileReader();
  fileReader.onload = function() {
    const typedarray = new Uint8Array(this.result);
    displayPDF(typedarray);
  };
  fileReader.readAsArrayBuffer(file);
}

async function displayPDF(typedarray) {
  const pdf = await pdfjsLib.getDocument(typedarray).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.0 });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: context,
    viewport: viewport
  };
  await page.render(renderContext).promise;

  const pdfViewer = document.getElementById('pdfViewer');
  pdfViewer.innerHTML = '';  
  pdfViewer.appendChild(canvas);

  document.getElementById('pdfViewerContainer').style.display = 'flex';
  document.getElementById('sidebar').classList.add('move-to-side');

  canvas.addEventListener('mousemove', function(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const coords = `L: ${x.toFixed(2)}, T: ${y.toFixed(2)}, W: ${viewport.width.toFixed(2)}, H: ${viewport.height.toFixed(2)}`;
    displayCoordinates(coords);
  });

  canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const coords = `L: ${x.toFixed(2)}, T: ${y.toFixed(2)}, W: ${viewport.width.toFixed(2)}, H: ${viewport.height.toFixed(2)}`;
    copyCoordinates(coords);
  });
}

function displayCoordinates(coords) {
  const coordinatesDiv = document.getElementById('coordinates');
  const coordsSpan = document.getElementById('coords');
  coordsSpan.innerText = coords;
  coordinatesDiv.style.display = 'block';
}

function copyCoordinates(coords) {
  const textarea = document.createElement('textarea');
  textarea.value = coords;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);

  const copySuccess = document.getElementById('copySuccess');
  copySuccess.style.display = 'block';
  setTimeout(function() {
    copySuccess.style.display = 'none';
  }, 2000);
}
