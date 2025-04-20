// Dimensi chart
const width = 500;
const height = 500;
const radius = Math.min(width, height) / 2 - 50;
const centerX = width / 2;
const centerY = height / 2;

// Elemen SVG
const svg = document.getElementById('radarChart');
svg.setAttribute('width', width);
svg.setAttribute('height', height);

// Tooltip
const tooltip = document.getElementById('tooltip');

// Elemen dropdown
const student1Select = document.getElementById('student1-select');
const student2Select = document.getElementById('student2-select');

const metricsList = ["TBP", "TUGAS", "UTS", "UAS", "TOTAL", "CPMK012", "CPMK031", "CPMK071", "CPMK072"];
const averageToggle = document.getElementById('average-toggle');
const metricsContainer = document.getElementById('metrics-checkboxes');

function createMetricCheckboxes() {
    metricsList.forEach(metric => {
        const label = document.createElement('label');
        label.style.display = 'block';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = metric;
        checkbox.checked = true;
        checkbox.addEventListener('change', drawRadarChart);
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(metric));
        metricsContainer.appendChild(label);
    });
}

function getSelectedMetrics() {
    return Array.from(metricsContainer.querySelectorAll('input:checked')).map(cb => cb.value);
}

// Populate dropdown siswa
function populateStudentDropdowns() {
    studentData.forEach(student => {
        const option1 = document.createElement('option');
        option1.value = student.ID;
        option1.textContent = student.ID;
        student1Select.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = student.ID;
        option2.textContent = student.ID;
        student2Select.appendChild(option2);
    });
}

function drawRadarChart() {
    const student1Id = student1Select.value;
    const student2Id = student2Select.value;
    const selectedMetrics = getSelectedMetrics();
    const showAverage = averageToggle.checked;

    if (selectedMetrics.length < 3) {
        alert("Please select at least 3 metrics");
        return;
    }

    const student1 = studentData.find(s => s.ID === student1Id);
    const student2 = student2Id ? studentData.find(s => s.ID === student2Id) : null;

    // Hitung rata-rata
    const averageStudent = {};
    selectedMetrics.forEach(metric => {
        const total = studentData.reduce((sum, s) => sum + (s[metric] || 0), 0);
        averageStudent[metric] = total / studentData.length;
    });
    averageStudent.ID = "Rata-rata";

    // Clear previous chart
    svg.innerHTML = '';
    drawRadarGrid(selectedMetrics);

    if (student1) drawRadarData(student1, selectedMetrics, 0);
    if (student2) drawRadarData(student2, selectedMetrics, 1);
    if (showAverage) drawRadarData(averageStudent, selectedMetrics, 2);

    updateLegend(student1, student2, showAverage ? averageStudent : null);
}

function drawRadarGrid(metrics) {
    const numMetrics = metrics.length;
    const angleStep = (2 * Math.PI) / numMetrics;
    const gridLevels = [20, 40, 60, 80, 100];

    gridLevels.forEach(level => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', centerX);
        circle.setAttribute('cy', centerY);
        circle.setAttribute('r', (level / 100) * radius);
        circle.setAttribute('class', 'grid-circle');
        svg.appendChild(circle);
    });

    metrics.forEach((metric, i) => {
        const angle = i * angleStep;
        const x = centerX + Math.sin(angle) * radius;
        const y = centerY - Math.cos(angle) * radius;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', centerX);
        line.setAttribute('y1', centerY);
        line.setAttribute('x2', x);
        line.setAttribute('y2', y);
        line.setAttribute('class', 'grid-line');
        svg.appendChild(line);

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', centerX + Math.sin(angle) * (radius + 20));
        label.setAttribute('y', centerY - Math.cos(angle) * (radius + 20));
        label.setAttribute('class', 'axis-label');
        label.setAttribute('text-anchor', 'middle');
        label.textContent = metric;
        svg.appendChild(label);
    });
}

function drawRadarData(student, metrics, studentIndex) {
    const numMetrics = metrics.length;
    const angleStep = (2 * Math.PI) / numMetrics;
    const points = [];

    metrics.forEach((metric, i) => {
        const angle = i * angleStep;
        const value = student[metric] || 0;
        const scaledRadius = (value / 100) * radius;
        const x = centerX + Math.sin(angle) * scaledRadius;
        const y = centerY - Math.cos(angle) * scaledRadius;
        points.push({x, y, metric, value});
    });

    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));
    polygon.setAttribute('fill', colors[studentIndex]);
    polygon.setAttribute('stroke', colors[studentIndex]);
    polygon.setAttribute('stroke-width', '2');
    polygon.setAttribute('fill-opacity', '0.2');
    polygon.setAttribute('data-student', student.ID);

    polygon.addEventListener('mouseover', (e) => {
        polygon.setAttribute('fill-opacity', '0.4');
        showTooltip(e, student, metrics);
    });
    polygon.addEventListener('mouseout', () => {
        polygon.setAttribute('fill-opacity', '0.2');
        tooltip.style.display = 'none';
    });

    svg.appendChild(polygon);

    points.forEach(point => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', point.x);
        circle.setAttribute('cy', point.y);
        circle.setAttribute('r', 4);
        circle.setAttribute('fill', colors[studentIndex]);
        circle.setAttribute('stroke', 'white');
        circle.setAttribute('stroke-width', '1');
        circle.setAttribute('data-metric', point.metric);
        circle.setAttribute('data-value', point.value);
        circle.setAttribute('data-student', student.ID);

        circle.addEventListener('mouseover', (e) => {
            showTooltip(e, student, metrics, point.metric);
        });
        circle.addEventListener('mouseout', () => {
            tooltip.style.display = 'none';
        });

        svg.appendChild(circle);
    });
}

function showTooltip(event, student, metrics, specificMetric = null) {
    let tooltipHTML = `<strong>Student ID:</strong> ${student.ID}<br>`;
    if (specificMetric) {
        tooltipHTML += `<strong>${specificMetric}:</strong> ${student[specificMetric].toFixed(1)}`;
    } else {
        metrics.forEach(metric => {
            tooltipHTML += `<strong>${metric}:</strong> ${student[metric].toFixed(1)}<br>`;
        });
    }
    tooltip.innerHTML = tooltipHTML;
    tooltip.style.display = 'block';
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
}

function updateLegend(student1, student2, averageStudent = null) {
    const legend = document.getElementById('legend');
    let legendHTML = '';

    if (student1) {
        legendHTML += `<div class="legend-item"><div class="legend-color" style="background-color: ${colors[0]};"></div><span>${student1.ID}</span></div>`;
    }
    if (student2) {
        legendHTML += `<div class="legend-item"><div class="legend-color" style="background-color: ${colors[1]};"></div><span>${student2.ID}</span></div>`;
    }
    if (averageStudent) {
        legendHTML += `<div class="legend-item"><div class="legend-color" style="background-color: ${colors[2]};"></div><span>${averageStudent.ID}</span></div>`;
    }
    legend.innerHTML = legendHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    populateStudentDropdowns();
    createMetricCheckboxes();
    student1Select.value = studentData[0].ID;
    drawRadarChart();
    student1Select.addEventListener('change', drawRadarChart);
    student2Select.addEventListener('change', drawRadarChart);
    averageToggle.addEventListener('change', drawRadarChart);
});