const charts = {};
const dataPoints = {};
const maxDataPoints = 30;

function initCharts() {
    const chartConfigs = [
        { id: 'cpu', label: 'CPU %', color: '#ff6b6b' },
        { id: 'mem', label: 'Memory %', color: '#4ecdc4' },
        { id: 'netIn', label: 'Network IN KB/s', color: '#45b7d1' },
        { id: 'netOut', label: 'Network OUT KB/s', color: '#f9ca24' },
        { id: 'diskRead', label: 'Disk Read KB/s', color: '#6c5ce7' },
        { id: 'diskWrite', label: 'Disk Write KB/s', color: '#a29bfe' }
    ];

    chartConfigs.forEach(config => {
        dataPoints[config.id] = [];
        const ctx = document.getElementById(config.id + 'Chart').getContext('2d');
        charts[config.id] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: config.label,
                    data: dataPoints[config.id],
                    borderColor: config.color,
                    backgroundColor: config.color + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: '#666' },
                        grid: { color: '#222' }
                    },
                    x: {
                        ticks: { color: '#666' },
                        grid: { color: '#222' }
                    }
                }
            }
        });
    });
}

async function fetchMetrics() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();

        updateMetrics(data);
        updateCharts(data);
        updateRawOutput(data.raw);
        setStatus(true);
    } catch (error) {
        console.error('Fetch error:', error);
        setStatus(false);
    }
}

function updateMetrics(data) {
    document.getElementById('cpuValue').textContent = (data.cpu || 0).toFixed(1) + '%';
    document.getElementById('memValue').textContent = (data.mem || 0).toFixed(1) + '%';
    document.getElementById('netInValue').textContent = (data.netIn || 0).toFixed(2) + ' KB/s';
    document.getElementById('netOutValue').textContent = (data.netOut || 0).toFixed(2) + ' KB/s';
    document.getElementById('diskReadValue').textContent = (data.diskRead || 0).toFixed(2) + ' KB/s';
    document.getElementById('diskWriteValue').textContent = (data.diskWrite || 0).toFixed(2) + ' KB/s';
}

function updateCharts(data) {
    const timestamp = new Date().toLocaleTimeString();

    ['cpu', 'mem', 'netIn', 'netOut', 'diskRead', 'diskWrite'].forEach(key => {
        dataPoints[key].push(data[key] || 0);
        if (dataPoints[key].length > maxDataPoints) dataPoints[key].shift();

        charts[key].data.labels = dataPoints[key].map((_, i) => '');
        charts[key].data.datasets[0].data = dataPoints[key];
        charts[key].update('none');
    });
}

function updateRawOutput(rawData) {
    const output = document.getElementById('rawOutput');
    const lines = rawData.split('\n').slice(-10).join('\n');
    output.textContent = lines;
    output.scrollTop = output.scrollHeight;
}

function setStatus(connected) {
    const icon = document.getElementById('statusIcon');
    const text = document.getElementById('statusText');

    if (connected) {
        icon.classList.remove('disconnected');
        text.textContent = 'Connected';
    } else {
        icon.classList.add('disconnected');
        text.textContent = 'Disconnected';
    }
}

initCharts();
setInterval(fetchMetrics, 2000);
fetchMetrics();
