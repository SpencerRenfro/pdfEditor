/**
 * Utility functions for extracting and processing text from PDF pages
 * to identify potential editable fields
 */

/**
 * Patterns that commonly indicate form fields
 */
const FIELD_PATTERNS = {
  // Common field indicators
  underscores: /_{3,}/g,
  brackets: /\[[\s_]*\]/g,
  parentheses: /\([\s_]*\)/g,
  dots: /\.{3,}/g,
  
  // Form field labels
  name: /\b(name|full\s*name|first\s*name|last\s*name)\s*[:_\-]?\s*$/i,
  email: /\b(email|e-mail|email\s*address)\s*[:_\-]?\s*$/i,
  phone: /\b(phone|telephone|tel|mobile|cell)\s*[:_\-]?\s*$/i,
  address: /\b(address|street|city|state|zip|postal)\s*[:_\-]?\s*$/i,
  date: /\b(date|born|birth|dob)\s*[:_\-]?\s*$/i,
  signature: /\b(signature|sign|signed)\s*[:_\-]?\s*$/i,
  
  // Checkbox indicators
  checkbox: /\b(check|select|choose|mark)\s*(one|all|applicable)?\s*[:_\-]?\s*$/i,
  yesno: /\b(yes|no)\s*[:_\-]?\s*$/i,
};

/**
 * Analyze text items to identify potential form fields
 * @param {Array} textItems - Array of text items with positioning data
 * @param {number} pageWidth - Width of the PDF page
 * @param {number} pageHeight - Height of the PDF page
 * @returns {Array} Array of identified field objects
 */
export function identifyFormFields(textItems, pageWidth, pageHeight) {
  const fields = [];
  const processedItems = [];

  // Group text items by approximate line (similar Y coordinates)
  const lines = groupTextByLines(textItems);

  lines.forEach((line, lineIndex) => {
    // Look for field patterns in each line
    const lineText = line.map(item => item.text).join(' ');
    
    // Check for underscores, brackets, etc.
    const fieldIndicators = findFieldIndicators(line, lineText);
    fieldIndicators.forEach(indicator => {
      fields.push(createFieldFromIndicator(indicator, lineIndex, pageWidth, pageHeight));
    });

    // Check for labeled fields (text followed by space for input)
    const labeledFields = findLabeledFields(line, lineText);
    labeledFields.forEach(field => {
      fields.push(createFieldFromLabel(field, lineIndex, pageWidth, pageHeight));
    });
  });

  // Look for checkbox patterns
  const checkboxFields = findCheckboxFields(textItems, pageWidth, pageHeight);
  fields.push(...checkboxFields);

  return fields;
}

/**
 * Group text items by lines based on Y coordinates
 * @param {Array} textItems - Array of text items
 * @returns {Array} Array of lines, each containing text items
 */
function groupTextByLines(textItems) {
  const lines = [];
  const tolerance = 5; // Y-coordinate tolerance for grouping

  textItems.forEach(item => {
    let addedToLine = false;
    
    for (let line of lines) {
      if (Math.abs(line[0].y - item.y) <= tolerance) {
        line.push(item);
        addedToLine = true;
        break;
      }
    }
    
    if (!addedToLine) {
      lines.push([item]);
    }
  });

  // Sort items within each line by X coordinate
  lines.forEach(line => {
    line.sort((a, b) => a.x - b.x);
  });

  // Sort lines by Y coordinate (top to bottom)
  lines.sort((a, b) => b[0].y - a[0].y);

  return lines;
}

/**
 * Find field indicators like underscores, brackets, etc.
 * @param {Array} line - Text items in a line
 * @param {string} lineText - Combined text of the line
 * @returns {Array} Array of field indicators
 */
function findFieldIndicators(line, lineText) {
  const indicators = [];

  // Find underscores
  const underscoreMatches = [...lineText.matchAll(FIELD_PATTERNS.underscores)];
  underscoreMatches.forEach(match => {
    const indicator = findTextItemForMatch(line, match, lineText);
    if (indicator) {
      indicators.push({
        type: 'text',
        ...indicator,
        pattern: 'underscores'
      });
    }
  });

  // Find brackets
  const bracketMatches = [...lineText.matchAll(FIELD_PATTERNS.brackets)];
  bracketMatches.forEach(match => {
    const indicator = findTextItemForMatch(line, match, lineText);
    if (indicator) {
      indicators.push({
        type: 'text',
        ...indicator,
        pattern: 'brackets'
      });
    }
  });

  return indicators;
}

/**
 * Find labeled fields (text labels followed by space for input)
 * @param {Array} line - Text items in a line
 * @param {string} lineText - Combined text of the line
 * @returns {Array} Array of labeled fields
 */
function findLabeledFields(line, lineText) {
  const fields = [];

  Object.entries(FIELD_PATTERNS).forEach(([fieldType, pattern]) => {
    if (fieldType === 'underscores' || fieldType === 'brackets' || 
        fieldType === 'parentheses' || fieldType === 'dots') {
      return; // Skip indicator patterns
    }

    const matches = [...lineText.matchAll(pattern)];
    matches.forEach(match => {
      const labelItem = findTextItemForMatch(line, match, lineText);
      if (labelItem) {
        // Look for space after the label for input
        const nextItems = line.filter(item => item.x > labelItem.x + labelItem.width);
        if (nextItems.length > 0) {
          const inputSpace = nextItems[0];
          fields.push({
            type: getFieldTypeFromPattern(fieldType),
            label: match[0],
            labelItem,
            inputArea: inputSpace,
            fieldType
          });
        }
      }
    });
  });

  return fields;
}

/**
 * Find checkbox fields
 * @param {Array} textItems - All text items
 * @param {number} pageWidth - Page width
 * @param {number} pageHeight - Page height
 * @returns {Array} Array of checkbox fields
 */
function findCheckboxFields(textItems, pageWidth, pageHeight) {
  const checkboxes = [];

  // Look for square brackets or checkbox-like patterns
  textItems.forEach(item => {
    if (item.text.match(/^\s*\[\s*\]\s*$/) || 
        item.text.match(/^\s*☐\s*$/) || 
        item.text.match(/^\s*□\s*$/)) {
      
      // Find nearby text that might be the label
      const nearbyItems = textItems.filter(other => 
        other !== item &&
        Math.abs(other.y - item.y) <= 10 && // Same line
        other.x > item.x + item.width && // To the right
        other.x - (item.x + item.width) <= 50 // Not too far
      );

      if (nearbyItems.length > 0) {
        const label = nearbyItems
          .sort((a, b) => a.x - b.x)[0]; // Closest to the checkbox

        checkboxes.push({
          type: 'checkbox',
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          label: label.text,
          checked: false
        });
      }
    }
  });

  return checkboxes;
}

/**
 * Find the text item that corresponds to a regex match
 * @param {Array} line - Text items in the line
 * @param {Object} match - Regex match object
 * @param {string} lineText - Full line text
 * @returns {Object|null} Text item or null
 */
function findTextItemForMatch(line, match, lineText) {
  let currentPos = 0;
  
  for (let item of line) {
    const itemEnd = currentPos + item.text.length;
    
    if (match.index >= currentPos && match.index < itemEnd) {
      return item;
    }
    
    currentPos = itemEnd + 1; // +1 for space between items
  }
  
  return null;
}

/**
 * Create a field object from an indicator
 * @param {Object} indicator - Field indicator
 * @param {number} lineIndex - Line index
 * @param {number} pageWidth - Page width
 * @param {number} pageHeight - Page height
 * @returns {Object} Field object
 */
function createFieldFromIndicator(indicator, lineIndex, pageWidth, pageHeight) {
  return {
    id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: indicator.type,
    x: indicator.x,
    y: indicator.y,
    width: Math.max(indicator.width, 100), // Minimum width
    height: Math.max(indicator.height, 20), // Minimum height
    value: '',
    placeholder: getPlaceholderFromPattern(indicator.pattern),
    lineIndex,
    pattern: indicator.pattern
  };
}

/**
 * Create a field object from a label
 * @param {Object} field - Labeled field
 * @param {number} lineIndex - Line index
 * @param {number} pageWidth - Page width
 * @param {number} pageHeight - Page height
 * @returns {Object} Field object
 */
function createFieldFromLabel(field, lineIndex, pageWidth, pageHeight) {
  return {
    id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: field.type,
    x: field.inputArea.x,
    y: field.inputArea.y,
    width: Math.max(150, pageWidth - field.inputArea.x - 50),
    height: Math.max(field.inputArea.height, 20),
    value: '',
    label: field.label,
    placeholder: getPlaceholderFromFieldType(field.fieldType),
    lineIndex,
    fieldType: field.fieldType
  };
}

/**
 * Get field type from pattern name
 * @param {string} patternName - Pattern name
 * @returns {string} Field type
 */
function getFieldTypeFromPattern(patternName) {
  const typeMap = {
    name: 'text',
    email: 'email',
    phone: 'tel',
    address: 'text',
    date: 'date',
    signature: 'signature',
    checkbox: 'checkbox',
    yesno: 'checkbox'
  };
  
  return typeMap[patternName] || 'text';
}

/**
 * Get placeholder text from pattern
 * @param {string} pattern - Pattern name
 * @returns {string} Placeholder text
 */
function getPlaceholderFromPattern(pattern) {
  const placeholders = {
    underscores: 'Enter text here',
    brackets: 'Enter text here',
    parentheses: 'Enter text here',
    dots: 'Enter text here'
  };
  
  return placeholders[pattern] || 'Enter text here';
}

/**
 * Get placeholder text from field type
 * @param {string} fieldType - Field type
 * @returns {string} Placeholder text
 */
function getPlaceholderFromFieldType(fieldType) {
  const placeholders = {
    name: 'Enter your name',
    email: 'Enter email address',
    phone: 'Enter phone number',
    address: 'Enter address',
    date: 'Select date',
    signature: 'Click to sign'
  };
  
  return placeholders[fieldType] || 'Enter text here';
}
