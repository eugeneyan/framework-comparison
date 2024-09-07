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
  <h1>CSV Data Manager</h1>
  <div class="actions">
    <CsvUpload on:dataUpdated={handleDataUpdate} />
    <a href="/api/download" download="table_data.csv" class="download-btn">Download CSV</a>
  </div>
  <Table {tableData} on:dataUpdated={handleDataUpdate} />
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
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
