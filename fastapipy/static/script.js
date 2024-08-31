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
        console.log('Received data from server:', response.data);
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
                `<td><input type="text" value="${escapeHtml(row[index])}" data-id="${escapeHtml(row[0])}" data-field="${escapeHtml(col)}" id="input-${escapeHtml(row[0])}-${escapeHtml(col)}"></td>`
            ).join('') + `<td><button onclick="updateRow('${escapeHtml(row[0])}')">Update</button></td>`;
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

// Update the updateRow function to handle string IDs
async function updateRow(id) {
    console.log('Updating row with id:', id);
    const formData = new FormData();
    formData.append('id', id);
    
    const updatedData = {};
    const columns = document.querySelectorAll('#dataTable thead th');
    columns.forEach(column => {
        if (column.textContent !== 'Action') {
            const inputField = document.getElementById(`input-${escapeHtml(id)}-${escapeHtml(column.textContent)}`);
            if (inputField) {
                const field = inputField.dataset.field;
                const value = inputField.value;
                console.log(`Field: ${field}, Value: ${value}`);
                formData.append(field, value);
                updatedData[field] = value;
            }
        }
    });

    console.log('Sending data:', updatedData);

    try {
        const response = await axios.post('/update', formData);
        console.log('Server response:', response.data);
        alert(response.data.message);
        await loadData();
    } catch (error) {
        console.error('Error updating data:', error.response?.data || error.message);
        alert('Error updating data');
    }
}

document.addEventListener('DOMContentLoaded', loadData);
