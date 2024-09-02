'use client';

import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import DataTable from '../components/DataTable';
import DownloadButton from '../components/DownloadButton';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFileUploaded = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CSV Data Manager</h1>
      <div className="flex items-center justify-between mb-4">
        <FileUpload onFileUploaded={handleFileUploaded} />
        <DownloadButton />
      </div>
      <DataTable key={refreshKey} />
    </main>
  );
}
