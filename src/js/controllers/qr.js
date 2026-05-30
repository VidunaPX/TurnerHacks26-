export default function qrController({ window }) {
    const baseUrl = window.location.href.split('#')[0];
    const emergencyUrl = `${baseUrl}#emergency`;
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(emergencyUrl)}`;
    document.getElementById('qr-image').src = apiUrl;
    document.getElementById('qr-link-text').textContent = emergencyUrl;
}
