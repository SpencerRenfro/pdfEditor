import { useState } from 'react';

const SimplePDFTest = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      alert('Please drop a PDF file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Simple PDF Test</h1>
        
        {!file ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="space-y-4">
              <div className="text-6xl">📄</div>
              <h2 className="text-xl font-semibold">Upload a PDF file</h2>
              <p className="text-gray-600">Drag and drop or click to select</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-input"
              />
              <label
                htmlFor="pdf-input"
                className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
              >
                Choose PDF File
              </label>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">PDF Loaded Successfully!</h2>
              <button
                onClick={() => setFile(null)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Remove File
              </button>
            </div>
            
            <div className="bg-gray-100 p-4 rounded">
              <p><strong>File Name:</strong> {file.name}</p>
              <p><strong>File Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>File Type:</strong> {file.type}</p>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Next Steps:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800">1. View PDF</h4>
                  <p className="text-sm text-blue-600">PDF will be rendered here</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800">2. Add Fields</h4>
                  <p className="text-sm text-green-600">Interactive form fields</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800">3. Export</h4>
                  <p className="text-sm text-purple-600">Download modified PDF</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => alert('PDF processing would happen here!')}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Process PDF (Demo)
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-gray-600">
          <p>This is a simplified test version to verify basic functionality.</p>
          <p>The full PDF editor with react-pdf will load after this works.</p>
        </div>
      </div>
    </div>
  );
};

export default SimplePDFTest;
