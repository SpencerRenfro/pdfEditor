import { useState, useCallback, useRef } from 'react';
import PDFUpload from './PDFUpload';
import PDFViewer from './PDFViewer';
import FieldOverlay from './FieldOverlay';
import FieldManager from './FieldManager';
import { identifyFormFields } from '../utils/textExtraction';
import { exportPDFWithFields, organizeFieldsByPage, validateFieldsForExport } from '../utils/pdfExport';

const PDFEditor = () => {
  // PDF state
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [pageHeight, setPageHeight] = useState(0);

  // Fields state
  const [fields, setFields] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [autoDetectedFields, setAutoDetectedFields] = useState([]);

  // UI state
  const [isExporting, setIsExporting] = useState(false);
  const [showFieldManager, setShowFieldManager] = useState(true);
  const [notification, setNotification] = useState(null);

  const containerRef = useRef(null);

  // Handle PDF file selection
  const handleFileSelect = useCallback(async (file, fileUrl) => {
    setPdfFile(file);
    setPdfUrl(fileUrl);
    setCurrentPage(1);
    setFields([]);
    setAutoDetectedFields([]);
    setNotification({ type: 'success', message: 'PDF loaded successfully!' });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Handle PDF load success
  const handlePDFLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
  }, []);

  // Handle text extraction from PDF
  const handleTextExtracted = useCallback((pageNumber, textItems) => {
    if (textItems.length === 0) return;

    // Auto-detect form fields from extracted text
    const detectedFields = identifyFormFields(textItems, 595, 842); // A4 dimensions
    
    // Add page number to detected fields
    const fieldsWithPage = detectedFields.map(field => ({
      ...field,
      page: pageNumber
    }));

    setAutoDetectedFields(prev => {
      const filtered = prev.filter(f => f.page !== pageNumber);
      return [...filtered, ...fieldsWithPage];
    });
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page, newScale) => {
    if (newScale !== undefined) {
      setScale(newScale);
    } else {
      setCurrentPage(page);
    }
  }, []);

  // Field management functions
  const handleAddField = useCallback((field) => {
    setFields(prev => [...prev, field]);
    setNotification({ type: 'success', message: 'Field added successfully!' });
    setTimeout(() => setNotification(null), 2000);
  }, []);

  const handleUpdateField = useCallback((fieldId, updates) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  }, []);

  const handleDeleteField = useCallback((fieldId) => {
    setFields(prev => prev.filter(field => field.id !== fieldId));
    setNotification({ type: 'info', message: 'Field deleted' });
    setTimeout(() => setNotification(null), 2000);
  }, []);

  // Auto-detect fields
  const handleAutoDetectFields = useCallback(() => {
    const newFields = autoDetectedFields.map(field => ({
      ...field,
      id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
    
    setFields(prev => [...prev, ...newFields]);
    setNotification({ 
      type: 'success', 
      message: `Added ${newFields.length} auto-detected fields!` 
    });
    setTimeout(() => setNotification(null), 3000);
  }, [autoDetectedFields]);

  // Export PDF
  const handleExportPDF = useCallback(async () => {
    if (!pdfFile || fields.length === 0) {
      setNotification({ 
        type: 'error', 
        message: 'No PDF loaded or no fields to export' 
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Validate fields
    const validation = validateFieldsForExport(fields);
    if (!validation.isValid) {
      setNotification({ 
        type: 'error', 
        message: `Validation errors: ${validation.errors.join(', ')}` 
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (validation.warnings.length > 0) {
      console.warn('Export warnings:', validation.warnings);
    }

    setIsExporting(true);
    try {
      const fieldsData = organizeFieldsByPage(fields);
      await exportPDFWithFields(pdfFile, fieldsData, 'edited-document.pdf');
      setNotification({ 
        type: 'success', 
        message: 'PDF exported successfully!' 
      });
    } catch (error) {
      console.error('Export error:', error);
      setNotification({ 
        type: 'error', 
        message: 'Failed to export PDF: ' + error.message 
      });
    } finally {
      setIsExporting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  }, [pdfFile, fields]);

  // Get current page fields
  const currentPageFields = fields.filter(field => field.page === currentPage);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PDF Editor</h1>
            {pdfFile && (
              <p className="text-sm text-gray-600 mt-1">
                {pdfFile.name} • {fields.length} field{fields.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {pdfFile && autoDetectedFields.length > 0 && (
              <button
                onClick={handleAutoDetectFields}
                className="btn btn-outline btn-sm"
              >
                Auto-detect Fields ({autoDetectedFields.length})
              </button>
            )}

            {pdfFile && (
              <button
                onClick={() => setShowFieldManager(!showFieldManager)}
                className="btn btn-outline btn-sm"
              >
                {showFieldManager ? 'Hide' : 'Show'} Fields
              </button>
            )}

            {pdfFile && fields.length > 0 && (
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="btn btn-primary btn-sm"
              >
                {isExporting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Exporting...
                  </>
                ) : (
                  'Export PDF'
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`alert alert-${notification.type} mx-6 mt-4`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {!pdfFile ? (
          /* Upload Screen */
          <div className="flex-1 flex items-center justify-center">
            <PDFUpload onFileSelect={handleFileSelect} />
          </div>
        ) : (
          /* Editor Interface */
          <>
            {/* PDF Viewer Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div 
                ref={containerRef}
                className="flex-1 overflow-auto bg-gray-100 p-6"
              >
                <div className="relative inline-block">
                  <PDFViewer
                    fileUrl={pdfUrl}
                    onLoadSuccess={handlePDFLoadSuccess}
                    onTextExtracted={handleTextExtracted}
                    selectedPage={currentPage}
                    onPageChange={handlePageChange}
                    scale={scale}
                  />
                  
                  {/* Field Overlay */}
                  <FieldOverlay
                    fields={currentPageFields}
                    onFieldUpdate={handleUpdateField}
                    onFieldDelete={handleDeleteField}
                    scale={scale}
                    pageHeight={842} // A4 height in points
                    isEditMode={isEditMode}
                  />
                </div>
              </div>
            </div>

            {/* Field Manager Sidebar */}
            {showFieldManager && (
              <FieldManager
                fields={fields}
                onAddField={handleAddField}
                onUpdateField={handleUpdateField}
                onDeleteField={handleDeleteField}
                isEditMode={isEditMode}
                onToggleEditMode={() => setIsEditMode(!isEditMode)}
                currentPage={currentPage}
                pageHeight={842}
              />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {pdfFile && (
        <footer className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              {numPages && (
                <span>Page {currentPage} of {numPages}</span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span>Zoom: {Math.round(scale * 100)}%</span>
              <span>Fields: {fields.length}</span>
              {isEditMode && (
                <span className="text-blue-600 font-medium">Edit Mode Active</span>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PDFEditor;
