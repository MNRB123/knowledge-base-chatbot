const fs = require('fs');
const path = require('path');

async function parseDocument(filePath, fileType) {
  const content = fs.readFileSync(filePath);
  
  switch (fileType) {
    case 'txt':
    case 'md':
      return fs.readFileSync(filePath, 'utf-8');
    
    case 'pdf': {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(content);
      return data.text;
    }
    
    case 'docx': {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }
    
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

function getFileType(originalName) {
  const ext = path.extname(originalName).toLowerCase().replace('.', '');
  const validTypes = ['pdf', 'docx', 'txt', 'md'];
  if (!validTypes.includes(ext)) {
    throw new Error(`Unsupported file type. Allowed: ${validTypes.join(', ')}`);
  }
  return ext;
}

module.exports = { parseDocument, getFileType };
