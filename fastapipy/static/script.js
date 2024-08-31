let DEBUG = true;

// Custom debug logging function
function debugLog(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

async function uploadCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a CSV file');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post('/upload', formData);
        alert(response.data.message);
        loadData();
    } catch (error) {
        console.error('Error uploading CSV:', error);
        alert('Error uploading CSV');
    }
}

async function loadData() {
    try {
        const response = await axios.get('/data');
        debugLog('Received data from server:', response.data);
        const { columns, data } = response.data;
        const thead = document.querySelector('#dataTable thead');
        const tbody = document.querySelector('#dataTable tbody');
        
        // Update table header
        thead.innerHTML = '<tr>' + columns.map(col => `<th>${escapeHtml(col)}</th>`).join('') + '<th>Action</th></tr>';
        
        // Update table body
        tbody.innerHTML = '';
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = columns.map((col, index) => 
                `<td><textarea rows="3" data-id="${escapeHtml(row[0])}" data-field="${escapeHtml(col)}">${escapeHtml(row[index])}</textarea></td>`
            ).join('') + `<td><button onclick="updateRow(this)" data-id="${escapeHtml(row[0])}">Update</button></td>`;
            tbody.appendChild(tr);
        });
        console.log('Table updated with new data');
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data');
    }
}

// Helper function to escape HTML special characters
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Update the updateRow function to use data-id
async function updateRow(button) {
    const id = button.getAttribute('data-id');
    console.log('Updating row with id:', id);
    const formData = new FormData();
    formData.append('id', id);
    
    const updatedData = {};
    const row = button.closest('tr');
    const textareas = row.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        const field = textarea.getAttribute('data-field');
        const value = textarea.value;
        console.log(`Field: ${field}, Value: ${value}`);
        formData.append(field, value);
        updatedData[field] = value;
    });

    console.log('Sending data:', updatedData);

    try {
        const response = await axios.post('/update', formData);
        debugLog('Server response:', response.data);
        alert(response.data.message);
        await loadData();
    } catch (error) {
        console.error('Error updating data:', error.response?.data || error.message);
        alert('Error updating data');
    }
}

document.addEventListener('DOMContentLoaded', loadData);
