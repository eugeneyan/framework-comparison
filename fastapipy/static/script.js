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

function getColumnClass(value) {
    if (value.length <= 12) {
        return 'col-narrow';
    } else if (value.length <= 200) {
        return 'col-medium';
    } else {
        return 'col-wide';
    }
}

async function loadData() {
    try {
        const response = await axios.get('/data');
        debugLog('Received data from server:', response.data);
        const { columns, data } = response.data;
        const table = document.getElementById('dataTable');
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');

        // Clear existing content
        thead.innerHTML = '';
        tbody.innerHTML = '';

        // Create header row
        const headerRow = document.createElement('tr');
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        headerRow.innerHTML += '<th>Actions</th>';
        thead.appendChild(headerRow);

        // Create data rows
        data.forEach(row => {
            const tr = document.createElement('tr');
            columns.forEach((col, index) => {
                const td = document.createElement('td');
                const textarea = document.createElement('textarea');
                textarea.value = row[index];
                textarea.setAttribute('data-id', row[0]);
                textarea.setAttribute('data-field', col);
                td.appendChild(textarea);
                td.className = getColumnClass(row[index]);
                tr.appendChild(td);
            });
            const actionTd = document.createElement('td');
            const updateButton = document.createElement('button');
            updateButton.textContent = 'Update';
            updateButton.onclick = () => updateRow(updateButton);
            updateButton.setAttribute('data-id', row[0]);
            actionTd.appendChild(updateButton);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteRow(deleteButton);
            deleteButton.setAttribute('data-id', row[0]);
            actionTd.appendChild(deleteButton);
            tr.appendChild(actionTd);
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

async function deleteRow(button) {
    const id = button.getAttribute('data-id');
    console.log('Deleting row with id:', id);

    if (!confirm('Are you sure you want to delete this row?')) {
        return;
    }

    try {
        const response = await axios.post('/delete', { id: id });
        debugLog('Server response:', response.data);
        alert(response.data.message);
        await loadData();
    } catch (error) {
        console.error('Error deleting data:', error.response?.data || error.message);
        alert('Error deleting data');
    }
}

async function downloadCSV() {
    try {
        const response = await axios.get('/download', { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'database_export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading CSV:', error);
        alert('Error downloading CSV');
    }
}

document.addEventListener('DOMContentLoaded', loadData);
