import React, { useState, useCallback, useEffect } from 'react';
import Header from './Header';
import ViewerArea from './ViewerArea';
import FieldManager from './FieldManager';

const PDFEditor = () => {
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
      placeholder: type === 'signature' ? 'Sign your name here...' : `Enter ${type}...`
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

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        setIsFullscreen(false);
      }
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

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Import Google Fonts and custom styles */}
      <link
        href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

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

        /* Signature field styling */
        .signature-field {
          font-family: 'Dancing Script', 'Brush Script MT', cursive !important;
          font-size: 20px !important;
          font-weight: 500 !important;
          color: #1a365d !important;
          transform: rotate(-1deg) !important;
          letter-spacing: 0.5px !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
        }

        .signature-field::placeholder {
          font-family: 'Dancing Script', cursive !important;
          color: #94a3b8 !important;
          font-style: italic !important;
        }

        /* Smooth transitions for signature fields */
        .signature-field {
          transition: all 0.2s ease-in-out !important;
        }

        .signature-field:focus {
          transform: rotate(-1deg) scale(1.02) !important;
          color: #0f172a !important;
        }
      `}</style>

      <Header
        file={file}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        fields={fields}
        exportPDF={exportPDF}
        toggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        resetEditor={resetEditor}
      />

      <div className="flex h-screen">
        <ViewerArea
          file={file}
          fileUrl={fileUrl}
          fields={fields}
          updateField={updateField}
          deleteField={deleteField}
          isEditMode={isEditMode}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          handleFileSelect={handleFileSelect}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          handleFileChange={handleFileChange}
          loading={loading}
          error={error}
        />

        <FieldManager
          fields={fields}
          addField={addField}
          deleteField={deleteField}
          isEditMode={isEditMode}
        />
      </div>
    </div>
  );
};

export default PDFEditor;
