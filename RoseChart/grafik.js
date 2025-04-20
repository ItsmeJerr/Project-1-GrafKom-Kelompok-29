// Chart dimensions
const width = 650;
const height = 650;
const radius = Math.min(width, height) / 2 - 70;
const centerX = width / 2;
const centerY = height / 2;

// SVG container
const svg = document.getElementById('roseChart');
svg.setAttribute('width', width);
svg.setAttribute('height', height);

// Tooltip
const tooltip = document.getElementById('tooltip');

// Select elements
const studentSelect = document.getElementById('student-select');
const dataViewSelect = document.getElementById('data-view');
const viewModeSelect = document.getElementById('view-mode');

// Get grade from score
function getGrade(score) {
    if (score >= 85) return 'A';
    if (score >= 70) return 'B';
    if (score >= 55) return 'C';
    if (score >= 40) return 'D';
    return 'E';
}

function getColorByValue(value) {
    const hue = (value / 100) * 120;
    return `hsl(${hue}, 90%, 60%)`;
}

// Populate student dropdown
function populateStudentDropdown() {
    studentData.forEach(student => {
        const option = document.createElement('option');
        option.value = student.ID;
        option.textContent = student.ID;
        studentSelect.appendChild(option);
    });
}

function updatePerformanceTable(student) {
    const tableBody = document.querySelector('#performance-table tbody');
    tableBody.innerHTML = '';
    
    const dataView = dataViewSelect.value;
    let categories = [];
    
    if (dataView === 'basic') {
        categories = ['TBP', 'TUGAS', 'UTS', 'UAS', 'TOTAL'];
    } else if (dataView === 'cpmk') {
        categories = Object.keys(student).filter(key => key.startsWith('CPMK'));
    } else {
        categories = Object.keys(student).filter(key => key !== 'ID');
    }

    categories.forEach(category => {
        const value = student[category];
        if (typeof value !== 'number') return;
        
        const grade = getGrade(value);
        const row = document.createElement('tr');

        const tdCategory = document.createElement('td');
        tdCategory.textContent = category;

        const tdValue = document.createElement('td');
        tdValue.textContent = value.toFixed(1);

        const tdGrade = document.createElement('td');
        tdGrade.textContent = grade;
        tdGrade.style.color = getColorByValue(value);
        tdGrade.style.fontWeight = 'bold';

        row.appendChild(tdCategory);
        row.appendChild(tdValue);
        row.appendChild(tdGrade);

        tableBody.appendChild(row);
    });
}

// Draw the rose chart axes and grid
function drawChartBase(categories) {
    svg.innerHTML = '';

    // Add shadow filter
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'petal-shadow');
    filter.setAttribute('x', '-20%');
    filter.setAttribute('y', '-20%');
    filter.setAttribute('width', '140%');
    filter.setAttribute('height', '140%');
    
    const feDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
    feDropShadow.setAttribute('dx', '2');
    feDropShadow.setAttribute('dy', '2');
    feDropShadow.setAttribute('stdDeviation', '2');
    feDropShadow.setAttribute('flood-color', 'rgba(0,0,0,0.3)');
    
    filter.appendChild(feDropShadow);
    defs.appendChild(filter);
    svg.appendChild(defs);
    
    const numCategories = categories.length;
    if (numCategories === 0) return;
    
    const angleStep = (2 * Math.PI) / numCategories;

    // Draw the radial axes
    for (let i = 0; i < numCategories; i++) {
        const angle = i * angleStep;
        const x = centerX + Math.sin(angle) * radius;
        const y = centerY - Math.cos(angle) * radius;

        const axisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        axisLine.setAttribute('x1', centerX);
        axisLine.setAttribute('y1', centerY);
        axisLine.setAttribute('x2', x);
        axisLine.setAttribute('y2', y);
        axisLine.setAttribute('stroke', '#e0e0e0');
        axisLine.setAttribute('stroke-width', '1.5');
        svg.appendChild(axisLine);

        // Label positioning
        const labelRadius = radius + 50;
        const labelX = centerX + Math.sin(angle) * labelRadius;
        const labelY = centerY - Math.cos(angle) * labelRadius;
        
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', labelX);
        label.setAttribute('y', labelY);
        label.setAttribute('class', 'axis-label');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('dominant-baseline', 'middle');
        
        const angleDeg = (angle * 180 / Math.PI);
        if (angleDeg > 90 && angleDeg < 270) {
            label.setAttribute('transform', `rotate(180 ${labelX} ${labelY})`);
            label.setAttribute('text-anchor', 'end');
        }
        
        label.setAttribute('font-size', categories[i].length > 6 ? '11px' : '13px');
        label.textContent = categories[i];
        svg.appendChild(label);
    }

    // Draw concentric circles
    const gridLevels = [20, 40, 60, 80, 100];
    gridLevels.forEach(level => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', centerX);
        circle.setAttribute('cy', centerY);
        circle.setAttribute('r', (level / 100) * radius);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', level % 20 === 0 ? '#ddd' : '#eee');
        circle.setAttribute('stroke-width', level % 20 === 0 ? '1.5' : '1');
        svg.appendChild(circle);

        if (level % 20 === 0) {
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', centerX + 8);
            label.setAttribute('y', centerY - (level / 100) * radius + 5);
            label.setAttribute('font-size', '12px');
            label.setAttribute('font-weight', 'bold');
            label.setAttribute('fill', '#666');
            label.textContent = level;
            svg.appendChild(label);
        }
    });

    return angleStep;
}

function drawStudentRoseChart() {
    const studentId = studentSelect.value;
    const student = studentData.find(s => s.ID === studentId);
    if (!student) return;

    const dataView = dataViewSelect.value;
    let categories = [];
    
    if (dataView === 'basic') {
        categories = ['TBP', 'TUGAS', 'UTS', 'UAS', 'TOTAL'];
    } else if (dataView === 'cpmk') {
        categories = Object.keys(student).filter(key => key.startsWith('CPMK'));
    } else {
        categories = Object.keys(student).filter(key => key !== 'ID');
    }
    
    const angleStep = drawChartBase(categories);
    const petalGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(petalGroup);

    categories.forEach((category, i) => {
        const angle = i * angleStep;
        const value = student[category];
        if (typeof value !== 'number') return;
        
        const scaledRadius = (value / 100) * radius;
        const points = [];
        const petalAngleStep = angleStep / 10;
        const petalWidth = angleStep * 0.7;

        for (let a = angle - petalWidth / 2; a <= angle + petalWidth / 2; a += petalAngleStep) {
            points.push(`${centerX + Math.sin(a) * scaledRadius},${centerY - Math.cos(a) * scaledRadius}`);
        }
        points.push(`${centerX},${centerY}`);

        const petal = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        petal.setAttribute('points', points.join(' '));
        petal.setAttribute('fill', getColorByValue(value));
        petal.setAttribute('stroke', 'white');
        petal.setAttribute('stroke-width', '2');
        petal.setAttribute('opacity', '0.9');
        petal.setAttribute('filter', 'url(#petal-shadow)');
        petal.setAttribute('stroke-linejoin', 'round');

        petal.addEventListener('mouseover', (e) => {
            petal.setAttribute('opacity', '1');
            petal.setAttribute('stroke', '#333');
            petal.setAttribute('stroke-width', '3');
            
            tooltip.innerHTML = `
                <div style="font-size:15px; font-weight:bold; margin-bottom:8px; color:${getColorByValue(value)}">
                    ${category}: ${value.toFixed(1)} (${getGrade(value)})
                </div>
                <div style="font-size:13px;">
                    Student ID: ${student.ID}
                </div>
            `;
            tooltip.style.display = 'block';
            tooltip.style.left = `${e.clientX + 25}px`;
            tooltip.style.top = `${e.clientY + 25}px`;
        });

        petal.addEventListener('mouseout', () => {
            petal.setAttribute('opacity', '0.9');
            petal.setAttribute('stroke', 'white');
            petal.setAttribute('stroke-width', '2');
            tooltip.style.display = 'none';
        });

        petalGroup.appendChild(petal);
    });

    // Center circle
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', centerX);
    centerCircle.setAttribute('cy', centerY);
    centerCircle.setAttribute('r', 15);
    centerCircle.setAttribute('fill', '#2c3e50');
    centerCircle.setAttribute('filter', 'url(#petal-shadow)');
    svg.appendChild(centerCircle);

    // Center text
    const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerText.setAttribute('x', centerX);
    centerText.setAttribute('y', centerY + 6);
    centerText.setAttribute('text-anchor', 'middle');
    centerText.setAttribute('fill', 'white');
    centerText.setAttribute('font-size', '16px');
    centerText.setAttribute('font-weight', 'bold');
    centerText.textContent = studentId;
    svg.appendChild(centerText);

    updatePerformanceTable(student);
    updateLegend();
}

function drawStatisticsRoseChart() {
    const dataView = dataViewSelect.value;
    let categories = [];
    
    if (dataView === 'basic') {
        categories = ['TBP', 'TUGAS', 'UTS', 'UAS', 'TOTAL'];
    } else if (dataView === 'cpmk') {
        categories = Object.keys(studentData[0]).filter(key => key.startsWith('CPMK'));
    } else {
        categories = Object.keys(studentData[0]).filter(key => key !== 'ID');
    }
    
    const angleStep = drawChartBase(categories);
    
    // Calculate statistics for each category
    const stats = {};
    categories.forEach(category => {
        const values = studentData.map(s => s[category]).filter(v => typeof v === 'number');
        if (values.length === 0) return;
        
        stats[category] = {
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            max: Math.max(...values),
            min: Math.min(...values)
        };
    });
    
    // Draw petals for average values
    const avgPetalGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(avgPetalGroup);
    
    categories.forEach((category, i) => {
        if (!stats[category]) return;
        
        const angle = i * angleStep;
        const value = stats[category].avg;
        
        // Draw average petal
        const scaledRadius = (value / 100) * radius;
        const points = [];
        const petalAngleStep = angleStep / 10;
        const petalWidth = angleStep * 0.7;

        for (let a = angle - petalWidth / 2; a <= angle + petalWidth / 2; a += petalAngleStep) {
            points.push(`${centerX + Math.sin(a) * scaledRadius},${centerY - Math.cos(a) * scaledRadius}`);
        }
        points.push(`${centerX},${centerY}`);

        const avgPetal = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        avgPetal.setAttribute('points', points.join(' '));
        avgPetal.setAttribute('fill', getColorByValue(value));
        avgPetal.setAttribute('stroke', 'white');
        avgPetal.setAttribute('stroke-width', '2');
        avgPetal.setAttribute('opacity', '0.9');
        avgPetal.setAttribute('filter', 'url(#petal-shadow)');
        avgPetal.setAttribute('stroke-linejoin', 'round');

        avgPetal.addEventListener('mouseover', (e) => {
            avgPetal.setAttribute('opacity', '1');
            avgPetal.setAttribute('stroke', '#333');
            avgPetal.setAttribute('stroke-width', '3');
            
            tooltip.innerHTML = `
                <div style="font-size:15px; font-weight:bold; margin-bottom:8px; color:${getColorByValue(value)}">
                    ${category}
                </div>
                <div style="font-size:14px; margin-bottom:5px;">
                    <strong>Average:</strong> ${value.toFixed(1)}
                </div>
            `;
            tooltip.style.display = 'block';
            tooltip.style.left = `${e.clientX + 25}px`;
            tooltip.style.top = `${e.clientY + 25}px`;
        });

        avgPetal.addEventListener('mouseout', () => {
            avgPetal.setAttribute('opacity', '0.9');
            avgPetal.setAttribute('stroke', 'white');
            avgPetal.setAttribute('stroke-width', '2');
            tooltip.style.display = 'none';
        });

        avgPetalGroup.appendChild(avgPetal);
    });
    
    // Center circle
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', centerX);
    centerCircle.setAttribute('cy', centerY);
    centerCircle.setAttribute('r', 15);
    centerCircle.setAttribute('fill', '#2c3e50');
    centerCircle.setAttribute('filter', 'url(#petal-shadow)');
    svg.appendChild(centerCircle);

    // Center text
    const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerText.setAttribute('x', centerX);
    centerText.setAttribute('y', centerY + 6);
    centerText.setAttribute('text-anchor', 'middle');
    centerText.setAttribute('fill', 'white');
    centerText.setAttribute('font-size', '14px');
    centerText.setAttribute('font-weight', 'bold');
    centerText.textContent = 'STATS';
    svg.appendChild(centerText);
    
    // Update statistics table
    updateStatisticsTable(categories, stats);
    updateLegend();
}

function updateStatisticsTable(categories, stats) {
    const tableBody = document.querySelector('#performance-table tbody');
    tableBody.innerHTML = '';
    
    categories.forEach(category => {
        if (!stats[category]) return;
        
        const avg = stats[category].avg;
        const max = stats[category].max;
        const min = stats[category].min;
        
        // Create header row for category
        const headerRow = document.createElement('tr');
        const tdHeader = document.createElement('td');
        tdHeader.textContent = category;
        tdHeader.setAttribute('colspan', '3');
        tdHeader.style.fontWeight = 'bold';
        tdHeader.style.backgroundColor = '#f8f9fa';
        headerRow.appendChild(tdHeader);
        tableBody.appendChild(headerRow);
        
        // Row for average
        const avgRow = document.createElement('tr');
        
        const tdAvgLabel = document.createElement('td');
        tdAvgLabel.textContent = 'Average';
        
        const tdAvgValue = document.createElement('td');
        tdAvgValue.textContent = avg.toFixed(1);
        tdAvgValue.style.color = getColorByValue(avg);
        tdAvgValue.style.fontWeight = 'bold';
        
        avgRow.appendChild(tdAvgLabel);
        avgRow.appendChild(tdAvgValue);
        tableBody.appendChild(avgRow);
        
        // Row for maximum
        const maxRow = document.createElement('tr');
        
        const tdMaxLabel = document.createElement('td');
        tdMaxLabel.textContent = 'Maximum';
        
        const tdMaxValue = document.createElement('td');
        tdMaxValue.textContent = max.toFixed(1);
        tdMaxValue.style.color = getColorByValue(max);
        
        maxRow.appendChild(tdMaxLabel);
        maxRow.appendChild(tdMaxValue);
        tableBody.appendChild(maxRow);
        
        // Row for minimum
        const minRow = document.createElement('tr');
        
        const tdMinLabel = document.createElement('td');
        tdMinLabel.textContent = 'Minimum';
        
        const tdMinValue = document.createElement('td');
        tdMinValue.textContent = min.toFixed(1);
        tdMinValue.style.color = getColorByValue(min);
        
        minRow.appendChild(tdMinLabel);
        minRow.appendChild(tdMinValue);
        tableBody.appendChild(minRow);
        
        // Add spacer between categories
        const spacerRow = document.createElement('tr');
        const spacerTd = document.createElement('td');
        spacerTd.setAttribute('colspan', '3');
        spacerTd.style.height = '10px';
        tableBody.appendChild(spacerRow);
    });
}

function updateLegend() {
    const legend = document.getElementById('legend');
    
    legend.innerHTML = `
        <div class="legend-item">
            <div class="legend-color" style="background-color: hsl(0, 90%, 60%);"></div>
            <span>Low (0-40)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: hsl(60, 90%, 60%);"></div>
            <span>Medium (41-70)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: hsl(120, 90%, 60%);"></div>
            <span>High (71-100)</span>
        </div>
    `;
}

function updateChart() {
    const viewMode = viewModeSelect.value;
    
    if (viewMode === 'student') {
        studentSelect.disabled = false;
        drawStudentRoseChart();
    } else {
        studentSelect.disabled = true;
        drawStatisticsRoseChart();
    }
}

// Initialize the page
function init() {
    populateStudentDropdown();
    
    studentSelect.addEventListener('change', updateChart);
    dataViewSelect.addEventListener('change', updateChart);
    viewModeSelect.addEventListener('change', updateChart);
    
    updateChart();
}

document.addEventListener('DOMContentLoaded', init);