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
        thead.innerHTML = '<tr>' + columns.map(col => `<th>${col}</th>`).join('') + '<th>Action</th></tr>';
        
        // Update table body
        tbody.innerHTML = '';
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = columns.map((col, index) => 
                `<td><input type="text" value="${row[index]}" data-id="${row[0]}" data-field="${col}"></td>`
            ).join('') + `<td><button onclick="updateRow(${row[0]})">Update</button></td>`;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading data');
    }
}

async function updateRow(id) {
    const inputs = document.querySelectorAll(`input[data-id="${id}"]`);
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
