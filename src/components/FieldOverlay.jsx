import { useState, useRef, useEffect } from 'react';

const FieldOverlay = ({ 
  fields, 
  onFieldUpdate, 
  onFieldDelete, 
  scale = 1.0,
  pageHeight,
  isEditMode = false 
}) => {
  const [selectedField, setSelectedField] = useState(null);
  const [draggedField, setDraggedField] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleFieldChange = (fieldId, value) => {
    if (onFieldUpdate) {
      onFieldUpdate(fieldId, { value });
    }
  };

  const handleFieldClick = (field, event) => {
    if (isEditMode) {
      event.stopPropagation();
      setSelectedField(field.id);
    }
  };

  const handleFieldDoubleClick = (field, event) => {
    if (isEditMode) {
      event.stopPropagation();
      // Focus the input for editing
      const input = event.target.querySelector('input, textarea');
      if (input) {
        input.focus();
      }
    }
  };

  const handleMouseDown = (field, event) => {
    if (isEditMode && event.button === 0) { // Left mouse button
      setDraggedField(field.id);
      const rect = event.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
      event.preventDefault();
    }
  };

  const handleMouseMove = (event) => {
    if (draggedField && isEditMode) {
      const container = event.currentTarget.getBoundingClientRect();
      const newX = (event.clientX - container.left - dragOffset.x) / scale;
      const newY = (event.clientY - container.top - dragOffset.y) / scale;
      
      if (onFieldUpdate) {
        onFieldUpdate(draggedField, { 
          x: Math.max(0, newX),
          y: Math.max(0, newY)
        });
      }
    }
  };

  const handleMouseUp = () => {
    setDraggedField(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleKeyDown = (event) => {
    if (isEditMode && selectedField && event.key === 'Delete') {
      if (onFieldDelete) {
        onFieldDelete(selectedField);
      }
      setSelectedField(null);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedField, isEditMode]);

  const renderField = (field) => {
    const isSelected = selectedField === field.id;
    const isDragging = draggedField === field.id;

    const fieldStyle = {
      position: 'absolute',
      left: `${field.x * scale}px`,
      top: `${(pageHeight - field.y - field.height) * scale}px`,
      width: `${field.width * scale}px`,
      height: `${field.height * scale}px`,
      zIndex: isDragging ? 1000 : isSelected ? 100 : 10,
      cursor: isEditMode ? 'move' : 'default'
    };

    const inputStyle = {
      width: '100%',
      height: '100%',
      border: isEditMode ? '2px solid #3b82f6' : '1px solid #d1d5db',
      borderRadius: '4px',
      padding: '2px 6px',
      fontSize: `${12 * scale}px`,
      backgroundColor: isEditMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.9)',
      outline: 'none',
      resize: 'none'
    };

    if (isSelected && isEditMode) {
      inputStyle.boxShadow = '0 0 0 2px #3b82f6';
    }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div
            key={field.id}
            style={fieldStyle}
            onClick={(e) => handleFieldClick(field, e)}
            onDoubleClick={(e) => handleFieldDoubleClick(field, e)}
            onMouseDown={(e) => handleMouseDown(field, e)}
          >
            <input
              type={field.type}
              value={field.value || ''}
              placeholder={field.placeholder}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              style={inputStyle}
              disabled={isEditMode}
            />
            {isSelected && isEditMode && (
              <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                {field.label || field.type}
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <div
            key={field.id}
            style={fieldStyle}
            onClick={(e) => handleFieldClick(field, e)}
            onDoubleClick={(e) => handleFieldDoubleClick(field, e)}
            onMouseDown={(e) => handleMouseDown(field, e)}
          >
            <input
              type="date"
              value={field.value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              style={inputStyle}
              disabled={isEditMode}
            />
            {isSelected && isEditMode && (
              <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Date Field
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div
            key={field.id}
            style={fieldStyle}
            onClick={(e) => handleFieldClick(field, e)}
            onMouseDown={(e) => handleMouseDown(field, e)}
          >
            <label className="flex items-center h-full cursor-pointer">
              <input
                type="checkbox"
                checked={field.value || false}
                onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                className="checkbox checkbox-sm"
                disabled={isEditMode}
              />
              {field.label && (
                <span 
                  className="ml-2 text-sm"
                  style={{ fontSize: `${12 * scale}px` }}
                >
                  {field.label}
                </span>
              )}
            </label>
            {isSelected && isEditMode && (
              <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Checkbox
              </div>
            )}
          </div>
        );

      case 'signature':
        return (
          <div
            key={field.id}
            style={fieldStyle}
            onClick={(e) => handleFieldClick(field, e)}
            onMouseDown={(e) => handleMouseDown(field, e)}
          >
            <div
              style={{
                ...inputStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isEditMode ? 'move' : 'pointer',
                fontStyle: 'italic',
                color: field.value ? '#000' : '#666'
              }}
              onClick={() => !isEditMode && handleSignatureClick(field.id)}
            >
              {field.value || 'Click to sign'}
            </div>
            {isSelected && isEditMode && (
              <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Signature Field
              </div>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div
            key={field.id}
            style={fieldStyle}
            onClick={(e) => handleFieldClick(field, e)}
            onDoubleClick={(e) => handleFieldDoubleClick(field, e)}
            onMouseDown={(e) => handleMouseDown(field, e)}
          >
            <textarea
              value={field.value || ''}
              placeholder={field.placeholder}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              style={inputStyle}
              disabled={isEditMode}
            />
            {isSelected && isEditMode && (
              <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Text Area
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const handleSignatureClick = (fieldId) => {
    // Simple signature implementation - in a real app, you'd use a signature pad
    const signature = prompt('Enter your signature:');
    if (signature) {
      handleFieldChange(fieldId, signature);
    }
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ pointerEvents: isEditMode || fields.length > 0 ? 'auto' : 'none' }}
    >
      {fields.map(renderField)}
      
      {isEditMode && selectedField && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
          <h3 className="font-semibold mb-2">Field Properties</h3>
          <div className="space-y-2">
            <button
              onClick={() => onFieldDelete && onFieldDelete(selectedField)}
              className="btn btn-sm btn-error"
            >
              Delete Field
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldOverlay;
