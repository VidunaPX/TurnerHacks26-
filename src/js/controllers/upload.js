export default function uploadController({ api, ui }) {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    const handleFile = (file) => {
        if (!file || file.type !== 'application/pdf') {
            ui.showToast('Please upload a valid PDF file.');
            return;
        }
        api.uploadFile(file);
    };

    // Prevent default behavior for drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    dropZone.addEventListener('dragover', () => dropZone.classList.add('dragover'));
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        dropZone.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
}
