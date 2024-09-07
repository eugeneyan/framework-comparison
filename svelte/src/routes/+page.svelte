<script lang="ts">
  import { onMount } from 'svelte';
  import Table from '$lib/components/Table.svelte';
  import CsvUpload from '$lib/components/CsvUpload.svelte';
  import { fetchData } from '$lib/api';

  let tableData: any[] = [];

  onMount(async () => {
    tableData = await fetchData();
  });

  function handleDataUpdate() {
    fetchData().then(data => tableData = data);
  }
</script>

<main>
  <h1>Look at Your Data</h1>
  <div class="actions">
    <CsvUpload on:dataUpdated={handleDataUpdate} />
    <a href="/api/download" download="table_data.csv" class="download-btn">Download CSV</a>
  </div>
  <div class="table-container">
    <Table {tableData} on:dataUpdated={handleDataUpdate} />
  </div>
</main>

<style>
  :global(body, html) {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

  main {
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .table-container {
    width: 100%;
    overflow-x: auto;
  }

  .download-btn {
    background-color: #4CAF50;
    border: none;
    color: white;
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 4px;
  }
</style>
