# 📂 File Upload System - Security Documentation

## 🔒 Security Features Implemented

### 1. **Malicious File Protection**
- ✅ **Whitelist Approach**: Only explicitly allowed file types are accepted
- ✅ **Dangerous Extension Blocking**: 44+ dangerous file extensions blocked (exe, bat, sh, js, dll, etc.)
- ✅ **MIME Type Validation**: Validates both file extension AND MIME type
- ✅ **Null Byte Detection**: Prevents null byte injection attacks
- ✅ **Directory Traversal Prevention**: Sanitizes filenames to prevent path manipulation

### 2. **File Type Categories**
Each category has specific size limits and allowed formats:

**Images**
- Allowed: jpg, jpeg, png, gif, webp
- Max Size: 5MB
- Use Case: Profile pictures, course images

**Documents**
- Allowed: pdf, doc, docx, txt, rtf, odt
- Max Size: 10MB
- Use Case: Assignments, course materials

**Videos**
- Allowed: mp4, webm, ogg
- Max Size: 100MB
- Use Case: Course lectures, tutorials

**Spreadsheets**
- Allowed: xls, xlsx, csv
- Max Size: 10MB
- Use Case: Student data, grades

**Presentations**
- Allowed: ppt, pptx
- Max Size: 20MB
- Use Case: Course materials

### 3. **Filename Security**
- Random 16-byte hex string + timestamp
- Original filename sanitized and stored separately
- No special characters or path separators allowed
- Example: `1704123456789-a3f2c8d9e1b4f5g6.pdf`

### 4. **Rate Limiting**
- 10 requests per hour per IP for upload endpoints
- Prevents DoS attacks via massive uploads

### 5. **Organized Storage Structure**
```
uploads/
├── documents/          # General documents
├── images/            # General images
├── videos/            # Video files
├── profile-pictures/  # User profile pictures
├── course-materials/  # Course content (mixed types)
├── assignments/       # Student assignments
└── temp/              # Temporary files (auto-cleanup)
```

### 6. **Automatic Cleanup**
- Temporary files older than 24 hours are auto-deleted
- Runs every 6 hours

## 📡 API Endpoints

All endpoints require authentication (`Authorization: Bearer <token>`)

### 1. Upload Profile Picture
```http
POST /api/upload/profile-picture
Content-Type: multipart/form-data

{
  "profilePicture": <file>
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "file": {
    "filename": "1704123456789-abc123.jpg",
    "originalName": "my_photo.jpg",
    "mimetype": "image/jpeg",
    "size": 245678,
    "path": "/uploads/profile-pictures/1704123456789-abc123.jpg"
  }
}
```

### 2. Upload Image
```http
POST /api/upload/image
Content-Type: multipart/form-data

{
  "image": <file>
}
```

### 3. Upload Document
```http
POST /api/upload/document
Content-Type: multipart/form-data

{
  "document": <file>
}
```

### 4. Upload Video
```http
POST /api/upload/video
Content-Type: multipart/form-data

{
  "video": <file>
}
```

### 5. Upload Course Materials (Multiple Files)
```http
POST /api/upload/course-material
Content-Type: multipart/form-data

{
  "courseMaterials": [<file1>, <file2>, <file3>]
}
```
- Max 5 files per request
- Accepts documents, images, videos, presentations

### 6. Upload Assignment Files (Multiple Documents)
```http
POST /api/upload/assignment
Content-Type: multipart/form-data

{
  "assignmentFiles": [<file1>, <file2>, <file3>]
}
```
- Max 3 files per request
- Documents only

### 7. Delete File
```http
DELETE /api/upload/delete
Content-Type: application/json

{
  "filename": "1704123456789-abc123.jpg",
  "category": "profile-pictures"
}
```

## 🛡️ Security Best Practices

### ✅ What We Do
1. **File Type Validation**: Check both extension and MIME type
2. **Size Limits**: Different limits for different file types
3. **Filename Sanitization**: Remove dangerous characters
4. **Secure Random Names**: Prevent filename conflicts and guessing
5. **Rate Limiting**: Prevent abuse
6. **Organized Storage**: Separate folders for different purposes
7. **Error Handling**: Detailed error messages without exposing system info

### ⚠️ Blocked Attack Vectors
- ❌ Executable file uploads (.exe, .bat, .sh)
- ❌ Script file uploads (.js, .vbs, .ps1)
- ❌ Directory traversal (../../etc/passwd)
- ❌ Null byte injection (file.pdf\0.exe)
- ❌ Oversized files (beyond limits)
- ❌ Unauthorized MIME types
- ❌ Multiple extensions (.pdf.exe)

## 🔧 Advanced Configuration

### Custom Upload Middleware
```javascript
const { createUploadMiddleware } = require('../middleware/fileUploadMiddleware');

// Custom configuration
const customUpload = createUploadMiddleware({
  category: 'documents',  // File type category
  maxFiles: 5,            // Max number of files
  fieldName: 'myFiles'    // Form field name
});

router.post('/custom-upload', authenticate, customUpload, (req, res) => {
  // Handle upload
});
```

## 📊 Monitoring & Logging

All file operations are logged with:
- User ID
- Filename (original and secure)
- File size
- MIME type
- Upload timestamp
- IP address

## 🚀 Accessing Uploaded Files

Files are served statically via:
```
http://localhost:5000/uploads/<category>/<filename>
```

Examples:
- `http://localhost:5000/uploads/profile-pictures/1704123456789-abc123.jpg`
- `http://localhost:5000/uploads/documents/1704123456789-def456.pdf`

## 🔄 Integration with Frontend

### Example: Upload Profile Picture
```javascript
const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  
  try {
    const response = await axios.post(
      'http://localhost:5000/api/upload/profile-picture',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Upload success:', response.data);
    // Use response.data.file.path to display the image
  } catch (error) {
    console.error('Upload failed:', error.response.data);
  }
};
```

## ⚡ Error Handling

### Common Errors
```json
// File too large
{
  "success": false,
  "message": "File size too large",
  "error": "File size 6.5MB exceeds maximum allowed size of 5MB"
}

// Invalid file type
{
  "success": false,
  "message": "File upload error",
  "error": "File extension .exe is not allowed"
}

// Dangerous file detected
{
  "success": false,
  "message": "File upload error",
  "error": "Dangerous file type not allowed"
}
```

## 🔐 Future Enhancements (Optional)

### 1. Virus Scanning
Integrate ClamAV or VirusTotal API:
```javascript
const scanFile = async (filePath) => {
  // Scan file for malware
  // Delete if infected
};
```

### 2. Image Processing
Add sharp library for image optimization:
```bash
npm install sharp
```

### 3. Cloud Storage
Integrate AWS S3 or Azure Blob Storage for scalability

### 4. File Encryption
Encrypt sensitive files at rest

## 📝 Testing

### Test File Upload Security
```bash
# Try uploading executable (should fail)
curl -X POST http://localhost:5000/api/upload/document \
  -H "Authorization: Bearer <token>" \
  -F "document=@malicious.exe"

# Try uploading oversized file (should fail)
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer <token>" \
  -F "image=@huge_image.jpg"

# Try uploading valid PDF (should succeed)
curl -X POST http://localhost:5000/api/upload/document \
  -H "Authorization: Bearer <token>" \
  -F "document=@report.pdf"
```

## ✅ Security Checklist

- [x] File type whitelist implemented
- [x] Dangerous extensions blocked
- [x] MIME type validation
- [x] File size limits
- [x] Filename sanitization
- [x] Secure random filenames
- [x] Rate limiting on upload endpoints
- [x] Authentication required
- [x] Organized storage structure
- [x] Error handling without info leakage
- [x] Automatic temp file cleanup
- [ ] Virus scanning (optional - requires external service)
- [ ] Image optimization (optional - requires sharp)
- [ ] Cloud storage integration (optional)

## 🎯 Summary

This file upload system provides **production-grade security** against malicious file uploads while maintaining ease of use for legitimate users. The multi-layered approach ensures that even if one security measure is bypassed, others will catch the attack.
