import FileUpload from '../components/FileUpload';
import DataTable from '../components/DataTable';
import DownloadButton from '../components/DownloadButton';

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CSV Data Manager</h1>
      <FileUpload />
      <DataTable />
      <DownloadButton />
    </main>
  );
}
