# React PDF Editor

A powerful React-based PDF editor that allows you to upload PDFs, render them visually in the browser, create interactive editable fields, and export modified PDFs with user input.

![PDF Editor Demo](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=React+PDF+Editor)

## 🚀 Quick Start

### Download & Installation

1. **Clone or Download the Repository**
   ```bash
   git clone <repository-url>
   cd ReactVite_Template
   ```
   
   *Or download as ZIP and extract to your desired folder*

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Application**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   - Navigate to `http://localhost:3001` (or the port shown in terminal)
   - The application will automatically open in your default browser

## 📋 System Requirements

- **Node.js**: v18.20.4 or higher (v20+ recommended)
- **npm**: v8.0.0 or higher
- **Browser**: Chrome, Firefox, Safari, or Edge (Chrome recommended)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space

## 🎯 How to Use

### Step 1: Upload a PDF
1. **Drag & Drop**: Drag a PDF file onto the upload area
2. **Browse**: Click "Choose PDF File" to select from your computer
3. **Requirements**: PDF files only, maximum 10MB

### Step 2: Add Form Fields
1. **Enter Edit Mode**: Click the "Edit Mode" button in the header
2. **Add Fields**: Use the Field Manager sidebar to add different field types:
   - 📝 **Text Field**: Basic text input
   - 📧 **Email Field**: Email input with validation
   - 📞 **Phone Field**: Phone number input
   - 📅 **Date Field**: Date picker
   - ☑️ **Checkbox**: Checkable box
   - 📄 **Text Area**: Multi-line text input
   - ✍️ **Signature Field**: Cursive signature input

### Step 3: Position Fields
1. **Drag to Move**: Click and drag fields to position them on the PDF
2. **Resize**: Use resize handles on signature fields to adjust size
3. **Delete**: Click the red "×" button or press Delete key to remove fields

### Step 4: Fill Out the Form
1. **Exit Edit Mode**: Click "Exit Edit" to switch to form-filling mode
2. **Fill Fields**: Click in text fields to type, check boxes, add signatures
3. **Signature**: Click signature fields and enter your name for cursive display

### Step 5: Export PDF
1. **Export**: Click "Export PDF" button to download the completed form
2. **Save**: The modified PDF will download to your default download folder

## 🎨 Features

### ✅ Core Features
- **PDF Upload & Rendering**: Drag-and-drop upload with visual PDF display
- **Interactive Form Fields**: 7 different field types with full interactivity
- **Field Management**: Add, edit, delete, and position fields with precision
- **Signature Fields**: Text-to-cursive signature conversion with resizing
- **Multi-page Support**: Navigate between PDF pages seamlessly
- **Fullscreen Mode**: Dedicated fullscreen PDF viewing
- **Export Functionality**: Download modified PDFs with form data
- **Auto-detection**: Automatically detect potential form fields in PDFs

### 🎛️ Advanced Features
- **Edit/Form Mode Toggle**: Switch between field editing and form filling
- **Real-time Preview**: See changes instantly as you work
- **Field Validation**: Email format validation and required field checking
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Delete key for field removal, F11 for fullscreen

## 🛠️ Technical Details

### Built With
- **React 19**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **react-pdf**: PDF rendering and text extraction
- **pdf-lib**: PDF manipulation and export
- **Tailwind CSS**: Utility-first CSS framework
- **DaisyUI**: Beautiful UI components

### Project Structure
```
ReactVite_Template/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── PDFEditor.jsx   # Main editor component
│   │   ├── PDFUpload.jsx   # File upload component
│   │   ├── PDFViewer.jsx   # PDF rendering component
│   │   ├── FieldOverlay.jsx # Interactive field overlay
│   │   └── FieldManager.jsx # Field management sidebar
│   ├── utils/              # Utility functions
│   │   ├── textExtraction.js # Text analysis and field detection
│   │   └── pdfExport.js    # PDF export functionality
│   ├── App.jsx             # Root component
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Environment Setup
1. **Development**: `npm run dev` - Hot reload enabled
2. **Production**: `npm run build` then `npm run preview`
3. **Debugging**: Open browser dev tools for console logs

## 🐛 Troubleshooting

### Common Issues & Solutions

**PDF Won't Load**
- ✅ Ensure file is a valid PDF (not image or other format)
- ✅ Check file size is under 10MB
- ✅ Try a different PDF file to test

**Can't Type in Fields**
- ✅ Make sure you're NOT in Edit Mode (should show green background)
- ✅ Click directly inside the white field area
- ✅ Try refreshing the page and re-uploading the PDF

**Fields Not Appearing**
- ✅ Ensure you're in Edit Mode when adding fields
- ✅ Check the Field Manager sidebar is visible
- ✅ Try adding a field and look for it on the PDF

**Export Not Working**
- ✅ Ensure you have at least one field with data
- ✅ Check browser's download settings
- ✅ Try a different browser (Chrome recommended)

**Performance Issues**
- ✅ Use smaller PDF files (under 5MB recommended)
- ✅ Close other browser tabs
- ✅ Try Chrome browser for best performance

### Browser Compatibility
| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended browser |
| Firefox | ✅ Full | Good performance |
| Safari | ⚠️ Partial | Some PDF features limited |
| Edge | ✅ Full | Good alternative to Chrome |

## 📞 Support

### Getting Help
1. **Check this README** for common solutions
2. **Browser Console**: Press F12 and check for error messages
3. **Try Different PDF**: Test with a simple PDF file
4. **Refresh Page**: Sometimes a simple refresh fixes issues

### Reporting Issues
When reporting problems, please include:
- Browser name and version
- PDF file size and type
- Steps to reproduce the issue
- Any error messages from browser console

## 🔮 Future Enhancements

- 🎨 **Drawing-based signatures** with touch/mouse drawing
- 📊 **Form templates** for common document types
- ☁️ **Cloud storage** integration (Google Drive, Dropbox)
- 👥 **Collaborative editing** for team workflows
- 🔍 **OCR text recognition** for scanned documents
- 🎯 **Advanced field validation** and formatting
- 📱 **Mobile app** for iOS and Android

## 📄 License

This project is open source and available under the MIT License.

---

**Made with ❤️ using React, Vite, and modern web technologies**
