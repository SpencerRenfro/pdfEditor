import React from 'react';
import FieldOverlay from './FieldOverlay';

const ViewerArea = ({ 
  file, 
  fileUrl, 
  fields, 
  updateField, 
  deleteField, 
  isEditMode, 
  isFullscreen, 
  toggleFullscreen,
  handleFileSelect,
  handleDrop,
  handleDragOver,
  handleFileChange,
  loading,
  error
}) => {
  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
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
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="bg-white rounded-lg shadow-sm h-full">
        {/* File Info */}
        <div className="p-4 border-b">
          <h2 className="font-semibold">{file.name}</h2>
          <p className="text-sm text-gray-600">
            {(file.size / 1024 / 1024).toFixed(2)} MB • {fields.length} field{fields.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* PDF Viewer Area */}
        <div className="p-6 h-full relative">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="text-red-400 mr-3">⚠️</div>
                <div>
                  <h3 className="text-red-800 font-medium">Error loading PDF</h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* PDF Display Container */}
          <div
            id="pdf-container"
            className={`relative bg-gray-100 rounded border mb-4 ${
              isFullscreen
                ? 'fixed inset-0 z-50 bg-black flex items-center justify-center'
                : 'h-[80vh]'
            }`}
          >
            {/* Fullscreen controls overlay */}
            {isFullscreen && (
              <div className="absolute top-20 right-4 z-60 flex space-x-2">
                <button
                  onClick={toggleFullscreen}
                  className="bg-black bg-opacity-50 text-white px-4 py-2 rounded hover:bg-opacity-70 transition-colors"
                >
                  Exit Fullscreen
                </button>
              </div>
            )}

            {/* PDF iframe */}
            <iframe
              src={fileUrl}
              className={`rounded ${
                isFullscreen
                  ? 'w-full h-full max-w-none max-h-none'
                  : 'w-full h-full'
              }`}
              title="PDF Viewer"
            />

            {/* Field Overlays */}
            <FieldOverlay
              fields={fields}
              updateField={updateField}
              deleteField={deleteField}
              isEditMode={isEditMode}
            />
          </div>

          {/* PDF Status */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>📄 PDF loaded successfully</span>
              {fields.length > 0 && (
                <span>📝 {fields.length} field{fields.length !== 1 ? 's' : ''} added</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-xs ${
                isEditMode 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {isEditMode ? '✏️ Edit Mode' : '👁️ View Mode'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerArea;
