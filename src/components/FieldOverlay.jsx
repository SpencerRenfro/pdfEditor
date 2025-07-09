import React from 'react';

const FieldOverlay = ({ fields, updateField, deleteField, isEditMode }) => {
  const handleFieldDrag = (e, fieldId) => {
    if (!isEditMode) return;

    e.preventDefault();
    e.stopPropagation();

    const field = fields.find(f => f.id === fieldId);
    const fieldElement = e.currentTarget;
    const containerElement = fieldElement.parentElement;
    const containerRect = containerElement.getBoundingClientRect();

    // Calculate initial offset from mouse to field's top-left corner
    const initialOffsetX = e.clientX - (containerRect.left + field.x);
    const initialOffsetY = e.clientY - (containerRect.top + field.y);

    // Add visual feedback
    fieldElement.style.opacity = '0.8';
    fieldElement.style.transform = 'scale(1.02)';
    fieldElement.style.zIndex = '30';
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent) => {
      moveEvent.preventDefault();

      // Calculate new position relative to container
      const newX = moveEvent.clientX - containerRect.left - initialOffsetX;
      const newY = moveEvent.clientY - containerRect.top - initialOffsetY;

      // Constrain to container bounds
      const maxX = containerRect.width - field.width;
      const maxY = containerRect.height - field.height;

      updateField(fieldId, {
        x: Math.max(0, Math.min(maxX, newX)),
        y: Math.max(0, Math.min(maxY, newY))
      });
    };

    const handleMouseUp = () => {
      // Remove visual feedback
      fieldElement.style.opacity = '';
      fieldElement.style.transform = '';
      fieldElement.style.zIndex = '';
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleFieldResize = (e, fieldId, direction) => {
    if (!isEditMode) return;
    
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const field = fields.find(f => f.id === fieldId);
    const startWidth = field.width;
    const startHeight = field.height;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('right')) {
        newWidth = Math.max(50, startWidth + deltaX);
      }
      if (direction.includes('bottom')) {
        newHeight = Math.max(20, startHeight + deltaY);
      }
      
      updateField(fieldId, { width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      {fields.map(field => (
        <div
          key={field.id}
          className={`absolute border-2 bg-white rounded shadow-sm transition-all group ${
            isEditMode
              ? 'border-blue-400 hover:border-blue-600 hover:shadow-md'
              : 'border-gray-300'
          }`}
          style={{
            left: `${field.x}px`,
            top: `${field.y}px`,
            width: `${field.width}px`,
            height: `${field.height}px`,
            zIndex: 20
          }}
        >
          {/* Drag Handle - Only visible in edit mode */}
          {isEditMode && (
            <div
              className="absolute -top-6 left-0 right-0 h-6 bg-blue-500 text-white text-xs px-2 py-1 rounded-t cursor-grab active:cursor-grabbing flex items-center justify-between"
              onMouseDown={(e) => handleFieldDrag(e, field.id)}
            >
              <span>{field.type}</span>
              <span className="text-xs">⋮⋮</span>
            </div>
          )}
          {/* Field Content Container */}
          <div
            className={`w-full h-full relative ${isEditMode ? 'cursor-move' : ''}`}
            onMouseDown={(e) => {
              // Only allow dragging if clicking on empty space, not on input elements
              if (isEditMode && e.target === e.currentTarget) {
                handleFieldDrag(e, field.id);
              }
            }}
          >
            {/* Field Content */}
            {field.type === 'checkbox' ? (
              <input
                type="checkbox"
                checked={field.value}
                onChange={e => updateField(field.id, { value: e.target.checked })}
                className="w-full h-full cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
            ) : field.type === 'textarea' ? (
              <textarea
                value={field.value}
                onChange={e => updateField(field.id, { value: e.target.value })}
                placeholder={field.placeholder}
                className="w-full h-full p-2 text-sm border-none outline-none resize-none cursor-text bg-transparent"
                style={{
                  fontFamily: field.type === 'signature' ? 'cursive' : 'inherit',
                  fontSize: field.type === 'signature' ? '18px' : '14px'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <input
                type={field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : 'text'}
                value={field.value}
                onChange={e => updateField(field.id, { value: e.target.value })}
                placeholder={field.placeholder}
                className={`w-full h-full p-2 text-sm border-none outline-none cursor-text bg-transparent ${
                  field.type === 'signature' ? 'signature-field' : ''
                }`}
                style={{
                  fontFamily: field.type === 'signature' ? '"Dancing Script", "Brush Script MT", cursive' : 'inherit',
                  fontSize: field.type === 'signature' ? '20px' : '14px',
                  fontWeight: field.type === 'signature' ? '500' : 'normal',
                  color: field.type === 'signature' ? '#1a365d' : 'inherit',
                  transform: field.type === 'signature' ? 'rotate(-1deg)' : 'none',
                  letterSpacing: field.type === 'signature' ? '0.5px' : 'normal'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>

          {/* Delete Button */}
          {isEditMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteField(field.id);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors flex items-center justify-center"
              title="Delete field"
            >
              ×
            </button>
          )}

          {/* Resize Handle */}
          {isEditMode && (
            <div
              className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
              onMouseDown={(e) => handleFieldResize(e, field.id, 'bottom-right')}
              title="Resize field"
            />
          )}


        </div>
      ))}
    </>
  );
};

export default FieldOverlay;
