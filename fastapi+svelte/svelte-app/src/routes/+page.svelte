<script lang="ts">
  import { onMount } from 'svelte';

  let file: File | null = null;
  let tableData: any[] = [];
  let headers: string[] = [];
  let message: string = '';

  async function uploadCSV() {
    if (!file) {
      message = 'Please select a file';
      return;
    }

    const formData = new FormData();
    formData.append('file', file[0]); // Change this line

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Unknown error occurred');
      }

      const result = await response.json();
      message = result.message;
      await fetchData();
    } catch (error) {
      message = `Error uploading file: ${error.message}`;
      console.error('Upload error:', error);
    }
  }

  async function fetchData() {
    try {
      const response = await fetch('http://localhost:8000/data');
      const result = await response.json();
      headers = result.headers;
      tableData = result.data;
    } catch (error) {
      message = 'Error fetching data';
    }
  }

  async function updateRow(rowId: number, updatedData: any) {
    try {
      const response = await fetch(`http://localhost:8000/update/${rowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const result = await response.json();
      message = result.message;
      await fetchData();
    } catch (error) {
      message = 'Error updating row';
    }
  }

  async function deleteRow(rowId: number) {
    try {
      const response = await fetch(`http://localhost:8000/delete/${rowId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      message = result.message;
      await fetchData();
    } catch (error) {
      message = 'Error deleting row';
    }
  }

  function downloadCSV() {
    window.location.href = 'http://localhost:8000/download';
  }

  onMount(fetchData);
</script>

<main>
  <h1>CSV Data Manager</h1>
  
  <div>
    <input type="file" accept=".csv" bind:files={file} />
    <button on:click={uploadCSV}>Upload CSV</button>
  </div>

  {#if message}
    <p>{message}</p>
  {/if}

  {#if tableData.length > 0}
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
        {#each tableData as row, i}
          <tr>
            {#each row as cell, j}
              <td>
                <input
                  type="text"
                  value={cell}
                  on:change={(e) => updateRow(i + 1, { [headers[j]]: e.target.value })}
                />
              </td>
            {/each}
            <td>
              <button on:click={() => deleteRow(i + 1)}>Delete</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    <button on:click={downloadCSV}>Download CSV</button>
  {:else}
    <p>No data available. Please upload a CSV file.</p>
  {/if}
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
  }

  input[type="text"] {
    width: 100%;
    box-sizing: border-box;
  }

  button {
    margin-top: 10px;
  }
</style>
