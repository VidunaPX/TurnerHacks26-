import uploadController from './controllers/upload.js';
import dashboardController from './controllers/dashboard.js';
import emergencyController from './controllers/emergency.js';
import qrController from './controllers/qr.js';

const UPLOAD_API_URL = 'https://example.com/api/upload'; // Replace with your real API endpoint

// --- STATE ---
export const state = {
    
    currentRoute: null,
    patient: null,
    mockData: {
        id: "pt_884291",
        name: "Alex Morgan",
        age: "34",
        bloodType: "O+",
        conditions: ["Type 2 Diabetes", "Hypertension"],
        medications: ["Metformin 500mg (2x daily)", "Lisinopril 10mg"],
        allergies: ["Penicillin", "Peanuts"],
        timeline: [
            { date: "2023-11-10", event: "Lab Results", desc: "A1C at 6.8% - Stable." },
            { date: "2023-08-15", event: "Cardiology Consult", desc: "BP monitored, medication adjusted." },
            { date: "2023-01-20", event: "Annual Physical", desc: "General checkup completed." }
        ],
        logs: [
            { id: 1, date: "2023-11-12", metric: "Blood Sugar", value: "110 mg/dL" },
            { id: 2, date: "2023-11-11", metric: "Blood Sugar", value: "125 mg/dL" }
        ]
    }
};

function loadDashboard(data) {
    // Basic info
    document.getElementById("dash-name").textContent = data.name;
    document.getElementById("dash-age").textContent = data.age;
    document.getElementById("dash-blood").textContent = data.bloodType;

    // Conditions
    const condEl = document.getElementById("dash-conditions");
    condEl.innerHTML = data.conditions
        .map(c => `<span class="tag">${c}</span>`)
        .join(" ");

    // Allergies
    const allergyEl = document.getElementById("dash-allergies");
    allergyEl.innerHTML = data.allergies
        .map(a => `<span class="tag danger">${a}</span>`)
        .join(" ");

    // Timeline
    const timelineEl = document.getElementById("dash-timeline");
    timelineEl.innerHTML = data.timeline
        .map(t => `
            <div class="timeline-item">
                <strong>${t.date}</strong>
                <div>${t.event}</div>
                <small>${t.desc}</small>
            </div>
        `)
        .join("");

    // Logs
    const logsEl = document.getElementById("dash-logs-list");
    logsEl.innerHTML = data.logs
        .map(l => `
            <div class="log-item">
                ${l.date} — ${l.metric}: <strong>${l.value}</strong>
            </div>
        `)
        .join("");
}

// --- UI helpers ---
export const ui = {
    renderBadges: (containerId, items, colorClass) => {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = items.map(item => `<span class="stat-badge ${colorClass}">${item}</span>`).join('');
    },

    renderLogs: (stateRef) => {
        const logs = (stateRef.patient && stateRef.patient.logs) ? stateRef.patient.logs.slice().sort((a,b) => new Date(b.date) - new Date(a.date)) : [];
        const container = document.getElementById('dash-logs-list');
        if (!container) return;
        container.innerHTML = logs.map(log => `
            <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9;">
                <div>
                    <div style="font-weight: 600; font-size: 0.9rem;">${log.metric}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${log.date}</div>
                </div>
                <div style="font-weight: 700; color: var(--primary);">${log.value}</div>
            </div>
        `).join('');
    },

    showToast: (msg) => {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
};

// --- API & Utils ---
export const api = {
    mockApiCall: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    uploadFile: async (file) => {
        const dropZone = document.getElementById('drop-zone');
        const loader = document.getElementById('upload-loader');
        const loadText = document.getElementById('loading-text');
        const loadSub = document.getElementById('loading-subtext');

        if (dropZone) dropZone.style.display = 'none';
        if (loader) loader.style.display = 'block';

        if (loadText) loadText.textContent = "Uploading Medical Document...";
        if (loadSub) loadSub.textContent = "Sending file to API...";

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(UPLOAD_API_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${response.status} ${response.statusText} ${errorText}`);
            }

            const result = await response.json();
            const payload = result.patient || result.data || result;
            state.patient = payload && Object.keys(payload).length ? payload : state.mockData;
            sessionStorage.setItem('medthread_uploaded', 'true');
            ui.showToast('File uploaded successfully');
            router.navigate('dashboard');
        } catch (error) {
            console.error('Upload error', error);
            ui.showToast(error.message || 'Upload failed');
            if (window) window.location.hash = 'upload';
        } finally {
            if (loader) loader.style.display = 'none';
            if (dropZone) dropZone.style.display = 'block';
        }
    },

    addLog: (stateRef, uiRef) => {
        const date = document.getElementById('log-date').value;
        const metric = document.getElementById('log-metric').value;
        const value = document.getElementById('log-value').value;

        if (!date || !metric || !value) {
            uiRef.showToast('Please fill in all log fields');
            return;
        }

        const newLog = { id: Date.now(), date, metric, value };
        if (!stateRef.patient) stateRef.patient = { logs: [] };
        stateRef.patient.logs.push(newLog);
        
        document.getElementById('log-metric').value = '';
        document.getElementById('log-value').value = '';
        
        uiRef.renderLogs(stateRef);
        uiRef.showToast('Log entry added');
    }
};

// Router depends on controllers; we'll import them above and call their exported functions when needed
const router = {
    init: () => {
        // Handle navigation clicks
        document.querySelectorAll('[data-link]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const route = e.currentTarget.getAttribute('data-link');
                router.navigate(route);
            });
        });

        // Check initial load or hash
        if (sessionStorage.getItem('medthread_uploaded')) {
            state.patient = state.mockData;
            router.navigate('dashboard');
        } else {
            router.navigate('upload');
        }
    },

    navigate: (route) => {
        window.location.hash = route;
        state.currentRoute = route;

        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-links button').forEach(el => el.classList.remove('active'));

        const nav = document.getElementById('main-nav');

        if (route === 'emergency') {
            if (nav) nav.style.display = 'none';
            emergencyController({ state });
            document.getElementById('view-emergency').classList.add('active');
            return;
        }

        if (nav) nav.style.display = 'flex';

        const navBtn = document.getElementById(`nav-${route}`);
        if (navBtn) navBtn.classList.add('active');

        const viewEl = document.getElementById(`view-${route}`);
        if (viewEl) {
            viewEl.classList.add('active');
            if (route === 'dashboard') dashboardController({ state, ui, api });
            if (route === 'qr') qrController({ window });
            if (route === 'upload') uploadController({ api, ui });
        }
    }
};


// expose router reference for api callbacks
export { router };

// --- INITIALIZATION ---
const init = () => router.init();

document.addEventListener('DOMContentLoaded', init);
document.addEventListener("DOMContentLoaded", () => {
    loadDashboard(state.mockData);
});
