import { useState } from 'react';

const FieldManager = ({ 
  fields, 
  onAddField, 
  onUpdateField, 
  onDeleteField,
  isEditMode,
  onToggleEditMode,
  currentPage,
  pageHeight 
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newFieldType, setNewFieldType] = useState('text');

  const fieldTypes = [
    { value: 'text', label: 'Text Field', icon: '📝' },
    { value: 'email', label: 'Email Field', icon: '📧' },
    { value: 'tel', label: 'Phone Field', icon: '📞' },
    { value: 'date', label: 'Date Field', icon: '📅' },
    { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { value: 'textarea', label: 'Text Area', icon: '📄' },
    { value: 'signature', label: 'Signature', icon: '✍️' }
  ];

  const handleAddField = (type) => {
    const newField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      x: 100, // Default position
      y: pageHeight - 150, // Default position from top
      width: type === 'checkbox' ? 20 : 150,
      height: type === 'textarea' ? 60 : 25,
      value: type === 'checkbox' ? false : '',
      placeholder: getPlaceholderForType(type),
      page: currentPage
    };

    if (onAddField) {
      onAddField(newField);
    }
    setShowAddMenu(false);
  };

  const getPlaceholderForType = (type) => {
    const placeholders = {
      text: 'Enter text here',
      email: 'Enter email address',
      tel: 'Enter phone number',
      date: 'Select date',
      textarea: 'Enter long text here',
      signature: 'Click to sign',
      checkbox: ''
    };
    return placeholders[type] || 'Enter text here';
  };

  const handleFieldPropertyChange = (fieldId, property, value) => {
    if (onUpdateField) {
      onUpdateField(fieldId, { [property]: value });
    }
  };

  const currentPageFields = fields.filter(field => field.page === currentPage);

  return (
    <div className="bg-white border-l border-gray-300 w-80 h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Field Manager</h2>
          <button
            onClick={onToggleEditMode}
            className={`btn btn-sm ${isEditMode ? 'btn-primary' : 'btn-outline'}`}
          >
            {isEditMode ? 'Exit Edit' : 'Edit Mode'}
          </button>
        </div>

        {/* Add Field Button */}
        {isEditMode && (
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="btn btn-primary btn-sm w-full"
            >
              + Add Field
            </button>

            {/* Add Field Menu */}
            {showAddMenu && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <div className="text-sm font-medium text-gray-700 mb-2">Select Field Type:</div>
                  <div className="space-y-1">
                    {fieldTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => handleAddField(type.value)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                      >
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Field List */}
      <div className="p-4">
        <div className="text-sm text-gray-600 mb-3">
          Page {currentPage} - {currentPageFields.length} field{currentPageFields.length !== 1 ? 's' : ''}
        </div>

        {currentPageFields.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📝</div>
            <p>No fields on this page</p>
            {isEditMode && (
              <p className="text-sm mt-2">Click "Add Field" to get started</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {currentPageFields.map(field => (
              <FieldItem
                key={field.id}
                field={field}
                isEditMode={isEditMode}
                onUpdate={(property, value) => handleFieldPropertyChange(field.id, property, value)}
                onDelete={() => onDeleteField(field.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      {isEditMode && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <div className="font-medium mb-2">Edit Mode Instructions:</div>
            <ul className="space-y-1 text-xs">
              <li>• Click fields to select them</li>
              <li>• Drag fields to move them</li>
              <li>• Press Delete to remove selected field</li>
              <li>• Double-click to edit field properties</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const FieldItem = ({ field, isEditMode, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getFieldIcon = (type) => {
    const icons = {
      text: '📝',
      email: '📧',
      tel: '📞',
      date: '📅',
      checkbox: '☑️',
      textarea: '📄',
      signature: '✍️'
    };
    return icons[type] || '📝';
  };

  const getFieldLabel = (field) => {
    if (field.label) return field.label;
    if (field.placeholder) return field.placeholder;
    return `${field.type.charAt(0).toUpperCase() + field.type.slice(1)} Field`;
  };

  const getFieldValue = (field) => {
    if (field.type === 'checkbox') {
      return field.value ? 'Checked' : 'Unchecked';
    }
    return field.value || 'Empty';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          <span className="text-lg">{getFieldIcon(field.type)}</span>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">
              {getFieldLabel(field)}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {getFieldValue(field)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {isEditMode && (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="btn btn-xs btn-ghost"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
              <button
                onClick={onDelete}
                className="btn btn-xs btn-error btn-ghost"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expanded Properties */}
      {isExpanded && isEditMode && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <div>
            <label className="text-xs font-medium text-gray-600">Position</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={Math.round(field.x)}
                onChange={(e) => onUpdate('x', parseInt(e.target.value))}
                className="input input-xs flex-1"
                placeholder="X"
              />
              <input
                type="number"
                value={Math.round(field.y)}
                onChange={(e) => onUpdate('y', parseInt(e.target.value))}
                className="input input-xs flex-1"
                placeholder="Y"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">Size</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={Math.round(field.width)}
                onChange={(e) => onUpdate('width', parseInt(e.target.value))}
                className="input input-xs flex-1"
                placeholder="Width"
              />
              <input
                type="number"
                value={Math.round(field.height)}
                onChange={(e) => onUpdate('height', parseInt(e.target.value))}
                className="input input-xs flex-1"
                placeholder="Height"
              />
            </div>
          </div>

          {field.type !== 'checkbox' && (
            <div>
              <label className="text-xs font-medium text-gray-600">Placeholder</label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => onUpdate('placeholder', e.target.value)}
                className="input input-xs w-full"
              />
            </div>
          )}

          {field.type === 'checkbox' && (
            <div>
              <label className="text-xs font-medium text-gray-600">Label</label>
              <input
                type="text"
                value={field.label || ''}
                onChange={(e) => onUpdate('label', e.target.value)}
                className="input input-xs w-full"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FieldManager;
