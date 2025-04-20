// Main application
document.addEventListener('DOMContentLoaded', () => {
    // SVG container
    const svg = document.getElementById('bubbleChart');
    svg.setAttribute('width', chartConfig.width);
    svg.setAttribute('height', chartConfig.height);

    // Store original viewBox for reset
    const originalViewBox = `0 0 ${chartConfig.width} ${chartConfig.height}`;
    svg.setAttribute('viewBox', originalViewBox);

    // Tooltip
    const tooltip = document.getElementById('tooltip');

    // Search elements
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchButton = document.getElementById('search-button');
    const resetZoomButton = document.getElementById('reset-zoom');

    // Initialize chart
    drawChart();

    // Event listeners for controls
    document.getElementById('x-axis').addEventListener('change', drawChart);
    document.getElementById('y-axis').addEventListener('change', drawChart);
    document.getElementById('bubble-size').addEventListener('change', drawChart);
    document.getElementById('min-score').addEventListener('change', drawChart);
    
    // Event listeners for search
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Auto-show search results as user types
    searchInput.addEventListener('input', (e) => showSearchResults(e.target.value));
    
    // Hide search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
    
    // Reset zoom button
    resetZoomButton.addEventListener('click', resetZoom);

    // Function to reset zoom
    function resetZoom() {
        svg.setAttribute('viewBox', originalViewBox);
        
        // Remove highlights
        const circles = svg.querySelectorAll('circle');
        circles.forEach(circle => {
            circle.classList.remove('highlight');
            circle.setAttribute('stroke', 'black');
            circle.setAttribute('stroke-width', '1');
        });
        
        tooltip.style.display = 'none';
    }

    // Function to draw the chart
    function drawChart() {
        const xAxis = document.getElementById('x-axis').value;
        const yAxis = document.getElementById('y-axis').value;
        const bubbleSize = document.getElementById('bubble-size').value;
        const minScore = parseInt(document.getElementById('min-score').value);
        
        // Filter data
        const filteredData = studentData.filter(student => 
            student[xAxis] >= minScore && student[yAxis] >= minScore
        );
        
        // Clear previous chart
        svg.innerHTML = '';
        svg.setAttribute('viewBox', originalViewBox); // Reset viewBox
        
        // Calculate scales
        const xScale = (value) => chartConfig.margin.left + (value / 100) * 
            (chartConfig.width - chartConfig.margin.left - chartConfig.margin.right);
        const yScale = (value) => chartConfig.height - chartConfig.margin.bottom - 
            (value / 100) * (chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom);
        const radiusScale = (value) => Math.max(5, value / 5); // Adjust bubble size
        
        // Draw X and Y axes
        drawAxis(xAxis, yAxis);
        
        // Draw bubbles
        filteredData.forEach(student => {
            const x = xScale(student[xAxis]);
            const y = yScale(student[yAxis]);
            const r = radiusScale(student[bubbleSize]);
            const color = getColor(student.TOTAL);
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', r);
            circle.setAttribute('fill', color);
            circle.setAttribute('stroke', 'black');
            circle.setAttribute('stroke-width', '1');
            circle.setAttribute('data-id', student.ID);
            
            // Add hover effects
            circle.addEventListener('mouseover', (e) => {
                tooltip.innerHTML = `
                    <strong>ID:</strong> ${student.ID}<br>
                    <strong>${xAxis}:</strong> ${student[xAxis].toFixed(1)}<br>
                    <strong>${yAxis}:</strong> ${student[yAxis].toFixed(1)}<br>
                    <strong>Total:</strong> ${student.TOTAL.toFixed(1)}<br>
                    <strong>${bubbleSize}:</strong> ${student[bubbleSize]}
                `;
                tooltip.style.display = 'block';
                tooltip.style.left = `${e.clientX + 10}px`;
                tooltip.style.top = `${e.clientY + 10}px`;
            });
            
            circle.addEventListener('mouseout', () => {
                tooltip.style.display = 'none';
            });
            
            circle.addEventListener('click', () => {
                highlightStudent(student.ID);
            });
            
            svg.appendChild(circle);
        });
        
        // Update legend and statistics
        updateLegend();
        updateStatistics();
    }
    
    // Draw X and Y axes with labels
    function drawAxis(xAxis, yAxis) {
        // X axis line
        const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxisLine.setAttribute('x1', chartConfig.margin.left);
        xAxisLine.setAttribute('y1', chartConfig.height - chartConfig.margin.bottom);
        xAxisLine.setAttribute('x2', chartConfig.width - chartConfig.margin.right);
        xAxisLine.setAttribute('y2', chartConfig.height - chartConfig.margin.bottom);
        xAxisLine.setAttribute('stroke', 'black');
        xAxisLine.setAttribute('stroke-width', '2');
        svg.appendChild(xAxisLine);
        
        // Y axis line
        const yAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxisLine.setAttribute('x1', chartConfig.margin.left);
        yAxisLine.setAttribute('y1', chartConfig.margin.top);
        yAxisLine.setAttribute('x2', chartConfig.margin.left);
        yAxisLine.setAttribute('y2', chartConfig.height - chartConfig.margin.bottom);
        yAxisLine.setAttribute('stroke', 'black');
        yAxisLine.setAttribute('stroke-width', '2');
        svg.appendChild(yAxisLine);
        
        // X axis label
        const xAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xAxisLabel.setAttribute('x', chartConfig.width / 2);
        xAxisLabel.setAttribute('y', chartConfig.height - 10);
        xAxisLabel.setAttribute('text-anchor', 'middle');
        xAxisLabel.setAttribute('class', 'axis-label');
        xAxisLabel.textContent = getAxisLabel(xAxis);
        svg.appendChild(xAxisLabel);
        
        // Y axis label
        const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yAxisLabel.setAttribute('x', -chartConfig.height / 2);
        yAxisLabel.setAttribute('y', 20);
        yAxisLabel.setAttribute('transform', 'rotate(-90)');
        yAxisLabel.setAttribute('text-anchor', 'middle');
        yAxisLabel.setAttribute('class', 'axis-label');
        yAxisLabel.textContent = getAxisLabel(yAxis);
        svg.appendChild(yAxisLabel);
        
        // Add tick marks and labels for X axis
        for (let i = 0; i <= 100; i += 20) {
            const x = chartConfig.margin.left + (i / 100) * 
                (chartConfig.width - chartConfig.margin.left - chartConfig.margin.right);
            
            // Tick mark
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tick.setAttribute('x1', x);
            tick.setAttribute('y1', chartConfig.height - chartConfig.margin.bottom);
            tick.setAttribute('x2', x);
            tick.setAttribute('y2', chartConfig.height - chartConfig.margin.bottom + 5);
            tick.setAttribute('stroke', 'black');
            svg.appendChild(tick);
            
            // Label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', chartConfig.height - chartConfig.margin.bottom + 20);
            label.setAttribute('text-anchor', 'middle');
            label.textContent = i;
            svg.appendChild(label);
        }
        
        // Add tick marks and labels for Y axis
        for (let i = 0; i <= 100; i += 20) {
            const y = chartConfig.height - chartConfig.margin.bottom - 
                (i / 100) * (chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom);
            
            // Tick mark
            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tick.setAttribute('x1', chartConfig.margin.left);
            tick.setAttribute('y1', y);
            tick.setAttribute('x2', chartConfig.margin.left - 5);
            tick.setAttribute('y2', y);
            tick.setAttribute('stroke', 'black');
            svg.appendChild(tick);
            
            // Label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', chartConfig.margin.left - 10);
            label.setAttribute('y', y + 5);
            label.setAttribute('text-anchor', 'end');
            label.textContent = i;
            svg.appendChild(label);
        }
    }
    
    // Function to highlight a specific student
    function highlightStudent(studentId) {
        // Remove any existing highlights
        const circles = svg.querySelectorAll('circle');
        circles.forEach(circle => {
            circle.classList.remove('highlight');
            circle.setAttribute('stroke', 'black');
            circle.setAttribute('stroke-width', '1');
        });
        
        // Find and highlight the student
        const studentCircle = svg.querySelector(`circle[data-id="${studentId}"]`);
        if (studentCircle) {
            studentCircle.classList.add('highlight');
            studentCircle.setAttribute('stroke', 'red');
            studentCircle.setAttribute('stroke-width', '3');
            
            // Get bubble position and size
            const cx = parseFloat(studentCircle.getAttribute('cx'));
            const cy = parseFloat(studentCircle.getAttribute('cy'));
            const r = parseFloat(studentCircle.getAttribute('r'));
            
            // Calculate zoomed viewBox
            const zoomFactor = 0.5; // How much to zoom in (smaller number = more zoom)
            const viewBoxWidth = chartConfig.width * zoomFactor;
            const viewBoxHeight = chartConfig.height * zoomFactor;
            
            // Center the view on the bubble
            const viewBoxX = Math.max(0, cx - viewBoxWidth/2);
            const viewBoxY = Math.max(0, cy - viewBoxHeight/2);
            
            // Set the new viewBox
            svg.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
            
            // Show tooltip
            tooltip.innerHTML = `
                <strong>ID:</strong> ${studentId}<br>
                <strong>Total Score:</strong> ${studentData.find(s => s.ID === studentId).TOTAL.toFixed(1)}
            `;
            tooltip.style.display = 'block';
            tooltip.style.left = `${cx + r + 10}px`;
            tooltip.style.top = `${cy - r - 10}px`;
            
            return true; // Student found
        }
        return false; // Student not found
    }

    // Function to show search results
    function showSearchResults(query) {
        searchResults.innerHTML = '';
        
        if (query.length < 1) {
            searchResults.style.display = 'none';
            return;
        }
        
        const filteredStudents = studentData.filter(student => 
            student.ID.toLowerCase().includes(query.toLowerCase())
        );
        
        if (filteredStudents.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'search-result-item';
            noResults.textContent = 'No matching students found';
            searchResults.appendChild(noResults);
        } else {
            filteredStudents.forEach(student => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.textContent = student.ID;
                resultItem.addEventListener('click', () => {
                    searchInput.value = student.ID;
                    searchResults.style.display = 'none';
                    highlightStudent(student.ID);
                });
                searchResults.appendChild(resultItem);
            });
        }
        
        searchResults.style.display = filteredStudents.length > 0 ? 'block' : 'none';
    }

    // Function to handle search
    function handleSearch() {
        const studentId = searchInput.value.trim();
        
        if (studentId) {
            const found = highlightStudent(studentId);
            if (!found) {
                alert(`Student with ID ${studentId} not found.`);
            }
        }
    }

    // Function to calculate statistics based on current axes and bubble size
    function calculateStatistics() {
        const xAxis = document.getElementById('x-axis').value;
        const yAxis = document.getElementById('y-axis').value;
        const bubbleSize = document.getElementById('bubble-size').value;
        const minScore = parseInt(document.getElementById('min-score').value);
        
        // Filter data
        const filteredData = studentData.filter(student => 
            student[xAxis] >= minScore && student[yAxis] >= minScore
        );
        
        const totalStudents = filteredData.length;
        
        if (totalStudents === 0) {
            return {
                totalStudents: 0,
                averageX: 0,
                averageY: 0,
                topStudentX: null,
                topStudentY: null,
                highestCpmkField: null,
                highestCpmkStudent: null,
                xAxis,
                yAxis,
                bubbleSize
            };
        }
        
        // Calculate average scores for current axes
        const totalX = filteredData.reduce((sum, student) => sum + student[xAxis], 0);
        const averageX = totalX / totalStudents;
        
        const totalY = filteredData.reduce((sum, student) => sum + student[yAxis], 0);
        const averageY = totalY / totalStudents;
        
        // Find top students for each axis
        const topStudentX = filteredData.reduce((max, student) => 
            student[xAxis] > max[xAxis] ? student : max, filteredData[0]);
        
        const topStudentY = filteredData.reduce((max, student) => 
            student[yAxis] > max[yAxis] ? student : max, filteredData[0]);
        
        // Find student with highest value for the current bubble size CPMK
        const highestCpmkStudent = filteredData.reduce((max, student) => 
            student[bubbleSize] > max[bubbleSize] ? student : max, filteredData[0]);
        
        return {
            totalStudents,
            averageX,
            averageY,
            topStudentX,
            topStudentY,
            highestCpmkField: bubbleSize,
            highestCpmkStudent,
            xAxis,
            yAxis,
            bubbleSize
        };
    }

    // Function to update statistics display based on current axes and bubble size
    function updateStatistics() {
        const stats = calculateStatistics();
        const statsContainer = document.getElementById('stats-container');
        
        if (stats.totalStudents === 0) {
            statsContainer.innerHTML = `
                <div class="stat-box">
                    <div class="stat-title">No students match the current filters</div>
                    <div class="stat-value">Adjust min score filter</div>
                </div>
            `;
            return;
        }
        
        statsContainer.innerHTML = `
            <div class="stat-box">
                <div class="stat-title">Total Students</div>
                <div class="stat-value">${stats.totalStudents}</div>
            </div>
            <div class="stat-box">
                <div class="stat-title">Avg ${getAxisLabel(stats.xAxis)}</div>
                <div class="stat-value">${stats.averageX.toFixed(1)}</div>
            </div>
            <div class="stat-box">
                <div class="stat-title">Top ${getAxisLabel(stats.xAxis)} (ID)</div>
                <div class="stat-value">${stats.topStudentX.ID} (${stats.topStudentX[stats.xAxis].toFixed(1)})</div>
            </div>
            <div class="stat-box">
                <div class="stat-title">Top ${getAxisLabel(stats.yAxis)} (ID)</div>
                <div class="stat-value">${stats.topStudentY.ID} (${stats.topStudentY[stats.yAxis].toFixed(1)})</div>
            </div>
            <div class="stat-box">
                <div class="stat-title">Highest ${stats.highestCpmkField} (ID)</div>
                <div class="stat-value">${stats.highestCpmkStudent.ID} (${stats.highestCpmkStudent[stats.highestCpmkField]})</div>
            </div>
        `;
    }
// Helper functions
function getAxisLabel(axis) {
    switch(axis) {
        case 'TBP': return 'TBP Score';
        case 'TUGAS': return 'Assignment Score';
        case 'UTS': return 'Midterm Score';
        case 'UAS': return 'Final Exam Score';
        case 'TOTAL': return 'Total Score';
        default: return axis;
    }
}

function getColor(score) {
    if (score >= 85) return 'rgba(0, 128, 0, 0.7)'; // Green for excellent
    if (score >= 70) return 'rgba(0, 0, 255, 0.7)'; // Blue for good
    if (score >= 50) return 'rgba(255, 165, 0, 0.7)'; // Orange for average
    return 'rgba(255, 0, 0, 0.7)'; // Red for poor
}

function updateLegend() {
    const legend = document.getElementById('legend');
    legend.innerHTML = `
        <div class="legend-item">
            <div class="legend-color" style="background-color: rgba(0, 128, 0, 0.7);"></div>
            <span>Excellent (≥85)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: rgba(0, 0, 255, 0.7);"></div>
            <span>Good (70-84.9)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: rgba(255, 165, 0, 0.7);"></div>
            <span>Average (50-69.9)</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background-color: rgba(255, 0, 0, 0.7);"></div>
            <span>Poor (<50)</span>
        </div>
    `;
}
});