export default function recordsController({ state }) {
    const data = state.patient || state.mockData;
    if (!data) return;

    document.getElementById('full-id').textContent = data.id || '---';
    document.getElementById('full-name').textContent = data.name || '---';
    document.getElementById('full-dob').textContent = data.date_of_birth || '---';
    document.getElementById('full-insurance').textContent = data.insurance || '---';
    document.getElementById('full-doctor').textContent = data.primaryPhysician || '---';
    document.getElementById('vit-weight').textContent = data.weight || '---';
    document.getElementById('vit-height').textContent = data.height || '---';

    const conditionsEl = document.getElementById('full-conditions');
    const allergiesEl = document.getElementById('full-allergies');
    const medicationsEl = document.getElementById('full-medications');
    const tableEl = document.getElementById('full-data-table');

    conditionsEl.innerHTML = (data.conditions || []).map(item => `<li>${item}</li>`).join('') || '<li>None reported</li>';
    allergiesEl.innerHTML = (data.allergies || []).map(item => `<li>${item}</li>`).join('') || '<li>None reported</li>';
    medicationsEl.innerHTML = (data.medications || []).map(item => `<li>${item}</li>`).join('') || '<li>None reported</li>';

    const historyRows = [];

    if (Array.isArray(data.timeline)) {
        data.timeline.forEach(item => {
            historyRows.push({
                date: item.date,
                type: 'History',
                event: item.event,
                detail: item.desc || ''
            });
        });
    }

    if (Array.isArray(data.logs)) {
        data.logs.forEach(item => {
            historyRows.push({
                date: item.date,
                type: item.metric || 'Metric',
                event: item.metric || 'Measurement',
                detail: item.value || ''
            });
        });
    }

    historyRows.sort((a, b) => new Date(b.date) - new Date(a.date));

    tableEl.innerHTML = historyRows.map(row => `
        <tr>
            <td>${row.date}</td>
            <td>${row.type}</td>
            <td>${row.event}</td>
            <td>${row.detail}</td>
        </tr>
    `).join('') || `
        <tr>
            <td colspan="4" style="text-align: center; color: var(--text-muted);">No history available.</td>
        </tr>
    `;
}
