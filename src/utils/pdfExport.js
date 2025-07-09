import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';

/**
 * Export PDF with form field values filled in
 * @param {File} originalFile - Original PDF file
 * @param {Object} fieldsData - Object containing field data organized by page
 * @param {string} filename - Output filename
 */
export async function exportPDFWithFields(originalFile, fieldsData, filename = 'edited-document.pdf') {
  try {
    // Read the original PDF
    const originalPdfBytes = await originalFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(originalPdfBytes);
    
    // Get pages
    const pages = pdfDoc.getPages();
    
    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Process each page
    for (let pageNum = 1; pageNum <= pages.length; pageNum++) {
      const page = pages[pageNum - 1];
      const pageFields = fieldsData[pageNum] || [];
      
      if (pageFields.length === 0) continue;
      
      const { width: pageWidth, height: pageHeight } = page.getSize();
      
      // Add fields to the page
      for (const field of pageFields) {
        await addFieldToPDF(page, field, pageWidth, pageHeight, helveticaFont, helveticaBoldFont);
      }
    }
    
    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(blob, filename);
    
    return true;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw new Error('Failed to export PDF: ' + error.message);
  }
}

/**
 * Add a single field to a PDF page
 * @param {Object} page - PDF page object
 * @param {Object} field - Field data
 * @param {number} pageWidth - Page width
 * @param {number} pageHeight - Page height
 * @param {Object} font - Regular font
 * @param {Object} boldFont - Bold font
 */
async function addFieldToPDF(page, field, pageWidth, pageHeight, font, boldFont) {
  // Convert coordinates (PDF coordinates start from bottom-left)
  const x = field.x;
  const y = pageHeight - field.y - field.height;
  
  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
      if (field.value) {
        await addTextToPDF(page, field.value, x, y, field.width, field.height, font);
      }
      break;
      
    case 'date':
      if (field.value) {
        const formattedDate = formatDate(field.value);
        await addTextToPDF(page, formattedDate, x, y, field.width, field.height, font);
      }
      break;
      
    case 'textarea':
      if (field.value) {
        await addMultilineTextToPDF(page, field.value, x, y, field.width, field.height, font);
      }
      break;
      
    case 'checkbox':
      await addCheckboxToPDF(page, field.value, x, y, field.width, field.height, font);
      if (field.label) {
        await addTextToPDF(page, field.label, x + field.width + 5, y, 200, field.height, font);
      }
      break;
      
    case 'signature':
      if (field.value) {
        await addSignatureToPDF(page, field.value, x, y, field.width, field.height, boldFont);
      }
      break;
  }
}

/**
 * Add text to PDF page
 * @param {Object} page - PDF page
 * @param {string} text - Text to add
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {Object} font - Font to use
 */
async function addTextToPDF(page, text, x, y, width, height, font) {
  const fontSize = Math.min(12, height * 0.6); // Adjust font size based on field height
  
  // Truncate text if it's too long for the field
  const maxChars = Math.floor(width / (fontSize * 0.6));
  const displayText = text.length > maxChars ? text.substring(0, maxChars - 3) + '...' : text;
  
  page.drawText(displayText, {
    x: x + 2,
    y: y + (height - fontSize) / 2,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
}

/**
 * Add multiline text to PDF page
 * @param {Object} page - PDF page
 * @param {string} text - Text to add
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {Object} font - Font to use
 */
async function addMultilineTextToPDF(page, text, x, y, width, height, font) {
  const fontSize = 10;
  const lineHeight = fontSize * 1.2;
  const maxLines = Math.floor(height / lineHeight);
  const maxCharsPerLine = Math.floor(width / (fontSize * 0.6));
  
  // Split text into lines
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Word is too long, truncate it
        lines.push(word.substring(0, maxCharsPerLine - 3) + '...');
        currentLine = '';
      }
    }
    
    if (lines.length >= maxLines) break;
  }
  
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  
  // Draw lines
  lines.forEach((line, index) => {
    page.drawText(line, {
      x: x + 2,
      y: y + height - (index + 1) * lineHeight,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
  });
}

/**
 * Add checkbox to PDF page
 * @param {Object} page - PDF page
 * @param {boolean} checked - Whether checkbox is checked
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {Object} font - Font to use
 */
async function addCheckboxToPDF(page, checked, x, y, width, height, font) {
  const size = Math.min(width, height, 12);
  
  // Draw checkbox border
  page.drawRectangle({
    x: x,
    y: y + (height - size) / 2,
    width: size,
    height: size,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });
  
  // Draw checkmark if checked
  if (checked) {
    page.drawText('✓', {
      x: x + 1,
      y: y + (height - size) / 2 + 1,
      size: size * 0.8,
      font: font,
      color: rgb(0, 0, 0),
    });
  }
}

/**
 * Add signature to PDF page
 * @param {Object} page - PDF page
 * @param {string} signature - Signature text
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} width - Field width
 * @param {number} height - Field height
 * @param {Object} font - Font to use
 */
async function addSignatureToPDF(page, signature, x, y, width, height, font) {
  const fontSize = Math.min(14, height * 0.7);
  
  // Draw signature line
  page.drawLine({
    start: { x: x, y: y },
    end: { x: x + width, y: y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  
  // Draw signature text
  page.drawText(signature, {
    x: x + 2,
    y: y + 2,
    size: fontSize,
    font: font,
    color: rgb(0, 0, 0.8), // Slightly blue color for signatures
  });
}

/**
 * Format date for display
 * @param {string} dateValue - Date value from input
 * @returns {string} Formatted date string
 */
function formatDate(dateValue) {
  try {
    const date = new Date(dateValue);
    return date.toLocaleDateString();
  } catch (error) {
    return dateValue; // Return original value if parsing fails
  }
}

/**
 * Create a form data structure from fields array
 * @param {Array} fields - Array of field objects
 * @returns {Object} Fields organized by page number
 */
export function organizeFieldsByPage(fields) {
  const fieldsByPage = {};
  
  fields.forEach(field => {
    const page = field.page || 1;
    if (!fieldsByPage[page]) {
      fieldsByPage[page] = [];
    }
    fieldsByPage[page].push(field);
  });
  
  return fieldsByPage;
}

/**
 * Validate fields before export
 * @param {Array} fields - Array of field objects
 * @returns {Object} Validation result
 */
export function validateFieldsForExport(fields) {
  const errors = [];
  const warnings = [];
  
  fields.forEach((field, index) => {
    // Check for required fields (you can customize this logic)
    if (field.required && !field.value) {
      errors.push(`Field ${index + 1} (${field.type}) is required but empty`);
    }
    
    // Check email format
    if (field.type === 'email' && field.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        warnings.push(`Field ${index + 1}: Invalid email format`);
      }
    }
    
    // Check phone format (basic validation)
    if (field.type === 'tel' && field.value) {
      const phoneRegex = /^[\d\s\-\(\)\+]+$/;
      if (!phoneRegex.test(field.value)) {
        warnings.push(`Field ${index + 1}: Invalid phone number format`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
