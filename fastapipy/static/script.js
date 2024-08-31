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
                `<td><input type="text" value="${escapeHtml(row[index])}" data-id="${escapeHtml(row[0])}" data-field="${escapeHtml(col)}"></td>`
            ).join('') + `<td><button onclick="updateRow('${escapeHtml(row[0])}')">Update</button></td>`;
            tbody.appendChild(tr);
        });
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
    const inputs = document.querySelectorAll(`input[data-id="${escapeHtml(id)}"]`);
    const formData = new FormData();
    formData.append('id', id);
    
    inputs.forEach(input => {
        formData.append(input.dataset.field, input.value);
    });

    console.log('Sending data:', Object.fromEntries(formData));

    try {
        const response = await axios.post('/update', formData);
        alert(response.data.message);
        loadData();
    } catch (error) {
        console.error('Error updating data:', error.response?.data || error.message);
        alert('Error updating data');
    }
}

document.addEventListener('DOMContentLoaded', loadData);
