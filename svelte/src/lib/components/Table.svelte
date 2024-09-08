<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { updateRow, deleteRow } from '$lib/api';

  export let tableData: any[];

  const dispatch = createEventDispatcher();

  let editingCell: { rowIndex: number, key: string } | null = null;
  let editedValue: string = '';

  function startEditing(rowIndex: number, key: string, value: string) {
    editingCell = { rowIndex, key };
    editedValue = value;
  }

  async function saveEdit(id: number) {
    if (!editingCell) return;
    const { rowIndex, key } = editingCell;
    const updatedData = { ...tableData[rowIndex], [key]: editedValue };
    await updateRow(id, { [key]: editedValue });
    tableData[rowIndex] = updatedData;
    dispatch('dataUpdated');
    editingCell = null;
  }

  function handleKeyDown(event: KeyboardEvent, id: number) {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveEdit(id);
    } else if (event.key === 'Escape') {
      editingCell = null;
    }
  }

  async function handleDelete(id: number) {
    await deleteRow(id);
    dispatch('dataUpdated');
  }
</script>

<table>
  <thead>
    <tr>
      {#each Object.keys(tableData[0] || {}) as header}
        <th>{header}</th>
      {/each}
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {#each tableData as row, rowIndex}
      <tr>
        {#each Object.entries(row) as [key, value]}
          <td>
            <div
              role="textbox"
              contenteditable={editingCell && editingCell.rowIndex === rowIndex && editingCell.key === key}
              on:click={() => startEditing(rowIndex, key, value)}
              on:input={(e) => editedValue = e.target.textContent}
              on:keydown={(e) => handleKeyDown(e, row.id)}
              on:blur={() => saveEdit(row.id)}
            >
              {value}
            </div>
          </td>
        {/each}
        <td>
          <button on:click={() => handleDelete(row.id)}>Delete</button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
  }
  [contenteditable="true"] {
    outline: 2px solid #007bff;
    padding: 2px;
  }
</style>