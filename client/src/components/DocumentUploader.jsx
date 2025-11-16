import React, { useState, useRef, useEffect } from 'react';
import api from '../api/api';
import '../document-uploader.css'; // adjust path if needed

const DocumentUploader = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summaryLength, setSummaryLength] = useState('medium'); // 'short' | 'medium' | 'long'

  const summaryRef = useRef(null);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files && e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setSummary('');
    setRawText('');
    setError('');

    try {
      const result = await api.uploadAndSummarize(file, summaryLength);
      setSummary(result.summary || '');
      setRawText(result.raw_text || '');
    } catch (err) {
      setError(err?.message || 'An unknown error occurred during summarization.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const el = summaryRef.current;
    if (!el) return;

    if (summary) {
      el.classList.add('visible');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      el.classList.remove('visible');
    }
  }, [summary]);

  // Helper: split text into newline paragraphs (trimmed, non-empty)
  const splitByNewlines = (text) =>
    (text || '')
      .split(/\r?\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

  // Helper: split by sentence boundaries (keeps punctuation)
  const splitToSentences = (text) => {
    if (!text) return [];
    
    const sentences = text
      .replace(/\r?\n+/g, ' ')
      .split(/(?<=[.?!])\s+(?=[A-Z0-9"“‘'()])/g)
      .map((s) => s.trim())
      .filter(Boolean);
    
    if (sentences.length === 1) {
      return text
        .replace(/\r?\n+/g, ' ')
        .split(/(?<=[.?!])/g)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return sentences;
  };

  
  const chunkSentences = (sentences, n) => {
    const total = sentences.length;
    if (total === 0) return Array.from({ length: n }, () => []).slice(0, Math.max(1, Math.min(n, total)));
    const base = Math.floor(total / n);
    const remainder = total % n;
    const chunks = [];
    let idx = 0;
    for (let i = 0; i < n; i++) {
      const take = base + (i < remainder ? 1 : 0);
      if (take <= 0) {
        chunks.push([]);
      } else {
        chunks.push(sentences.slice(idx, idx + take));
        idx += take;
      }
    }
    return chunks;
  };

  // Main paragraph generator:
  const paragraphsFrom = (text) => {
    const preferNewlines = splitByNewlines(text);
    let desired = 1;
    if (summaryLength === 'medium') desired = 2;
    if (summaryLength === 'long') desired = 3;

    
    if (preferNewlines.length >= desired) {
      return preferNewlines.slice(0, desired);
    }

    
    const sentences = splitToSentences(text);
    if (sentences.length === 0) return [];

    
    if (sentences.length <= desired) {
      return sentences.map((s) => s);
    }

    const chunks = chunkSentences(sentences, desired);
    // Join sentences inside each chunk to form paragraph strings
    const paras = chunks
      .map((chunk) => chunk.join(' '))
      .map((p) => p.trim())
      .filter(Boolean);

  
    if (paras.length < desired) {
     
      const fallbackChunks = chunkSentences(sentences, Math.max(1, desired));
      return fallbackChunks.map((c) => c.join(' ').trim()).filter(Boolean).slice(0, desired);
    }

    return paras.slice(0, desired);
  };

  return (
    <div className="document-container">
      <h1 className="document-title">Document Summary Assistant 📄</h1>

      <form onSubmit={handleSubmit} className="upload-form">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="drop-zone"
        >
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            accept=".pdf,image/jpeg,image/png"
            className="file-input"
          />
          <label htmlFor="file-upload" className="file-label">
            {file ? `File Selected: ${file.name}` : 'Click or Drag & Drop PDF/Image files here'}
          </label>
        </div>

        <div className="summary-options">
          <label htmlFor="summary-length">Summary Length:</label>
          <select
            id="summary-length"
            value={summaryLength}
            onChange={(e) => setSummaryLength(e.target.value)}
            className="summary-select"
          >
            <option value="short">Short (1 paragraph)</option>
            <option value="medium">Medium (2 paragraphs)</option>
            <option value="long">Long (3 paragraphs)</option>
          </select>
        </div>

        <button type="submit" disabled={!file || loading} className="submit-button">
          {loading ? 'Processing Document...' : 'Generate Summary'}
        </button>
      </form>

      {error && <p className="error-message">Error: {error}</p>}

      <div
        ref={summaryRef}
        className={`summary-section${summary ? ' visible' : ''}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {summary ? (
          <>
            <h2 className="summary-header">Summary 💡</h2>
            <div className="summary-text">
              {paragraphsFrom(summary).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <h2 className="summary-header">Raw Extracted Text</h2>
            <div className="raw-text">
              {/* For raw text show up to desired paragraphs too (keeps UI consistent) */}
              {paragraphsFrom(rawText).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </>
        ) : (
          <p className="summary-placeholder">No summary yet — upload a file and click “Generate Summary”.</p>
        )}
      </div>

      {loading && <p className="loading-message">Processing Document...</p>}
    </div>
  );
};

export default DocumentUploader;
