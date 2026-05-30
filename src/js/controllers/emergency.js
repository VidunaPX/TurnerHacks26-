export default function emergencyController({ state }) {
    const data = state.patient || state.mockData;
    if (!data) return;

    document.getElementById('emer-name').textContent = data.name;
    document.getElementById('emer-blood').textContent = data.bloodType;
    document.getElementById('emer-allergies').innerHTML = (data.allergies || []).map(a => `<li>${a}</li>`).join('');
    document.getElementById('emer-conditions').innerHTML = (data.conditions || []).map(c => `<li>${c}</li>`).join('');
    document.getElementById('emer-medications').innerHTML = (data.medications || []).map(m => `<li>${m}</li>`).join('');
}
