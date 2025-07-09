import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Use a more reliable CDN for PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FastPDFViewer = ({ 
  fileUrl, 
  onLoadSuccess, 
  selectedPage = 1,
  onPageChange,
  scale = 1.0 
}) => {
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
    if (onLoadSuccess) {
      onLoadSuccess({ numPages });
    }
  }, [onLoadSuccess]);

  const onDocumentLoadError = useCallback((error) => {
    setError('Failed to load PDF document');
    setLoading(false);
    console.error('PDF load error:', error);
  }, []);

  const handlePageChange = (direction) => {
    if (!numPages) return;
    
    let newPage = selectedPage;
    if (direction === 'prev' && selectedPage > 1) {
      newPage = selectedPage - 1;
    } else if (direction === 'next' && selectedPage < numPages) {
      newPage = selectedPage + 1;
    }
    
    if (newPage !== selectedPage && onPageChange) {
      onPageChange(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-lg">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* PDF Document */}
      <div className="relative border border-gray-300 shadow-lg">
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
            pageNumber={selectedPage}
            scale={scale}
            loading={
              <div className="flex items-center justify-center h-96">
                <div className="loading loading-spinner loading-lg text-primary"></div>
              </div>
            }
          />
        </Document>
      </div>

      {/* Page Navigation */}
      {numPages && numPages > 1 && (
        <div className="flex items-center space-x-4">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => handlePageChange('prev')}
            disabled={selectedPage <= 1}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-sm">Page</span>
            <input
              type="number"
              min="1"
              max={numPages}
              value={selectedPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= numPages && onPageChange) {
                  onPageChange(page);
                }
              }}
              className="input input-sm input-bordered w-16 text-center"
            />
            <span className="text-sm">of {numPages}</span>
          </div>

          <button
            className="btn btn-sm btn-outline"
            onClick={() => handlePageChange('next')}
            disabled={selectedPage >= numPages}
          >
            Next
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="flex items-center space-x-2">
        <span className="text-sm">Zoom:</span>
        <div className="btn-group">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => onPageChange && onPageChange(selectedPage, Math.max(0.5, scale - 0.1))}
          >
            -
          </button>
          <button className="btn btn-sm btn-outline">
            {Math.round(scale * 100)}%
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => onPageChange && onPageChange(selectedPage, Math.min(2.0, scale + 0.1))}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default FastPDFViewer;
