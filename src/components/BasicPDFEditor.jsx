import { useState, useCallback, useEffect } from 'react';

const BasicPDFEditor = () => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [fields, setFields] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      setFields([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  const addField = (type) => {
    const newField = {
      id: Date.now(),
      type,
      x: 100,
      y: 100,
      width: type === 'checkbox' ? 20 : type === 'signature' ? 200 : 150,
      height: type === 'textarea' ? 60 : type === 'signature' ? 50 : 30,
      value: type === 'checkbox' ? false : '',
      placeholder: type === 'signature' ? 'Your signature...' : `Enter ${type}...`
    };
    setFields(prev => [...prev, newField]);
  };

  const updateField = (id, updates) => {
    setFields(prev => prev.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const deleteField = (id) => {
    setFields(prev => prev.filter(field => field.id !== id));
  };

  const resetEditor = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setFile(null);
    setFileUrl(null);
    setFields([]);
    setError(null);
    setIsEditMode(false);
  };

  const exportPDF = async () => {
    alert(`Export would include ${fields.length} fields with their values. This is a demo - full export functionality would use pdf-lib.`);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Enter fullscreen for PDF area only
      const pdfContainer = document.getElementById('pdf-container');
      if (pdfContainer) {
        if (pdfContainer.requestFullscreen) {
          pdfContainer.requestFullscreen();
        } else if (pdfContainer.webkitRequestFullscreen) {
          pdfContainer.webkitRequestFullscreen();
        } else if (pdfContainer.msRequestFullscreen) {
          pdfContainer.msRequestFullscreen();
        }
        setIsFullscreen(true);
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <>
      {/* Fullscreen and signature styles */}
      <style jsx>{`
        #pdf-container:fullscreen {
          background: black;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        #pdf-container:fullscreen iframe {
          width: 100vw;
          height: 100vh;
          max-width: none;
          max-height: none;
          border: none;
          border-radius: 0;
        }

        #pdf-container:-webkit-full-screen {
          background: black;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        #pdf-container:-webkit-full-screen iframe {
          width: 100vw;
          height: 100vh;
          max-width: none;
          max-height: none;
          border: none;
          border-radius: 0;
        }

        /* Import cursive fonts for signatures */
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Great+Vibes&family=Allura&display=swap');

        .signature-field {
          font-family: 'Dancing Script', 'Great Vibes', 'Allura', 'Brush Script MT', cursive;
          font-weight: 500;
        }

        .signature-text {
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          letter-spacing: 1px;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Basic PDF Editor</h1>
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
      </header>

      <div className="flex h-screen">
        {!file ? (
          /* Upload Area */
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
        ) : (
          <>
            {/* Main PDF Area */}
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
                  {/* PDF Display (using iframe as fallback) */}
                  <div
                    id="pdf-container"
                    className={`relative bg-gray-100 rounded border mb-4 ${
                      isFullscreen
                        ? 'fixed inset-0 z-50 bg-black flex items-center justify-center'
                        : 'h-96'
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
                    {fields.map(field => (
                      <div
                        key={field.id}
                        className={`absolute border-2 ${
                          isEditMode ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        } rounded`}
                        style={{
                          left: `${field.x}px`,
                          top: `${field.y}px`,
                          width: `${field.width}px`,
                          height: `${field.height}px`,
                          zIndex: isEditMode ? 10 : 20,
                          pointerEvents: isEditMode ? 'auto' : 'auto'
                        }}
                        onClick={(e) => {
                          if (isEditMode) {
                            e.stopPropagation();
                            console.log('Field selected:', field.id);
                          }
                        }}
                      >
                        {field.type === 'checkbox' ? (
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateField(field.id, { value: e.target.checked });
                            }}
                            disabled={isEditMode}
                            className="w-full h-full"
                            style={{ pointerEvents: isEditMode ? 'none' : 'auto' }}
                          />
                        ) : field.type === 'signature' ? (
                          <div className="w-full h-full relative">
                            {!isEditMode && field.value ? (
                              <div
                                className="w-full h-full flex items-center justify-center cursor-pointer border-b-2 border-gray-400 signature-field signature-text"
                                style={{
                                  fontSize: `${Math.min(field.height * 0.7, 32)}px`,
                                  color: '#1a365d',
                                  fontWeight: '500',
                                  transform: 'rotate(-1deg)',
                                  lineHeight: '1'
                                }}
                                onClick={() => {
                                  const newSignature = prompt('Enter your signature:', field.value);
                                  if (newSignature !== null) {
                                    updateField(field.id, { value: newSignature });
                                  }
                                }}
                                title="Click to edit signature"
                              >
                                {field.value}
                              </div>
                            ) : !isEditMode ? (
                              <div
                                className="w-full h-full flex items-center justify-center cursor-pointer border-b-2 border-dashed border-gray-400 text-gray-500"
                                onClick={() => {
                                  const signature = prompt('Enter your signature:');
                                  if (signature) {
                                    updateField(field.id, { value: signature });
                                  }
                                }}
                              >
                                Click to sign
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                Signature Field
                              </div>
                            )}

                            {/* Resize handles for signature field */}
                            {isEditMode && (
                              <>
                                <div
                                  className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    const startX = e.clientX;
                                    const startY = e.clientY;
                                    const startWidth = field.width;
                                    const startHeight = field.height;

                                    const handleMouseMove = (e) => {
                                      const newWidth = Math.max(100, startWidth + (e.clientX - startX));
                                      const newHeight = Math.max(30, startHeight + (e.clientY - startY));
                                      updateField(field.id, { width: newWidth, height: newHeight });
                                    };

                                    const handleMouseUp = () => {
                                      document.removeEventListener('mousemove', handleMouseMove);
                                      document.removeEventListener('mouseup', handleMouseUp);
                                    };

                                    document.addEventListener('mousemove', handleMouseMove);
                                    document.addEventListener('mouseup', handleMouseUp);
                                  }}
                                />
                              </>
                            )}
                          </div>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            value={field.value}
                            placeholder={field.placeholder}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateField(field.id, { value: e.target.value });
                            }}
                            onClick={(e) => !isEditMode && e.stopPropagation()}
                            disabled={isEditMode}
                            className={`w-full h-full p-1 text-sm resize-none border-none outline-none ${
                              isEditMode ? 'bg-blue-50 cursor-move' : 'bg-white'
                            }`}
                            style={{
                              pointerEvents: isEditMode ? 'none' : 'auto',
                              zIndex: isEditMode ? 1 : 10
                            }}
                          />
                        ) : (
                          <input
                            type={field.type}
                            value={field.value}
                            placeholder={field.placeholder}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateField(field.id, { value: e.target.value });
                            }}
                            onClick={(e) => !isEditMode && e.stopPropagation()}
                            disabled={isEditMode}
                            className={`w-full h-full p-1 text-sm border-none outline-none ${
                              isEditMode ? 'bg-blue-50 cursor-move' : 'bg-white'
                            }`}
                            style={{
                              pointerEvents: isEditMode ? 'none' : 'auto',
                              zIndex: isEditMode ? 1 : 10
                            }}
                          />
                        )}
                        
                        {isEditMode && (
                          <button
                            onClick={() => deleteField(field.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Instructions */}
                  <div className={`p-4 rounded-lg ${isEditMode ? 'bg-blue-50' : 'bg-green-50'}`}>
                    <h3 className={`font-semibold mb-2 ${isEditMode ? 'text-blue-800' : 'text-green-800'}`}>
                      {isEditMode ? 'Edit Mode - Position Fields' : 'Form Mode - Fill Out Fields'}
                    </h3>
                    {isEditMode ? (
                      <ol className="text-sm text-blue-700 space-y-1">
                        <li>• Add fields using the sidebar buttons</li>
                        <li>• Drag fields to position them</li>
                        <li>• Resize signature fields using the blue handle</li>
                        <li>• Click "Exit Edit" when done positioning</li>
                      </ol>
                    ) : (
                      <ol className="text-sm text-green-700 space-y-1">
                        <li>• Click in text fields to type</li>
                        <li>• Check/uncheck boxes</li>
                        <li>• Click signature fields to add your signature</li>
                        <li>• Fields should have white background and be clickable</li>
                      </ol>
                    )}

                    {/* Debug info */}
                    <div className="mt-3 text-xs text-gray-600">
                      Mode: {isEditMode ? 'EDIT' : 'FORM'} | Fields: {fields.length}
                      {fields.length > 0 && (
                        <div>
                          Last field: {fields[fields.length - 1]?.type} - Value: "{fields[fields.length - 1]?.value || 'empty'}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 bg-white border-l p-6">
              <h3 className="text-lg font-semibold mb-4">Field Manager</h3>
              
              {isEditMode ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Add Fields:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => addField('text')}
                        className="bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm"
                      >
                        📝 Text
                      </button>
                      <button
                        onClick={() => addField('email')}
                        className="bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm"
                      >
                        📧 Email
                      </button>
                      <button
                        onClick={() => addField('date')}
                        className="bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm"
                      >
                        📅 Date
                      </button>
                      <button
                        onClick={() => addField('checkbox')}
                        className="bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm"
                      >
                        ☑️ Checkbox
                      </button>
                      <button
                        onClick={() => addField('textarea')}
                        className="bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm"
                      >
                        📄 Text Area
                      </button>
                      <button
                        onClick={() => addField('signature')}
                        className="bg-gray-100 hover:bg-gray-200 p-2 rounded text-sm"
                      >
                        ✍️ Signature
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    Fill out the form fields on the PDF
                  </p>
                </div>
              )}

              {/* Field List */}
              <div className="mt-6">
                <h4 className="font-medium mb-2">Current Fields ({fields.length}):</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {fields.map(field => (
                    <div key={field.id} className="bg-gray-50 p-2 rounded text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{field.type}</span>
                        {isEditMode && (
                          <button
                            onClick={() => deleteField(field.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <div className="text-gray-600 text-xs">
                        Value: {field.type === 'checkbox' ? (field.value ? 'Checked' : 'Unchecked') : (field.value || 'Empty')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-sm">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default BasicPDFEditor;
