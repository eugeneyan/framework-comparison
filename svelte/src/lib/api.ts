export async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}

export async function updateRow(id: number, data: any) {
  const response = await fetch(`/api/data/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function deleteRow(id: number) {
  const response = await fetch(`/api/data/${id}`, { method: 'DELETE' });
  return response.json();
}