'use client';

import { useState, useEffect } from 'react';

interface RowData {
  id: number;
  [key: string]: any;
}

export default function DataTable() {
  const [data, setData] = useState<RowData[]>([]);
  const [editingCell, setEditingCell] = useState<{ rowId: number; column: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const jsonData = await response.json();
      setData(Array.isArray(jsonData) ? jsonData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    }
  };

  const handleCellEdit = async (rowId: number, column: string, value: string) => {
    try {
      const response = await fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rowId, column, value }),
      });
      if (response.ok) {
        fetchData();
      } else {
        alert('Failed to update data');
      }
    } catch (error) {
      console.error('Error updating data:', error);
      alert('Failed to update data');
    }
    setEditingCell(null);
  };

  const handleDeleteRow = async (rowId: number) => {
    try {
      const response = await fetch(`/api/data?id=${rowId}`, { method: 'DELETE' });
      if (response.ok) {
        fetchData();
      } else {
        alert('Failed to delete row');
      }
    } catch (error) {
      console.error('Error deleting row:', error);
      alert('Failed to delete row');
    }
  };

  if (!Array.isArray(data) || data.length === 0) return <p>No data available</p>;

  // Include 'id' in the columns
  const columns = Object.keys(data[0]);

  return (
    <table className="w-full border-collapse border border-gray-300 mb-4">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col} className="border border-gray-300 p-2">
              {col}
            </th>
          ))}
          <th className="border border-gray-300 p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            {columns.map((col) => (
              <td
                key={`${row.id}-${col}`}
                className="border border-gray-300 p-2"
                onClick={() => col !== 'id' && setEditingCell({ rowId: row.id, column: col })}
              >
                {editingCell?.rowId === row.id && editingCell?.column === col ? (
                  <input
                    type="text"
                    defaultValue={row[col]}
                    onBlur={(e) => handleCellEdit(row.id, col, e.target.value)}
                    autoFocus
                  />
                ) : (
                  row[col]
                )}
              </td>
            ))}
            <td className="border border-gray-300 p-2">
              <button
                onClick={() => handleDeleteRow(row.id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}