<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('csv', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      dispatch('dataUpdated');
    } else {
      alert('Error uploading file');
    }
  }
</script>

<div>
  <input type="file" accept=".csv" on:change={handleFileUpload} />
</div>