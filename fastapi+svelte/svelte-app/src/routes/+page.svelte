<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchData, uploadCSV, updateRow, deleteRow } from '$lib/api';

  let file: File | null = null;
  let tableData: any[][] = [];
  let headers: string[] = [];
  let message: string = '';

  let editingCell: { rowIndex: number, colIndex: number } | null = null;
  let editedValue: string = '';

  onMount(loadData);

  async function loadData() {
    try {
      const result = await fetchData();
      console.log('Received data:', result);
      headers = result.headers;
      tableData = result.data;
      if (result.error) {
        message = `Error fetching data: ${result.error}`;
      } else if (headers.length === 0 && tableData.length === 0) {
        message = 'No data available. Please upload a CSV file.';
      } else {
        message = ''; // Clear any previous error messages
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message = 'Error fetching data. Please try again.';
      headers = [];
      tableData = [];
    }
  }

  async function handleUpload() {
    if (!file) {
      message = 'Please select a file';
      return;
    }

    try {
      const result = await uploadCSV(file[0]);
      message = result.message;
      await loadData();
    } catch (error) {
      message = `Error uploading file: ${error.message}`;
      console.error('Upload error:', error);
    }
  }

  function startEditing(rowIndex: number, colIndex: number, value: string) {
    editingCell = { rowIndex, colIndex };
    editedValue = value;
  }

  async function saveEdit(id: number) {
    if (!editingCell) return;
    const { rowIndex, colIndex } = editingCell;
    const updatedData = [...tableData[rowIndex]];
    updatedData[colIndex] = editedValue;
    await updateRow(id, { [headers[colIndex]]: editedValue });
    tableData[rowIndex] = updatedData;
    editingCell = null;
    await loadData();
  }

  function handleKeyDown(event: KeyboardEvent, id: number) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      saveEdit(id);
    } else if (event.key === 'Escape') {
      editingCell = null;
    }
  }

  async function handleDelete(id: number) {
    await deleteRow(id);
    await loadData();
  }

  function downloadCSV() {
    window.location.href = 'http://localhost:8000/download';
  }
</script>

<main>
  <h1>Look at Your Data</h1>
  
  <div class="csv-actions">
    <div class="upload-section">
      <input type="file" accept=".csv" bind:files={file} />
      <button on:click={handleUpload}>Upload CSV</button>
    </div>
    {#if tableData.length > 0}
      <button on:click={downloadCSV}>Download CSV</button>
    {/if}
  </div>

  {#if message}
    <p>{message}</p>
  {/if}

  {#if tableData.length > 0}
    <div class="table-container">
      <table>
        <thead>
          <tr>
            {#each headers as header}
              <th>{header}</th>
            {/each}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each tableData as row, rowIndex}
            <tr>
              {#each row as cell, colIndex}
                <td>
                  <div
                    class="cell-content"
                    role="textbox"
                    tabindex="0"
                    contenteditable={editingCell && editingCell.rowIndex === rowIndex && editingCell.colIndex === colIndex}
                    on:click={() => startEditing(rowIndex, colIndex, cell)}
                    on:input={(e) => editedValue = e.target.textContent}
                    on:keydown={(e) => handleKeyDown(e, row[0])}
                    on:blur={() => saveEdit(row[0])}
                  >
                    {cell}
                  </div>
                </td>
              {/each}
              <td>
                <button on:click={() => handleDelete(row[0])}>Delete</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <br>
  {/if}
</main>

<style>
  main {
    max-width: 100%;
    margin: 0 auto;
    padding: 20px;
  }

  .csv-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .upload-section {
    display: flex;
    align-items: center;
  }

  .upload-section input[type="file"] {
    margin-right: 10px;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    table-layout: auto;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
    vertical-align: top;
  }

  th {
    background-color: #f2f2f2;
  }

  .cell-content {
    min-width: 100px;
    max-width: none;
    width: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  [contenteditable="true"] {
    outline: 2px solid #007bff;
    padding: 2px;
  }

  button {
    padding: 5px 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }
</style>
