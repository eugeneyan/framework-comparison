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
        // Update local state immediately
        setData(prevData => prevData.map(row => 
          row.id === rowId ? { ...row, [column]: value } : row
        ));
      } else {
        const errorData = await response.json();
        alert(`Failed to update data: ${errorData.error}`);
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
                className="border border-gray-300 p-2 relative"
                onClick={() => col !== 'id' && setEditingCell({ rowId: row.id, column: col })}
              >
                {editingCell?.rowId === row.id && editingCell?.column === col ? (
                  <textarea
                    defaultValue={row[col]}
                    onBlur={(e) => handleCellEdit(row.id, col, e.target.value)}
                    autoFocus
                    className="w-full h-full absolute top-0 left-0 border-none bg-white p-2 focus:outline-none resize-none overflow-hidden"
                    style={{ minHeight: '100%' }}
                    onInput={(e) => {
                      e.currentTarget.style.height = 'auto';
                      e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                    }}
                  />
                ) : (
                  <span className="block w-full h-full whitespace-pre-wrap">{row[col]}</span>
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