import React from 'react';

const Header = ({ 
  file, 
  isEditMode, 
  setIsEditMode, 
  fields, 
  exportPDF, 
  toggleFullscreen, 
  isFullscreen, 
  resetEditor 
}) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">PDF Editor</h1>
            {file && (
              <div className="text-sm text-gray-600">
                {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {file && (
              <>
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`px-4 py-2 rounded transition-colors ${
                    isEditMode
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isEditMode ? 'Exit Edit' : 'Edit Mode'}
                </button>
                {fields.length > 0 && (
                  <button
                    onClick={exportPDF}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    Export PDF
                  </button>
                )}
                <button
                  onClick={toggleFullscreen}
                  className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors flex items-center space-x-2"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  <span>{isFullscreen ? '⛶' : '⛶'}</span>
                  <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                </button>
                <button
                  onClick={resetEditor}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
