'use client';

import { useState } from 'react';

interface FileUploadProps {
  onFileUploaded: () => void;
}

export default function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        alert('File uploaded successfully');
        onFileUploaded();
      } else {
        alert('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('File upload failed');
    }
  };

  return (
    <form onSubmit={handleFileUpload} className="flex items-center">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mr-2"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Upload CSV
      </button>
    </form>
  );
}