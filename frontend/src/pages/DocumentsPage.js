import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload, File, Trash2, Tag, FileText, Search, Filter, Loader } from 'lucide-react';

const CATEGORIES = ['general', 'faq', 'manual', 'policy', 'ticket'];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [uploadForm, setUploadForm] = useState({
    title: '', category: 'general', language: 'en', tags: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (searchTerm) params.search = searchTerm;
      const res = await axios.get('/documents', { params });
      setDocuments(res.data.documents || []);
    } catch (err) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, [filterCategory]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles[0]) {
      setSelectedFile(acceptedFiles[0]);
      setUploadForm(f => ({ ...f, title: acceptedFiles[0].name.replace(/\.[^/.]+$/, '') }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'], 'text/markdown': ['.md'] },
    maxSize: 10 * 1024 * 1024, multiple: false
  });

  const handleUpload = async () => {
    if (!selectedFile) return toast.error('Please select a file');
    if (!uploadForm.title.trim()) return toast.error('Please enter a title');
    setUploading(true);
    const formData = new FormData();
    formData.append('document', selectedFile);
    Object.entries(uploadForm).forEach(([k, v]) => formData.append(k, v));
    try {
      await axios.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document uploaded and processed!');
      setSelectedFile(null);
      setUploadForm({ title: '', category: 'general', language: 'en', tags: '' });
      fetchDocuments();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await axios.delete(`/documents/${id}`);
      toast.success('Document deleted');
      fetchDocuments();
    } catch { toast.error('Delete failed'); }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="documents-page">
      <div className="page-header">
        <h1>Knowledge Base Documents</h1>
        <p>Upload and manage documents for the AI chatbot</p>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <h2><Upload size={18} /> Upload New Document</h2>
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''} ${selectedFile ? 'has-file' : ''}`}>
          <input {...getInputProps()} />
          {selectedFile ? (
            <div className="file-selected">
              <File size={32} />
              <span>{selectedFile.name}</span>
              <small>{formatSize(selectedFile.size)}</small>
            </div>
          ) : (
            <div className="dropzone-content">
              <Upload size={32} />
              <p>{isDragActive ? 'Drop the file here' : 'Drag & drop or click to upload'}</p>
              <small>Supports: PDF, DOCX, TXT, MD • Max 10MB</small>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="upload-form">
            <input
              type="text" placeholder="Document Title *" className="form-input"
              value={uploadForm.title}
              onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
            />
            <div className="form-row">
              <select className="form-select" value={uploadForm.category}
                onChange={e => setUploadForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <select className="form-select" value={uploadForm.language}
                onChange={e => setUploadForm(f => ({ ...f, language: e.target.value }))}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="both">Both</option>
              </select>
            </div>
            <input
              type="text" placeholder="Tags (comma-separated, optional)" className="form-input"
              value={uploadForm.tags}
              onChange={e => setUploadForm(f => ({ ...f, tags: e.target.value }))}
            />
            <div className="upload-actions">
              <button className="btn-secondary" onClick={() => { setSelectedFile(null); }}>Cancel</button>
              <button className="btn-primary" onClick={handleUpload} disabled={uploading}>
                {uploading ? <><Loader size={16} className="spin" /> Processing...</> : <><Upload size={16} /> Upload</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="docs-section">
        <div className="docs-header">
          <h2><FileText size={18} /> Documents ({documents.length})</h2>
          <div className="docs-filters">
            <div className="search-box">
              <Search size={16} />
              <input type="text" placeholder="Search..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchDocuments()} />
            </div>
            <select className="form-select small" value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state"><Loader size={24} className="spin" /></div>
        ) : documents.length === 0 ? (
          <div className="empty-state">No documents found. Upload your first document above.</div>
        ) : (
          <div className="docs-grid">
            {documents.map(doc => (
              <div key={doc._id} className="doc-card">
                <div className="doc-icon">
                  <FileText size={24} />
                  <span className="doc-type">{doc.fileType?.toUpperCase()}</span>
                </div>
                <div className="doc-info">
                  <h3>{doc.title}</h3>
                  <div className="doc-meta">
                    <span className={`category-badge ${doc.category}`}>{doc.category}</span>
                    <span>{formatSize(doc.fileSize)}</span>
                    <span>{doc.queryCount} queries</span>
                  </div>
                  {doc.tags?.length > 0 && (
                    <div className="doc-tags">
                      <Tag size={12} />
                      {doc.tags.map(t => <span key={t} className="tag">{t}</span>)}
                    </div>
                  )}
                </div>
                <button className="delete-btn" onClick={() => handleDelete(doc._id)}
                  title="Delete document">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
