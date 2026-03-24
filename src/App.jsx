import React, { useEffect, useMemo, useState } from 'react';
import {
  Upload,
  Search,
  File,
  Image,
  FileText,
  Folder,
  X,
  Eye,
  Loader2,
  FileType,
  Download,
  Trash2,
} from 'lucide-react';
import * as mammoth from 'mammoth';

// Save all uploaded files in browser storage
const STORAGE_KEY = 'ai-file-organizer-files';

// Convert file size to readable text
function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Format upload date
function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return 'Unknown date';
  }
}

// Read file as base64 for preview and download
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Read file as plain text
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Get only base64 part from data URL
function extractBase64FromDataURL(dataURL) {
  const parts = dataURL.split(',');
  return parts.length > 1 ? parts[1] : '';
}

// Extract text from DOCX file
async function extractTextFromDOCX(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value?.trim() || 'DOCX file uploaded successfully.';
  } catch (error) {
    console.error('DOCX extraction failed:', error);
    return 'DOCX text extraction failed.';
  }
}

// Demo text for PDF file
async function extractTextFromPDF() {
  return 'PDF file uploaded successfully. Text extraction is disabled in demo mode.';
}

// Demo text for image file
async function extractTextFromImage() {
  return 'Image file uploaded successfully. OCR extraction is disabled in demo mode.';
}

// Create short summary from content
function generateSummary(fileName, content) {
  const cleaned = (content || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return `File uploaded successfully: ${fileName}`;
  if (cleaned.length <= 160) return cleaned;
  return `${cleaned.slice(0, 160)}...`;
}

// Decide file category
function generateCategory(fileName, fileType, content) {
  const lowerName = fileName.toLowerCase();
  const lowerType = (fileType || '').toLowerCase();
  const lowerContent = (content || '').toLowerCase();

  if (lowerType.startsWith('image/')) return 'Images';

  if (
    lowerName.endsWith('.js') ||
    lowerName.endsWith('.jsx') ||
    lowerName.endsWith('.ts') ||
    lowerName.endsWith('.tsx') ||
    lowerName.endsWith('.py') ||
    lowerName.endsWith('.java') ||
    lowerName.endsWith('.cpp') ||
    lowerName.endsWith('.c') ||
    lowerName.endsWith('.html') ||
    lowerName.endsWith('.css') ||
    lowerName.endsWith('.json')
  ) {
    return 'Code';
  }

  if (
    lowerName.endsWith('.ppt') ||
    lowerName.endsWith('.pptx') ||
    lowerName.endsWith('.doc') ||
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.pdf')
  ) {
    if (
      lowerContent.includes('assignment') ||
      lowerContent.includes('college') ||
      lowerContent.includes('semester') ||
      lowerContent.includes('project') ||
      lowerContent.includes('experiment') ||
      lowerContent.includes('introduction')
    ) {
      return 'Education';
    }

    if (
      lowerContent.includes('invoice') ||
      lowerContent.includes('payment') ||
      lowerContent.includes('balance') ||
      lowerContent.includes('bank')
    ) {
      return 'Finance';
    }

    return 'Documents';
  }

  if (
    lowerContent.includes('invoice') ||
    lowerContent.includes('amount') ||
    lowerContent.includes('bank') ||
    lowerContent.includes('payment') ||
    lowerContent.includes('balance')
  ) {
    return 'Finance';
  }

  if (
    lowerContent.includes('meeting') ||
    lowerContent.includes('client') ||
    lowerContent.includes('company') ||
    lowerContent.includes('deadline') ||
    lowerContent.includes('report')
  ) {
    return 'Work';
  }

  if (
    lowerContent.includes('study') ||
    lowerContent.includes('notes') ||
    lowerContent.includes('exam') ||
    lowerContent.includes('lab')
  ) {
    return 'Education';
  }

  if (lowerName.endsWith('.txt') || lowerName.endsWith('.md') || lowerName.endsWith('.csv')) {
    return 'Documents';
  }

  return 'Other';
}

// Create small tags for file
function generateTags(fileName, fileType, category, content) {
  const lowerName = fileName.toLowerCase();
  const lowerContent = (content || '').toLowerCase();
  const tags = new Set();

  tags.add(category.toLowerCase());

  if (fileType.startsWith('image/')) tags.add('image');
  if (lowerName.endsWith('.pdf')) tags.add('pdf');
  if (lowerName.endsWith('.docx')) tags.add('docx');
  if (lowerName.endsWith('.pptx')) tags.add('pptx');
  if (lowerName.endsWith('.txt')) tags.add('text');
  if (lowerName.endsWith('.json')) tags.add('json');
  if (lowerName.endsWith('.csv')) tags.add('csv');

  if (lowerContent.includes('project')) tags.add('project');
  if (lowerContent.includes('report')) tags.add('report');
  if (lowerContent.includes('analysis')) tags.add('analysis');
  if (lowerContent.includes('assignment')) tags.add('assignment');

  return Array.from(tags).slice(0, 5);
}

// Create keywords for search
function generateKeywords(fileName, category, content) {
  const words = (content || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 4);

  const countMap = {};
  for (const word of words) {
    countMap[word] = (countMap[word] || 0) + 1;
  }

  const commonWords = Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  return [fileName, category.toLowerCase(), ...commonWords].slice(0, 6);
}

// Return file icon based on type
function getFileIcon(type, name = '') {
  const lowerName = name.toLowerCase();

  if (type.startsWith('image/')) {
    return <Image className="w-5 h-5 text-blue-500" />;
  }

  if (type === 'application/pdf' || lowerName.endsWith('.pdf')) {
    return <FileText className="w-5 h-5 text-red-500" />;
  }

  if (
    type.includes('word') ||
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.doc')
  ) {
    return <FileText className="w-5 h-5 text-blue-600" />;
  }

  if (
    type.includes('presentation') ||
    lowerName.endsWith('.pptx') ||
    lowerName.endsWith('.ppt')
  ) {
    return <FileType className="w-5 h-5 text-orange-500" />;
  }

  if (type.startsWith('text/')) {
    return <FileText className="w-5 h-5 text-gray-600" />;
  }

  return <File className="w-5 h-5 text-gray-500" />;
}

export default function AIFileManager() {
  // Store all files
  const [files, setFiles] = useState([]);

  // Store search text
  const [searchQuery, setSearchQuery] = useState('');

  // Store selected category
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Show loading state
  const [isProcessing, setIsProcessing] = useState(false);

  // Store file opened in modal
  const [viewingFile, setViewingFile] = useState(null);

  // Store search result info
  const [searchResults, setSearchResults] = useState(null);

  // Show status message
  const [statusMessage, setStatusMessage] = useState('');

  // Load saved files when app opens
  useEffect(() => {
    try {
      const storedFiles = localStorage.getItem(STORAGE_KEY);
      if (storedFiles) {
        setFiles(JSON.parse(storedFiles));
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  }, []);

  // Save updated files to local storage
  const saveFiles = (updatedFiles) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
      setFiles(updatedFiles);
    } catch (error) {
      console.error('Failed to save files:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files || []);
    if (!uploadedFiles.length) return;

    setIsProcessing(true);
    setStatusMessage('Processing files...');

    const processedFiles = [];

    for (const file of uploadedFiles) {
      try {
        setStatusMessage(`Reading ${file.name}...`);

        const dataURL = await readFileAsDataURL(file);
        const base64Data = extractBase64FromDataURL(dataURL);

        let extractedContent = '';
        const fileType = file.type || '';
        const fileName = file.name || '';

        // Read content based on file type
        if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
          extractedContent = await extractTextFromPDF();
        } else if (
          fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          fileName.toLowerCase().endsWith('.docx')
        ) {
          extractedContent = await extractTextFromDOCX(file);
        } else if (
          fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
          fileName.toLowerCase().endsWith('.pptx')
        ) {
          extractedContent = `Presentation file uploaded: ${file.name}`;
        } else if (
          fileType.startsWith('text/') ||
          fileName.toLowerCase().endsWith('.txt') ||
          fileName.toLowerCase().endsWith('.md') ||
          fileName.toLowerCase().endsWith('.csv') ||
          fileName.toLowerCase().endsWith('.json') ||
          fileName.toLowerCase().endsWith('.js') ||
          fileName.toLowerCase().endsWith('.jsx') ||
          fileName.toLowerCase().endsWith('.py') ||
          fileName.toLowerCase().endsWith('.html') ||
          fileName.toLowerCase().endsWith('.css')
        ) {
          extractedContent = await readFileAsText(file);
        } else if (fileType.startsWith('image/')) {
          extractedContent = await extractTextFromImage();
        } else {
          extractedContent = `File uploaded: ${file.name}`;
        }

        // Create file details
        const category = generateCategory(fileName, fileType, extractedContent);
        const tags = generateTags(fileName, fileType, category, extractedContent);
        const summary = generateSummary(fileName, extractedContent);
        const keywords = generateKeywords(fileName, category, extractedContent);

        const fileData = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size || 0,
          uploadDate: new Date().toISOString(),
          base64: base64Data,
          content: extractedContent,
          category,
          tags,
          summary,
          keywords,
        };

        processedFiles.push(fileData);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
      }
    }

    const updatedFiles = [...files, ...processedFiles];
    saveFiles(updatedFiles);

    setIsProcessing(false);
    setStatusMessage('');
    event.target.value = '';
  };

  // Handle file search
  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setSearchResults(null);
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Searching files...');

    const matches = files.filter((file) => {
      const nameMatch = file.name.toLowerCase().includes(query);
      const contentMatch = (file.content || '').toLowerCase().includes(query);
      const summaryMatch = (file.summary || '').toLowerCase().includes(query);
      const tagsMatch = (file.tags || []).some((tag) => tag.toLowerCase().includes(query));
      const keywordsMatch = (file.keywords || []).some((keyword) =>
        keyword.toLowerCase().includes(query)
      );

      return nameMatch || contentMatch || summaryMatch || tagsMatch || keywordsMatch;
    });

    setSearchResults({
      query: searchQuery,
      matches,
      count: matches.length,
    });

    setStatusMessage(matches.length ? `Found ${matches.length} matching file(s)` : 'No matching files found');
    setTimeout(() => setStatusMessage(''), 2500);
    setIsProcessing(false);
  };

  // Delete selected file
  const deleteFile = (fileId) => {
    const updatedFiles = files.filter((file) => file.id !== fileId);
    saveFiles(updatedFiles);

    if (viewingFile?.id === fileId) {
      setViewingFile(null);
    }
  };

  // Download original file
  const downloadFile = (file) => {
    const blob = new Blob(
      [Uint8Array.from(atob(file.base64), (char) => char.charCodeAt(0))],
      { type: file.type }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.name;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  // Filter files by category
  const filteredFiles = useMemo(() => {
    const baseFiles = selectedCategory === 'all'
      ? files
      : files.filter((file) => file.category === selectedCategory);

    if (!searchResults || !searchQuery.trim()) {
      return baseFiles;
    }

    const matchIds = new Set(searchResults.matches.map((file) => file.id));
    return baseFiles.filter((file) => matchIds.has(file.id));
  }, [files, selectedCategory, searchResults, searchQuery]);

  // Create category button list
  const categories = useMemo(() => {
    const dynamicCategories = Array.from(new Set(files.map((file) => file.category)));
    const orderedCategories = CATEGORY_ORDER.filter(
      (category) => category === 'all' || dynamicCategories.includes(category)
    );

    const extraCategories = dynamicCategories.filter(
      (category) => !CATEGORY_ORDER.includes(category)
    );

    return [...orderedCategories, ...extraCategories];
  }, [files]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* App title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">AI File Organizer</h1>
          <p className="text-gray-600 text-sm">
            Smart file upload, search, preview, download and management
          </p>
        </div>

        {/* Upload and search section */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <label className="flex items-center justify-center gap-3 p-6 bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 transition-all cursor-pointer group shadow-sm">
            <Upload className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-gray-700 font-medium">Upload Files</span>
            <input
              type="file"
              multiple
              accept="image/*,text/*,.txt,.md,.csv,.json,.html,.css,.js,.pdf,.doc,.docx,.ppt,.pptx,.py"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isProcessing}
            />
          </label>

          <div className="flex gap-2">
            {/* Search input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
              placeholder="Search files by name, content, tags or keywords..."
              className="flex-1 px-4 py-3 bg-white rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-sm"
              disabled={isProcessing}
            />

            {/* Search button */}
            <button
              onClick={handleSearch}
              disabled={isProcessing}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-xl text-white font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading and status message */}
        {statusMessage && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-3 shadow-sm">
            <Loader2 className={`w-5 h-5 text-blue-600 ${isProcessing ? 'animate-spin' : ''}`} />
            <span className="text-blue-800">{statusMessage}</span>
          </div>
        )}

        {/* Category filter buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <Folder className="w-4 h-4 inline mr-2" />
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Search result info */}
        {searchResults && searchQuery.trim() && (
          <div className="mb-4 text-sm text-gray-600">
            Search results for <span className="font-semibold">"{searchResults.query}"</span>: {searchResults.count} file(s)
          </div>
        )}

        {/* Empty state */}
        {filteredFiles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-20">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No files found</p>
          </div>
        ) : (
          /* File cards */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(file.type, file.name)}
                    <span className="text-gray-800 font-medium truncate">{file.name}</span>
                  </div>

                  <div className="flex gap-1">
                    {/* Open file button */}
                    <button
                      onClick={() => setViewingFile(file)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Open file"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>

                    {/* Delete file button */}
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* File summary */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{file.summary}</p>

                {/* File tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {(file.tags || []).slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* File details */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{formatDate(file.uploadDate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* File preview modal */}
        {viewingFile && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">{viewingFile.name}</h3>

                {/* Close modal button */}
                <button
                  onClick={() => setViewingFile(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 overflow-auto max-h-[calc(90vh-100px)]">
                <div className="mb-4 flex gap-2 flex-wrap">
                  {/* Download file button */}
                  <button
                    onClick={() => downloadFile(viewingFile)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </button>

                  {/* Delete file from modal */}
                  <button
                    onClick={() => deleteFile(viewingFile.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete File
                  </button>
                </div>

                {/* Image preview */}
                {viewingFile.type.startsWith('image/') && (
                  <img
                    src={`data:${viewingFile.type};base64,${viewingFile.base64}`}
                    alt={viewingFile.name}
                    className="w-full rounded-lg mb-4 border border-gray-200"
                  />
                )}

                {/* PDF preview */}
                {(viewingFile.type === 'application/pdf' ||
                  viewingFile.name.toLowerCase().endsWith('.pdf')) && (
                  <div className="mb-4">
                    <div className="mb-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">PDF preview</p>
                    </div>
                    <iframe
                      src={`data:${viewingFile.type};base64,${viewingFile.base64}`}
                      className="w-full h-96 rounded-lg border border-gray-300"
                      title={viewingFile.name}
                    />
                  </div>
                )}

                {/* Text file preview */}
                {viewingFile.type.startsWith('text/') && (
                  <div className="mb-4">
                    <h4 className="text-blue-600 font-semibold mb-2">File Content</h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <pre className="text-gray-700 text-sm whitespace-pre-wrap font-mono">
                        {atob(viewingFile.base64)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* File summary section */}
                <div className="mb-4">
                  <h4 className="text-blue-600 font-semibold mb-2">Summary</h4>
                  <p className="text-gray-700">{viewingFile.summary}</p>
                </div>

                {/* Category and tags section */}
                <div className="mb-4">
                  <h4 className="text-blue-600 font-semibold mb-2">Category and Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                      {viewingFile.category}
                    </span>
                    {(viewingFile.tags || []).map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Extracted content section */}
                {viewingFile.content && (
                  <div>
                    <h4 className="text-blue-600 font-semibold mb-2">Extracted Content</h4>
                    <pre className="text-gray-700 text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                      {viewingFile.content}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Keep category order neat in UI
const CATEGORY_ORDER = [
  'all',
  'Documents',
  'Images',
  'Work',
  'Personal',
  'Finance',
  'Education',
  'Design',
  'Code',
  'Other',
];