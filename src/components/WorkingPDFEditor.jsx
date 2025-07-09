import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Use a working CDN for the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const WorkingPDFEditor = () => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = useCallback(async (selectedFile) => {
    if (!selectedFile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Validate file
      if (selectedFile.type !== 'application/pdf') {
        throw new Error('Please select a PDF file');
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Create URL for the file
      const url = URL.createObjectURL(selectedFile);
      
      setFile(selectedFile);
      setFileUrl(url);
      setPageNumber(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error) => {
    setError('Failed to load PDF document');
    setLoading(false);
    console.error('PDF load error:', error);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  const resetEditor = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setFile(null);
    setFileUrl(null);
    setNumPages(null);
    setPageNumber(1);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">PDF Editor</h1>
          {file && (
            <button
              onClick={resetEditor}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </header>

      <div className="p-6">
        {!file ? (
          /* Upload Area */
          <div className="max-w-2xl mx-auto">
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
                  accept=".pdf,application/pdf"
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
                <p className="text-sm text-gray-400">Maximum file size: 10MB</p>
              </div>
            </div>
          </div>
        ) : (
          /* PDF Viewer */
          <div className="max-w-4xl mx-auto">
            {/* File Info */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{file.name}</h2>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                    {numPages && ` • ${numPages} page${numPages !== 1 ? 's' : ''}`}
                  </p>
                </div>
                {numPages && numPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPrevPage}
                      disabled={pageNumber <= 1}
                      className="btn btn-sm btn-outline"
                    >
                      ← Previous
                    </button>
                    <span className="text-sm">
                      Page {pageNumber} of {numPages}
                    </span>
                    <button
                      onClick={goToNextPage}
                      disabled={pageNumber >= numPages}
                      className="btn btn-sm btn-outline"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* PDF Document */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {loading && (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-lg">Loading PDF...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="alert alert-error">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {fileUrl && !error && (
                <div className="flex justify-center">
                  <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <div className="flex items-center justify-center h-96">
                        <div className="loading loading-spinner loading-lg text-primary"></div>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={1.0}
                      loading={
                        <div className="flex items-center justify-center h-96">
                          <div className="loading loading-spinner loading-lg text-primary"></div>
                        </div>
                      }
                    />
                  </Document>
                </div>
              )}
            </div>

            {/* Next Steps */}
            {numPages && (
              <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800">✅ PDF Loaded</h4>
                    <p className="text-sm text-blue-600">Your PDF is now visible</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800">🔄 Add Fields</h4>
                    <p className="text-sm text-yellow-600">Coming next: Interactive form fields</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800">💾 Export</h4>
                    <p className="text-sm text-green-600">Download modified PDF</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-sm">
          <div className="alert alert-error">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="btn btn-sm btn-ghost"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkingPDFEditor;
