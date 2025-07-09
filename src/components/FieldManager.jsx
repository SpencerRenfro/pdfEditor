import React from 'react';

const FieldManager = ({ fields, addField, deleteField, isEditMode }) => {
  const fieldTypes = [
    { type: 'text', label: '📝 Text', icon: '📝' },
    { type: 'email', label: '📧 Email', icon: '📧' },
    { type: 'date', label: '📅 Date', icon: '📅' },
    { type: 'checkbox', label: '☑️ Checkbox', icon: '☑️' },
    { type: 'textarea', label: '📄 Text Area', icon: '📄' },
    { type: 'signature', label: '✍️ Signature', icon: '✍️' }
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Manager</h3>
        
        {/* Add Fields Section */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Add Fields:</h4>
            <div className="grid grid-cols-2 gap-2">
              {fieldTypes.map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => addField(type)}
                  disabled={!isEditMode}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    isEditMode
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                  title={!isEditMode ? 'Enable Edit Mode to add fields' : `Add ${type} field`}
                >
                  <div className="text-lg mb-1">{icon}</div>
                  <div className="text-xs">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                </button>
              ))}
            </div>
          </div>

          {!isEditMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                💡 Enable <strong>Edit Mode</strong> to add and modify fields
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Current Fields List */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h4 className="font-medium text-gray-700 mb-3">
          Current Fields ({fields.length}):
        </h4>
        
        {fields.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-gray-500 text-sm">No fields added yet</p>
            <p className="text-gray-400 text-xs mt-1">
              {isEditMode ? 'Click buttons above to add fields' : 'Enable Edit Mode first'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      #{index + 1} {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                    </span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      {field.type}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteField(field.id)}
                    disabled={!isEditMode}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      isEditMode
                        ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    title={!isEditMode ? 'Enable Edit Mode to delete fields' : 'Delete field'}
                  >
                    Delete
                  </button>
                </div>
                
                <div className="text-xs text-gray-600">
                  <div>Position: ({field.x}, {field.y})</div>
                  <div>Size: {field.width} × {field.height}</div>
                  <div className="mt-1">
                    Value: {
                      field.type === 'checkbox' 
                        ? (field.value ? 'Checked' : 'Unchecked')
                        : (field.value || 'Empty')
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <h4 className="font-medium text-gray-700 mb-2">Instructions:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Enable Edit Mode to add/remove fields</li>
          <li>• Click field buttons to add to PDF</li>
          <li>• Fields can be typed in directly</li>
          <li>• Use fullscreen for better editing</li>
        </ul>
      </div>
    </div>
  );
};

export default FieldManager;
