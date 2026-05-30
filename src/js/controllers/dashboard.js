export default function dashboardController({ state, ui, api }) {
    const data = state.mockdata;
    if (!data) return; // caller should navigate to upload

    document.getElementById('dash-name').textContent = data.name;
    document.getElementById('dash-blood').textContent = data.bloodType;
    document.getElementById('dash-age').textContent = data.age;

    ui.renderBadges('dash-conditions', data.conditions, 'bg-blue-soft');
    ui.renderBadges('dash-allergies', data.allergies, 'bg-red-soft');
    
    // Timeline
    document.getElementById('dash-timeline').innerHTML = data.timeline.map(item => `
        <div class="timeline-item">
            <div class="timeline-date">${item.date}</div>
            <div style="font-weight: 600;">${item.event}</div>
            <div style="color: var(--text-muted);">${item.desc}</div>
        </div>
    `).join('');

    ui.renderLogs(state);

    // Bind Add Log Button
    const addBtn = document.getElementById('btn-add-log');
    addBtn.onclick = () => api.addLog(state, ui);
}
